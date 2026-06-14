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

// ─── System prompts ───────────────────────────────────────────────
const SYSTEM_PROMPT_TEXT_ONLY = `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India called "Amazon Now OS".
Analyse the user's situation and return ONLY a valid JSON object with these exact fields — no markdown, no explanation, no code blocks:
{
  "scenario": one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general","cooking","home_repair"],
  "scenarioLabel": human-readable label e.g. "Hosting" or "Fever Care",
  "urgency": one of ["High","Medium","Low"],
  "category": primary product category e.g. "Food & Beverage",
  "confidence": integer 0-100 representing how confident you are about the scenario,
  "summary": 6-10 word description of the shopping need,
  "deliveryMode": one of ["fastest","value","trusted"],
  "suggestedItems": array of 4-6 item names the user likely needs right now,
  "secondaryScenario": optional — a second scenario from the same list if the situation spans two needs (e.g. "fever" AND "hosting"). Omit if no secondary scenario is relevant.
  "secondaryConfidence": integer 0-100, required only if secondaryScenario is set. How confident are you that the secondary scenario applies?
}

Rules:
- Return ONLY the JSON object. No other text.
- confidence should reflect how clearly the situation maps to a scenario (95+ = very clear, 70-90 = likely, 50-70 = uncertain, use "general" below 50).
- For Indian contexts: "pooja" includes puja, prayer, festival rituals. "hosting" includes guests, visitors, parties.
- "cooking" includes ran out of ingredients, need groceries, cooking essentials, oil/salt/onions.
- "home_repair" includes broken bulb, fuse gone, need tape, repair, fix, maintenance.
- If the user's situation clearly involves two scenarios (e.g. sick guest at home = "fever" + "hosting"), set secondaryScenario and secondaryConfidence. Only set secondaryScenario if secondaryConfidence >= 30.
- If there is no clear secondary scenario, omit both fields.`;

const SYSTEM_PROMPT_MULTIMODAL = `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India called "Amazon Now OS".
You are given a photo the user uploaded of their current situation, along with a text description they provided.
Analyse BOTH the image and the text together to understand what they need, and return ONLY a valid JSON object with these exact fields — no markdown, no explanation, no code blocks:
{
  "scenario": one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general","cooking","home_repair"],
  "scenarioLabel": human-readable label e.g. "Hosting" or "Fever Care",
  "urgency": one of ["High","Medium","Low"],
  "category": primary product category e.g. "Food & Beverage",
  "confidence": integer 0-100 representing how confident you are about the scenario,
  "summary": 6-10 word description of the shopping need,
  "deliveryMode": one of ["fastest","value","trusted"],
  "suggestedItems": array of 4-6 item names the user likely needs right now,
  "secondaryScenario": optional — a second scenario from the same list if the situation spans two needs (e.g. "fever" AND "hosting"). Omit if no secondary scenario is relevant.
  "secondaryConfidence": integer 0-100, required only if secondaryScenario is set. How confident are you that the secondary scenario applies?
}

Rules:
- Return ONLY the JSON object. No other text.
- Use visual cues from the image (e.g. a dinner table, a sick person in bed, candles, textbooks) to raise your confidence.
- confidence should reflect how clearly the situation maps to a scenario (95+ = very clear, 70-90 = likely, 50-70 = uncertain, use "general" below 50).
- For Indian contexts: "pooja" includes puja, prayer, festival rituals. "hosting" includes guests, visitors, parties.
- "cooking" includes ran out of ingredients, need groceries, cooking essentials, oil/salt/onions.
- "home_repair" includes broken bulb, fuse gone, need tape, repair, fix, maintenance.
- If the user's situation clearly involves two scenarios (e.g. sick guest at home = "fever" + "hosting"), set secondaryScenario and secondaryConfidence. Only set secondaryScenario if secondaryConfidence >= 30.
- If there is no clear secondary scenario, omit both fields.`;

// ─── Call Bedrock with optional image ────────────────────────────
async function invokeBedrockForIntent(
  situationText: string,
  photoS3Key?: string
): Promise<ParsedIntent> {
  // Try to fetch the image if a key was provided
  const imageData = photoS3Key ? await fetchImageFromS3(photoS3Key) : null;
  const isMultimodal = !!imageData;

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
    system: [{ text: isMultimodal ? SYSTEM_PROMPT_MULTIMODAL : SYSTEM_PROMPT_TEXT_ONLY }],
    messages: [{ role: "user", content }],
    inferenceConfig: {
      maxTokens: 512,
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
    throw new Error(`Bedrock returned invalid JSON: ${rawText.slice(0, 200)}`);
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

    const body = (await req.json()) as { input?: string; photoS3Key?: string };
    const { input, photoS3Key } = body;

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

    // ─── Always create a fresh session for each new intent ───────
    const sessionId = uuidv4();

    // ─── Call Bedrock (with optional image) ───────────────────────
    const intent = await invokeBedrockForIntent(sanitizedInput, photoS3Key);

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
