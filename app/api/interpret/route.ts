import { NextRequest, NextResponse, connection } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { ParsedIntent, Scenario, UrgencyMode } from "@/lib/types";
import { SCENARIO_META } from "@/lib/ai/intentParser";
import { saveSession } from "@/lib/db/sessions";
import { getS3Client, getS3Bucket } from "@/lib/storage/s3Client";
import { generateCart, generateInitialSelections } from "@/lib/ai/cartGenerator";

// ─── Session cookie config ────────────────────────────────────────
const SESSION_COOKIE = "ic_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Rate Limiting ────────────────────────────────────────────────
// Simple in-memory rate limiter (10 req/min per IP).
// Note: in a serverless environment each Lambda instance has its own memory,
// so this provides a best-effort guard — not a hard guarantee at scale.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true };
  }

  if (entry.count >= 10) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// ─── Bedrock client — created lazily to avoid module-level throw ──────────────
function getBedrockClient(): BedrockRuntimeClient {
  const accessKeyId = process.env.BEDROCK_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BEDROCK_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "[/api/interpret] BEDROCK_ACCESS_KEY_ID and BEDROCK_SECRET_ACCESS_KEY are required. " +
        "Set them in .env.local or Amplify environment variables."
    );
  }
  return new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION ?? "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getModelId(): string {
  return process.env.BEDROCK_MODEL_ID ?? "us.amazon.nova-2-lite-v1:0";
}

// ─── Image format detection ───────────────────────────────────────
type ImageFormat = "jpeg" | "png" | "webp" | "gif";

function detectImageFormat(contentType: string, s3Key: string): ImageFormat {
  if (contentType.includes("png") || s3Key.endsWith(".png")) return "png";
  if (contentType.includes("webp") || s3Key.endsWith(".webp")) return "webp";
  if (contentType.includes("gif") || s3Key.endsWith(".gif")) return "gif";
  return "jpeg"; // default
}

// ─── Fetch image bytes from S3 (server-side) ─────────────────────
// Returns null if fetch fails (non-fatal — caller falls back to text-only).
async function fetchImageFromS3(
  s3Key: string
): Promise<{ bytes: Uint8Array; format: ImageFormat } | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: s3Key,
    });

    const response = await getS3Client().send(command);

    if (!response.Body) {
      console.warn("[interpret] S3 GetObject: empty body for key:", s3Key);
      return null;
    }

    // Collect stream chunks into a single Uint8Array
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    }

    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const format = detectImageFormat(response.ContentType ?? "", s3Key);
    console.log(
      `[interpret] Multimodal: fetched ${merged.length} bytes (${format}) from S3 key: ${s3Key}`
    );
    return { bytes: merged, format };
  } catch (err) {
    // Non-fatal: log and continue with text-only parsing
    console.error(
      "[interpret] Failed to fetch image from S3 — falling back to text-only:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

// ─── Time-of-day context ──────────────────────────────────────────
/**
 * Returns a concise time context string for the Bedrock prompt.
 * Uses IST (UTC+5:30) since the app targets India.
 */
function buildTimeContext(): string {
  const now = new Date();
  // Convert to IST by adding 5h30m offset
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  const hour = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} IST`;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[ist.getUTCDay()];
  const isWeekend = ist.getUTCDay() === 0 || ist.getUTCDay() === 6;

  let period: string;
  let hint: string;
  if (hour >= 5 && hour < 9) {
    period = "early morning";
    hint = "morning routine, tea/coffee prep, school prep likely";
  } else if (hour >= 9 && hour < 12) {
    period = "late morning";
    hint = "cooking, grocery restocking, home chores likely";
  } else if (hour >= 12 && hour < 14) {
    period = "midday";
    hint = "lunch prep, cooking essentials likely";
  } else if (hour >= 14 && hour < 17) {
    period = "afternoon";
    hint = "tea break, snacks, school project likely";
  } else if (hour >= 17 && hour < 20) {
    period = "evening";
    hint = "hosting guests, pooja rituals, dinner prep likely";
  } else if (hour >= 20 && hour < 23) {
    period = "night";
    hint = "late dinner, medicine/fever care, power emergency likely";
  } else {
    period = "late night";
    hint = "emergency, fever care, or power outage most likely";
  }

  return `Current time: ${timeStr} (${dayName}, ${period}${isWeekend ? ", weekend" : ""}). Time hint: ${hint}.`;
}

// ─── Weather context (from client-provided signals) ───────────────
interface ClientContextSignals {
  location?: { city: string; region: string; lat: number; lon: number } | null;
  weather?: {
    tempC: number;
    condition: string;
    conditionLabel: string;
    precipMmPerHr: number;
    city: string;
    region: string;
    isExtreme: boolean;
  } | null;
}

function buildWeatherContext(signals: ClientContextSignals): string {
  const { weather, location } = signals;
  if (!weather && !location) return "";

  const parts: string[] = [];

  if (location) {
    parts.push(`User location: ${location.city}${location.region ? `, ${location.region}` : ""}.`);
  }

  if (weather) {
    const precipStr =
      weather.precipMmPerHr > 0 ? ` (${weather.precipMmPerHr}mm/hr)` : "";
    parts.push(
      `Current weather: ${weather.conditionLabel}${precipStr}, ${weather.tempC}°C` +
        (weather.city && !location ? ` in ${weather.city}` : "") +
        "."
    );

    // Derive scenario hints from weather
    const hints: string[] = [];
    if (["rain", "heavy_rain", "storm"].includes(weather.condition)) {
      hints.push("rainy day and power_cut scenarios are elevated");
      hints.push("fever risk is higher in wet weather");
    }
    if (weather.condition === "storm") {
      hints.push("power_cut scenario is very likely");
    }
    if (weather.condition === "hot" || weather.tempC >= 38) {
      hints.push("heat wave — ORS, cold drinks, and cooling items are relevant");
    }
    if (weather.condition === "cold" || weather.tempC <= 10) {
      hints.push("cold weather — warm beverages, blankets, and fever care are relevant");
    }
    if (weather.condition === "fog") {
      hints.push("foggy conditions — travel preparations may be relevant");
    }
    if (hints.length > 0) {
      parts.push(`Weather signals: ${hints.join("; ")}.`);
    }
  }

  return parts.join(" ");
}
/**
 * Builds a concise recent-orders string for the Bedrock prompt.
 * Receives the last 1-2 situationTexts passed by the client.
 */
function buildRecentOrdersContext(recentOrders: string[]): string {
  if (!recentOrders || recentOrders.length === 0) return "";
  const lines = recentOrders
    .slice(0, 2)
    .map((t, i) => `  - ${i === 0 ? "Most recent" : "Previous"}: "${t.slice(0, 120)}"`)
    .join("\n");
  return `User's recent order situations (for context — only use if relevant to current request):\n${lines}`;
}

// ─── System prompt builder ────────────────────────────────────────

// Annotated schema shown to the model. Using comments (not inline prose)
// so the structure is unambiguous and the model can't confuse description
// text for output values.
const JSON_SCHEMA = `Return ONLY this JSON object, no markdown, no explanation:
{
  "scenario": "<one of the scenario keys listed in Rules>",
  "scenarioLabel": "<short human-readable name, e.g. Fever Care>",
  "urgency": "<High | Medium | Low>",
  "category": "<primary product category, e.g. Health & Medicine>",
  "confidence": <integer 0-100>,
  "summary": "<short phrase: what is happening, title-case, e.g. Fever Care for Sick Child at Home>",
  "deliveryMode": "<fastest | value | trusted>",
  "suggestedItems": ["<item1>", "<item2>", "..."],
  "secondaryScenario": "<optional — only include if secondaryConfidence >= 30>",
  "secondaryConfidence": <optional integer 0-100>
}

Example output for scenario=fever:
{
  "scenario": "fever",
  "scenarioLabel": "Fever Care",
  "urgency": "High",
  "category": "Health & Medicine",
  "confidence": 94,
  "summary": "Fever Care for Sick Child at Home",
  "deliveryMode": "fastest",
  "suggestedItems": ["Paracetamol", "ORS", "Thermometer", "Tissues", "Honey"],
  "secondaryScenario": null,
  "secondaryConfidence": null
}`;

const BASE_RULES = `Valid scenario keys:
hosting, fever, pooja, rainy, travel, power_cut, school, tea_break, general,
cooking, home_repair, gifting, electronics, baby_care, personal_care, party,
pet_care, fitness, cleaning, breakfast, dairy, frozen_food, condiments, snacks,
staples, skincare, pest_control, instant_food, office

Rules:
- Return ONLY the JSON object. No other text.
- confidence: 90+ = very clear match, 70-89 = likely, 50-69 = uncertain. Use "general" when confidence < 50.

── SCENARIO DEFINITIONS ──────────────────────────────────────────────────────
- "hosting": guests are arriving at home, need tea/snacks/beverages for them — NOT gifting.
- "fever": someone is sick — need medicines, ORS, thermometer, comfort food.
- "pooja": Indian religious ritual — agarbatti, camphor, flowers, ghee, diya. Includes Navratri, Diwali puja, Ganpati.
- "rainy": stuck indoors because of rain — comfort mood (hot tea, maggi, bread, candles). The user is NOT explicitly ordering quick meals; it is the weather/mood driving the need.
- "travel": leaving soon / packing for a trip — water, snacks, sanitizer, charger.
- "power_cut": electricity outage — torch, batteries, candles, power bank.
- "school": children's school project deadline — pencils, colour pencils, Fevicol, scissors, drawing sheets. NOT adult office work.
- "tea_break": someone wants tea and snacks for a relaxing break — low urgency.
- "general": mixed or unclear everyday shopping — default when nothing else fits confidently.
- "cooking": user ran out of a specific ingredient MID-COOK or needs one particular item to finish a meal (oil, salt, onions, dal). The scope is narrow — one or two items needed RIGHT NOW for a meal in progress.
- "staples": user wants to restock the whole pantry — atta, rice, dal, oil, salt, sugar, masala powders. Bulk or monthly grocery restocking. DIFFERENT from cooking: staples = pantry-level, cooking = one missing ingredient.
- "home_repair": something is broken — bulb, fuse, tape, glue, screwdriver.
- "gifting": user wants to BUY GIFTS for someone — mentions 'gift', 'present', 'birthday gift', 'Diwali gift', 'for my mother/teacher/colleague'. DIFFERENT from hosting (which is for self/guests at home).
- "electronics": tech accessories — cables, chargers, earbuds, power banks, extension boards, SD cards, HDMI, mice, keyboards.
- "baby_care": diapers, baby wipes, baby shampoo, baby formula, feeding bottles — for a baby or infant.
- "personal_care": daily hygiene and grooming — shampoo, soap, face wash, toothpaste, moisturizer, deodorant, shaving, feminine hygiene. Does NOT include beauty serums, SPF sunscreen, or eye makeup.
- "skincare": beauty and skincare upgrade — sunscreen/SPF, vitamin C or niacinamide serums, micellar water, eye makeup (kajal), foundation, scrubs, night cream. DIFFERENT from personal_care which is daily hygiene basics.
- "party": birthday party, anniversary, celebration — balloons, banners, cake mix, party snacks, cold drinks.
- "pet_care": pet food, treats, accessories for dogs, cats, birds, or aquarium fish.
- "fitness": gym or workout — protein powder, creatine, protein bars, yoga mat, skipping rope.
- "cleaning": home cleaning session — floor cleaner, toilet cleaner, dishwash, detergent, scrubbers, room freshener, garbage bags.
- "breakfast": morning routine restocking — cereals, oats, muesli, bread, jam, Horlicks, Bournvita, upma mix, poha mix.
- "dairy": dairy replenishment — milk, butter, ghee, paneer, curd, cheese, eggs.
- "frozen_food": frozen snacks or frozen vegetables — McCain fries, frozen momos, nuggets, frozen paratha, frozen peas.
- "condiments": sauces, spreads — ketchup, mayo, soy sauce, schezwan, jam, peanut butter.
- "snacks": packaged munchies purchased independently — namkeen, chips, biscuits, chocolates, makhana, popcorn. NOT when snacks are part of a hosting or party situation.
- "pest_control": mosquito repellents, cockroach sprays, insect killers — Good Knight, HIT, Mortein, Odomos.
- "instant_food": user explicitly wants quick / ready-to-eat meals — Maggi, cup noodles, MTR/Haldiram's RTE packs, soup mixes. The driver is convenience, NOT weather. If weather is the driver, use "rainy".
- "office": adult work-from-home or office supplies — A4 paper, pens, sticky notes, stapler, whiteboard markers, printer ink. NOT children's school stationery.

── DISAMBIGUATION RULES ──────────────────────────────────────────────────────
- cooking vs staples: If the user mentions ONE or TWO missing items for a meal in progress → "cooking". If they mention buying atta/rice/dal/oil as a restock → "staples".
- personal_care vs skincare: Soap/shampoo/toothpaste/deodorant → "personal_care". Serums/SPF/kajal/scrubs → "skincare".
- rainy vs instant_food: Rain/stuck-at-home + mood for comfort food → "rainy". Explicit request for Maggi / RTE / quick meals without weather mention → "instant_food".
- school vs office: Children, project, craft materials → "school". Adults, printer paper, office work → "office".
- hosting vs gifting: Guests arriving at home → "hosting". Buying a gift for someone → "gifting".
- snacks vs hosting: Chips/namkeen bought casually → "snacks". Snacks specifically for arriving guests → "hosting".

── DELIVERY MODE RULES ──────────────────────────────────────────────────────
Return deliveryMode based on the urgency and nature of the scenario:
- "fastest": Time-critical or emergency situations where speed is the only priority.
  Use for: fever, power_cut, travel, hosting, baby_care, dairy, pest_control, party, school.
- "trusted": Health or safety scenarios where brand quality matters most, even if slightly slower.
  Use for: fever (when medicine brand matters), baby_care (formula/diapers brand trust), fitness (supplement authenticity).
  NOTE: fever defaults to "fastest" unless the user specifically asks for a trusted brand.
- "value": Non-urgent, price-sensitive situations. Speed does not matter.
  Use for: tea_break, general, staples, cleaning, snacks, condiments, frozen_food, gifting, pet_care, personal_care, office, skincare, fitness, breakfast, pooja, home_repair, rainy, electronics, instant_food, cooking.

── CONTEXT SIGNALS ──────────────────────────────────────────────────────────
- Use time-of-day to boost confidence: late night + fever/power_cut → raise confidence; afternoon + tea_break → raise confidence; morning + breakfast/dairy → raise confidence.
- If recent orders show a repeat need (e.g. fever supplies again) → raise urgency to High.
- Use weather signals: storm/heavy rain → boost "power_cut" or "rainy" confidence; extreme heat → boost ORS/cold drinks relevance.

── SECONDARY SCENARIO ───────────────────────────────────────────────────────
- If the situation clearly spans two needs (e.g. sick guest = fever + hosting), set secondaryScenario and secondaryConfidence.
- Only set secondaryScenario if secondaryConfidence >= 30. Otherwise omit both fields entirely.

── SUGGESTED ITEMS ──────────────────────────────────────────────────────────
- Return 3-6 specific item names that the user most likely needs right now.
- Use real product names or common generic names (e.g. "Dolo 650", "Amul Milk", "Maggi Noodles", "Paracetamol").
- Only include items a quick-commerce grocery/essentials app carries: packaged food, beverages, household, medicines, stationery, small electronics, packaged gifts.
- Do NOT include custom, artisan, clothing, jewellery, or handmade items.
- Do NOT pad to a minimum — 3 highly relevant items is better than 6 vague ones.`;

function buildSystemPrompt(isMultimodal: boolean, timeContext: string, recentOrdersContext: string, weatherContext: string): string {
  const contextBlock = [timeContext, weatherContext, recentOrdersContext].filter(Boolean).join("\n");
  const imageInstructions = isMultimodal
    ? "You are given a photo the user uploaded of their current situation, along with a text description.\nAnalyse BOTH the image and the text together to understand what they need."
    : "Analyse the user's situation to understand what they need.";
  const imageRule = isMultimodal
    ? "- Use visual cues from the image (e.g. a dinner table, a sick person in bed, candles, textbooks) to raise your confidence.\n"
    : "";

  return `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India called "Amazon Now OS".
${imageInstructions}

${JSON_SCHEMA}

${contextBlock ? `Context:\n${contextBlock}\n` : ""}${imageRule}${BASE_RULES}`;
}

// ─── Call Bedrock with optional image ────────────────────────────
async function invokeBedrockForIntent(
  situationText: string,
  photoS3Key?: string,
  recentOrders?: string[],
  contextSignals?: ClientContextSignals
): Promise<ParsedIntent> {
  // Try to fetch the image if a key was provided
  const imageData = photoS3Key ? await fetchImageFromS3(photoS3Key) : null;
  const isMultimodal = !!imageData;

  // Build contextual signals for the prompt
  const timeContext = buildTimeContext();
  const recentOrdersContext = buildRecentOrdersContext(recentOrders ?? []);
  const weatherContext = buildWeatherContext(contextSignals ?? {});

  // Build the message content array
  const content: ContentBlock[] = [];

  if (isMultimodal && imageData) {
    content.push({
      image: {
        format: imageData.format,
        source: { bytes: imageData.bytes },
      },
    });
  }

  content.push({
    text: isMultimodal
      ? `The user also wrote: "${situationText}". Use both the image and this description to identify their shopping need.`
      : `Situation: "${situationText}"`,
  });

  const command = new ConverseCommand({
    modelId: getModelId(),
    system: [{ text: buildSystemPrompt(isMultimodal, timeContext, recentOrdersContext, weatherContext) }],
    messages: [{ role: "user", content }],
    inferenceConfig: {
      maxTokens: 1024,
      temperature: 0,
      topP: 0.9,
    },
  });

  const response = await getBedrockClient().send(command);
  const rawText = response.output?.message?.content?.[0]?.text ?? "";

  if (!rawText) {
    throw new Error("Bedrock returned an empty response");
  }

  // Strip accidental markdown fences
  const cleaned = rawText.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: Partial<ParsedIntent>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Bedrock sometimes truncates mid-response when tokens run out.
    // Attempt to extract a complete JSON object and repair missing closing chars.
    const jsonStart = cleaned.indexOf("{");
    if (jsonStart !== -1) {
      let candidate = cleaned.slice(jsonStart);
      // Drop everything after the last complete value (strip trailing incomplete key/string)
      candidate = candidate.replace(/,\s*"[^"]*"?\s*:\s*"?[^"\}\]]*$/, "");
      // Close any open arrays then the object
      const openBrackets = (candidate.match(/\[/g) ?? []).length - (candidate.match(/\]/g) ?? []).length;
      const openBraces   = (candidate.match(/\{/g) ?? []).length - (candidate.match(/\}/g) ?? []).length;
      candidate += "]".repeat(Math.max(0, openBrackets)) + "}".repeat(Math.max(0, openBraces));
      try {
        parsed = JSON.parse(candidate);
        console.warn("[interpret] Repaired truncated Bedrock JSON successfully");
      } catch {
        throw new Error(`Bedrock returned invalid JSON: ${rawText.slice(0, 300)}`);
      }
    } else {
      throw new Error(`Bedrock returned invalid JSON: ${rawText.slice(0, 300)}`);
    }
  }

  // Validate scenario
  const scenario = parsed.scenario as Scenario;
  if (!scenario || !SCENARIO_META[scenario]) {
    throw new Error(
      `Bedrock returned unknown scenario: "${parsed.scenario}". ` +
        `Expected one of: ${Object.keys(SCENARIO_META).join(", ")}`
    );
  }

  // Validate and normalise required fields
  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 100) {
    throw new Error(`Bedrock returned invalid confidence: ${parsed.confidence}`);
  }

  // Parse optional secondary scenario fields
  const secondaryScenario = parsed.secondaryScenario as Scenario | undefined;
  const secondaryConfidence =
    typeof parsed.secondaryConfidence === "number" ? parsed.secondaryConfidence : undefined;
  const hasValidSecondary =
    secondaryScenario !== undefined &&
    SCENARIO_META[secondaryScenario] !== undefined &&
    typeof secondaryConfidence === "number" &&
    secondaryConfidence >= 30;

  return {
    scenario,
    scenarioLabel:
      typeof parsed.scenarioLabel === "string"
        ? parsed.scenarioLabel
        : SCENARIO_META[scenario].scenarioLabel,
    urgency: ["High", "Medium", "Low"].includes(parsed.urgency as string)
      ? (parsed.urgency as "High" | "Medium" | "Low")
      : SCENARIO_META[scenario].urgency,
    category:
      typeof parsed.category === "string" ? parsed.category : SCENARIO_META[scenario].category,
    confidence: parsed.confidence,
    summary:
      typeof parsed.summary === "string" ? parsed.summary : SCENARIO_META[scenario].summary,
    deliveryMode: typeof parsed.deliveryMode === "string" ? parsed.deliveryMode : "fastest",
    suggestedItems: Array.isArray(parsed.suggestedItems) ? parsed.suggestedItems : [],
    usedBedrock: true,
    secondaryScenario: hasValidSecondary ? secondaryScenario : undefined,
    secondaryConfidence: hasValidSecondary ? secondaryConfidence : undefined,
  };
}

// ─── POST /api/interpret ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Signal to Next.js 16 that this route reads env vars at runtime
    await connection();

    // ─── Rate limiting ─────────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          details: `Rate limit exceeded. Try again in ${rateCheck.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfter) },
        }
      );
    }

    const body = (await req.json()) as {
      input?: string;
      photoS3Key?: string;
      recentOrders?: string[];
      contextSignals?: ClientContextSignals;
    };
    const { input, photoS3Key, recentOrders, contextSignals } = body;

    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return NextResponse.json(
        { error: "input must be a non-empty string of at least 2 characters" },
        { status: 400 }
      );
    }

    // ─── Sanitise input ───────────────────────────────────────────────
    // Strip HTML tags, truncate to 500 chars, collapse whitespace.
    const sanitizedInput = input
      .trim()
      .replace(/<[^>]*>/g, "")           // strip HTML tags
      .replace(/[<>{}[\]\\]/g, "")       // strip prompt-injection chars
      .slice(0, 500)                      // hard cap to prevent token abuse
      .replace(/\s+/g, " ")              // collapse whitespace
      .trim();

    if (sanitizedInput.length < 2) {
      return NextResponse.json(
        { error: "Input too short after sanitisation" },
        { status: 400 }
      );
    }

    // ─── Sanitise recent orders (client-supplied, treat as untrusted) ─
    const sanitizedRecentOrders = Array.isArray(recentOrders)
      ? recentOrders
          .filter((s): s is string => typeof s === "string")
          .map((s) =>
            s
              .trim()
              .replace(/<[^>]*>/g, "")
              .replace(/[<>{}[\]\\]/g, "")
              .slice(0, 200)
              .trim()
          )
          .filter((s) => s.length >= 2)
          .slice(0, 2)
      : [];

    // ─── Sanitise context signals (client-supplied, treat as untrusted) ─
    // Only pass through if the shape looks valid; any weirdness → drop it.
    const sanitizedSignals: ClientContextSignals = {};
    if (contextSignals && typeof contextSignals === "object") {
      if (
        contextSignals.location &&
        typeof contextSignals.location.lat === "number" &&
        typeof contextSignals.location.lon === "number" &&
        typeof contextSignals.location.city === "string"
      ) {
        sanitizedSignals.location = {
          lat: contextSignals.location.lat,
          lon: contextSignals.location.lon,
          city: String(contextSignals.location.city).slice(0, 80),
          region: String(contextSignals.location.region ?? "").slice(0, 80),
        };
      }
      if (
        contextSignals.weather &&
        typeof contextSignals.weather.tempC === "number" &&
        typeof contextSignals.weather.condition === "string"
      ) {
        sanitizedSignals.weather = {
          tempC: Math.round(contextSignals.weather.tempC),
          condition: String(contextSignals.weather.condition).slice(0, 30),
          conditionLabel: String(contextSignals.weather.conditionLabel ?? "").slice(0, 60),
          precipMmPerHr: Math.abs(Number(contextSignals.weather.precipMmPerHr) || 0),
          city: String(contextSignals.weather.city ?? "").slice(0, 80),
          region: String(contextSignals.weather.region ?? "").slice(0, 80),
          isExtreme: Boolean(contextSignals.weather.isExtreme),
        };
      }
    }

    // ─── Always create a fresh session for each new intent ───────
    const sessionId = uuidv4();

    // ─── Call Bedrock (with optional image + context signals) ─────
    const intent = await invokeBedrockForIntent(
      sanitizedInput,
      photoS3Key,
      sanitizedRecentOrders,
      sanitizedSignals
    );

    // ─── Generate cart server-side ─────────────────────────────────
    // Use the deliveryMode Bedrock returned for this scenario (e.g. "value" for tea_break/general).
    // Falls back to "fastest" if Bedrock returned something unexpected.
    const urgencyMode: UrgencyMode = (["fastest", "value", "trusted"].includes(intent.deliveryMode as string)
      ? (intent.deliveryMode as UrgencyMode)
      : "fastest");
    const cart = generateCart(intent, urgencyMode);
    const initialSelections = generateInitialSelections(cart.items, urgencyMode);

    // ─── Persist to DynamoDB ──────────────────────────────────────
    await saveSession({
      sessionId,
      situationText: sanitizedInput,
      ...(photoS3Key ? { photoS3Key } : {}),
      intent,
      cart,
      urgencyMode,
      selectedSubstitutes: initialSelections,
      status: "active",
    });

    // ─── Build response, always set the new session cookie ────────
    const res = NextResponse.json({ intent, cart, initialSelections, sessionId });

    res.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/interpret] Error:", message);
    return NextResponse.json(
      { error: "Intent parsing failed", details: message },
      { status: 502 }
    );
  }
}
