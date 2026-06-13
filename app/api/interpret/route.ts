import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { ParsedIntent, Scenario } from "@/lib/types";
import { SCENARIO_META } from "@/lib/ai/intentParser";
import { saveSession, saveIntent } from "@/lib/db/sessions";

// ─── Session cookie config ────────────────────────────────────────
const SESSION_COOKIE = "ic_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Bedrock model (Amazon Nova 2 Lite — multimodal, cost-efficient, 1M context) ──
// Supports cross-region inference profile: us.amazon.nova-2-lite-v1:0
// Docs: https://docs.aws.amazon.com/nova/latest/userguide/nova-lite.html
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? "us.amazon.nova-2-lite-v1:0";

// ─── Bedrock client — created lazily to avoid module-level throw ──────────────
// A module-level throw crashes the entire SSR Lambda with a plain-text 500,
// swallowing the real error. We create the client on first use so the route
// handler's catch block can return a proper JSON error instead.
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

// ─── System prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India called "Amazon Now OS".
Analyse the user's situation and return ONLY a valid JSON object with these exact fields — no markdown, no explanation, no code blocks:
{
  "scenario": one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general"],
  "scenarioLabel": human-readable label e.g. "Hosting" or "Fever Care",
  "urgency": one of ["High","Medium","Low"],
  "category": primary product category e.g. "Food & Beverage",
  "confidence": integer 0-100 representing how confident you are about the scenario,
  "summary": 6-10 word description of the shopping need,
  "deliveryMode": one of ["fastest","value","trusted"],
  "suggestedItems": array of 4-6 item names the user likely needs right now
}

Rules:
- Return ONLY the JSON object. No other text.
- confidence should reflect how clearly the situation maps to a scenario (95+ = very clear, 70-90 = likely, 50-70 = uncertain, use "general" below 50).
- For Indian contexts: "pooja" includes puja, prayer, festival rituals. "hosting" includes guests, visitors, parties.`;

// ─── Call Bedrock and parse the structured response ───────────────
async function invokeBedrockForIntent(
  situationText: string
): Promise<ParsedIntent> {
  const command = new ConverseCommand({
    modelId: BEDROCK_MODEL_ID,
    system: [{ text: SYSTEM_PROMPT }],
    messages: [
      {
        role: "user",
        content: [{ text: `Situation: "${situationText}"` }],
      },
    ],
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

  return {
    scenario,
    scenarioLabel: typeof parsed.scenarioLabel === "string" ? parsed.scenarioLabel : SCENARIO_META[scenario].scenarioLabel,
    urgency: ["High", "Medium", "Low"].includes(parsed.urgency as string)
      ? (parsed.urgency as "High" | "Medium" | "Low")
      : SCENARIO_META[scenario].urgency,
    category: typeof parsed.category === "string" ? parsed.category : SCENARIO_META[scenario].category,
    confidence: parsed.confidence,
    summary: typeof parsed.summary === "string" ? parsed.summary : SCENARIO_META[scenario].summary,
    deliveryMode: typeof parsed.deliveryMode === "string" ? parsed.deliveryMode : "fastest",
    suggestedItems: Array.isArray(parsed.suggestedItems) ? parsed.suggestedItems : [],
    usedBedrock: true,
  };
}

// ─── POST /api/interpret ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { input?: string; photoS3Key?: string };
    const { input, photoS3Key } = body;

    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return NextResponse.json(
        { error: "input must be a non-empty string of at least 2 characters" },
        { status: 400 }
      );
    }

    // ─── Get or create session ID ─────────────────────────────────
    const existingSessionId = req.cookies.get(SESSION_COOKIE)?.value;
    const sessionId = existingSessionId ?? uuidv4();
    const isNewSession = !existingSessionId;

    // ─── Call Bedrock ─────────────────────────────────────────────
    const intent = await invokeBedrockForIntent(input.trim());

    // ─── Persist to DynamoDB ──────────────────────────────────────
    if (isNewSession) {
      // Create the session record first
      await saveSession({
        sessionId,
        situationText: input.trim(),
        ...(photoS3Key ? { photoS3Key } : {}),
        intent,
        urgencyMode: "fastest",
        selectedSubstitutes: {},
        status: "active",
      });
    } else {
      // Update existing session with new intent
      await saveIntent(sessionId, input.trim(), intent, photoS3Key);
    }

    // ─── Build response, set session cookie if new ────────────────
    const res = NextResponse.json({ intent, sessionId });

    if (isNewSession) {
      res.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

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
