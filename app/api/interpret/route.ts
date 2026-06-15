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
const BASE_RULES = `Rules:
- Return ONLY the JSON object. No other text.
- confidence should reflect how clearly the situation maps to a scenario (95+ = very clear, 70-90 = likely, 50-70 = uncertain, use "general" below 50).
- For Indian contexts: "pooja" includes puja, prayer, festival rituals, Navratri, Diwali puja, Ganpati. "hosting" means guests are arriving at home and you need tea/snacks/beverages — NOT gifting.
- "gifting" means the user wants to BUY GIFTS for someone (mother, teacher, friend, relative, colleague) — Indian occasions or general gifting. Return "gifting" for any input mentioning 'gift', 'present', 'birthday gift', 'Diwali gift', 'gifts for my mother/sister/teacher' etc.
- "electronics" means tech products — cables, chargers, earbuds, power banks, bulbs, extension cords, SD cards, HDMI, mice, keyboards, IoT components (Arduino, Raspberry Pi adjacent items), accessories.
- "baby_care" means diapers, baby wipes, baby shampoo, baby formula, infant food, teether, feeding bottles — anything for a baby or infant.
- "personal_care" means hygiene and grooming items — shampoo, conditioner, soap, face wash, toothpaste, moisturizer, deodorant, shaving, feminine hygiene. NOT skincare serums or sunscreen.
- "party" means birthday parties, celebrations, anniversary — balloons, decorations, cake mix, candles, party snacks, cold drinks.
- "pet_care" means food, treats, accessories for dogs, cats, birds or aquarium fish.
- "fitness" means gym, workout, sports nutrition — protein powder, creatine, protein bars, yoga mat, skipping rope, gym gloves.
- "cleaning" means home cleaning — floor cleaner, toilet cleaner, dishwash, detergent, scrubbers, mops, room fresheners, garbage bags.
- "cooking" includes ran out of ingredients, need groceries, cooking essentials, oil/salt/onions.
- "home_repair" includes broken bulb, fuse gone, need tape, repair, fix, maintenance.
- "school" is for children's school project supplies — pencils, notebooks, colour pencils, scissors, craft materials — NOT adult office work.
- "breakfast" means morning meal items — cereals, oats, muesli, bread, jam, Horlicks, Bournvita, upma mix, poha mix — purchased as morning routine shopping.
- "dairy" means milk, butter, ghee, paneer, curd, cheese, eggs, yogurt — purchased as dairy replenishment.
- "frozen_food" means frozen snacks and frozen vegetables — McCain fries, frozen momos, chicken nuggets, frozen samosa, frozen paratha, frozen peas, frozen spinach.
- "condiments" means sauces, spreads, and condiments — ketchup, mayonnaise, soy sauce, schezwan, jam, peanut butter, vinegar, seasoning sachets.
- "snacks" means packaged snack items — namkeen (bhujia, mixture), chips, biscuits/cookies, chocolates, makhana, popcorn — NOT as part of a meal or hosting scenario.
- "staples" means core pantry restocking — atta (wheat flour), rice (basmati, sona masuri), dal (chana, moong, toor), cooking oil (sunflower, mustard), salt, sugar, masala powders.
- "skincare" means beauty and skincare — sunscreen/SPF, face serums (vitamin C, niacinamide), moisturizers, face wash/cleanser, eye makeup (kajal), foundation, scrubs, night cream.
- "pest_control" means mosquito repellents, cockroach sprays, insect killers — Good Knight, All Out, HIT, Mortein, Odomos, mosquito coils.
- "instant_food" means ready-to-eat meals and instant cooking — MTR/Haldiram's RTE curries, cup noodles, instant noodles (Maggi, Yippee), soup mixes, dessert mixes.
- "office" means adult office/work-from-home supplies — A4 printer paper, pens, sticky notes, stapler, whiteboard markers, highlighters, printer ink. NOT children's school stationery.
- Use the current time-of-day hint to boost confidence when it matches the scenario (e.g. evening + hosting, late night + fever, afternoon + tea_break, morning + breakfast/dairy).
- If recent orders show a repeat need (e.g. fever supplies again), raise urgency to High.
- If the user's situation clearly involves two scenarios (e.g. sick guest at home = "fever" + "hosting"), set secondaryScenario and secondaryConfidence. Only set secondaryScenario if secondaryConfidence >= 30.
- If there is no clear secondary scenario, omit both fields.
- suggestedItems must ONLY contain items that a quick-commerce grocery/essentials app carries (packaged food, beverages, household, medicines, stationery, small electronics, packaged gifts). Do NOT suggest custom, artisan, clothing, jewellery, or handmade items.`;


const JSON_SCHEMA = `{
  "scenario": one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general","cooking","home_repair","gifting","electronics","baby_care","personal_care","party","pet_care","fitness","cleaning","breakfast","dairy","frozen_food","condiments","snacks","staples","skincare","pest_control","instant_food","office"],
  "scenarioLabel": human-readable label e.g. "Hosting" or "Fever Care",
  "urgency": one of ["High","Medium","Low"],
  "category": primary product category e.g. "Food & Beverage",
  "confidence": integer 0-100 representing how confident you are about the scenario,
  "summary": 6-10 word description of the shopping need,
  "deliveryMode": one of ["fastest","value","trusted"],
  "suggestedItems": array of 4-6 item names the user likely needs right now,
  "secondaryScenario": optional — a second scenario from the same list if the situation spans two needs (e.g. "fever" AND "hosting"). Omit if no secondary scenario is relevant.
  "secondaryConfidence": integer 0-100, required only if secondaryScenario is set. How confident are you that the secondary scenario applies?
}`;

function buildSystemPrompt(isMultimodal: boolean, timeContext: string, recentOrdersContext: string, weatherContext: string): string {
  const contextBlock = [timeContext, weatherContext, recentOrdersContext].filter(Boolean).join("\n");
  const imageInstructions = isMultimodal
    ? "You are given a photo the user uploaded of their current situation, along with a text description they provided.\nAnalyse BOTH the image and the text together to understand what they need, and return ONLY a valid JSON object with these exact fields — no markdown, no explanation, no code blocks:"
    : "Analyse the user's situation and return ONLY a valid JSON object with these exact fields — no markdown, no explanation, no code blocks:";
  const imageRule = isMultimodal
    ? "- Use visual cues from the image (e.g. a dinner table, a sick person in bed, candles, textbooks) to raise your confidence.\n"
    : "";

  return `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India called "Amazon Now OS".
${imageInstructions}
${JSON_SCHEMA}

${contextBlock}

${BASE_RULES.replace(
  "- If the user",
  `${imageRule}- If the user`
)}`;
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
    const urgencyMode: UrgencyMode = "fastest";
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
