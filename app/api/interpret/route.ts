import { NextRequest, NextResponse } from "next/server";
import type { ParsedIntent, Scenario } from "@/lib/types";
import { parseIntentLocal, SCENARIO_META } from "@/lib/ai/intentParser";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ─── Bedrock model IDs ────────────────────────────────────────────
// Claude 3 Haiku — fastest, best for intent extraction
const BEDROCK_MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

// ─── Bedrock client (lazy-loaded to avoid build errors when SDK absent) ──
async function invokeBedrockClaude(input: string): Promise<ParsedIntent | null> {
  const region = process.env.AWS_REGION ?? "us-east-1";

  // Check required env vars
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return null;
  }

  try {
    const client = new BedrockRuntimeClient({ region });

    const systemPrompt = `You are a deterministic e-commerce intent extraction engine for a quick-commerce app.
Analyse the user's situation text and return ONLY a valid JSON object with these exact fields:
- scenario: one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general"]
- scenarioLabel: human-readable label (e.g. "Hosting", "Fever Care")
- urgency: one of ["High","Medium","Low"]
- category: primary product category (e.g. "Food & Beverage")
- confidence: integer 0-100 (how confident you are about the scenario)
- summary: short 6-10 word description of the shopping need
- deliveryMode: one of ["fastest","value","trusted"]
- suggestedItems: array of 4-6 item names the user likely needs

Return ONLY the JSON object. No markdown. No explanation. No code blocks.`;

    const userMessage = `Situation: "${input}"`;

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(body),
    });

    const response = await client.send(command);
    const responseText = new TextDecoder().decode(response.body);
    const responseJson = JSON.parse(responseText);

    const content = responseJson?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(content);

    // Validate required fields
    if (!parsed.scenario || !SCENARIO_META[parsed.scenario as Scenario]) {
      return null;
    }

    return {
      scenario: parsed.scenario as Scenario,
      scenarioLabel: parsed.scenarioLabel ?? parsed.scenario,
      urgency: parsed.urgency ?? "Medium",
      category: parsed.category ?? "General",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 80,
      summary: parsed.summary ?? "",
      deliveryMode: parsed.deliveryMode ?? "fastest",
      suggestedItems: Array.isArray(parsed.suggestedItems) ? parsed.suggestedItems : [],
      usedBedrock: true,
    } satisfies ParsedIntent;
  } catch (err) {
    console.error("[Bedrock] Error:", err);
    return null;
  }
}

// ─── POST /api/interpret ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { input } = (await req.json()) as { input: string };

    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 1. Try Amazon Bedrock
    const bedrockResult = await invokeBedrockClaude(input.trim());
    if (bedrockResult) {
      return NextResponse.json({ intent: bedrockResult, source: "bedrock" });
    }

    // 2. Deterministic local fallback
    const localResult = parseIntentLocal(input.trim());
    return NextResponse.json({ intent: localResult, source: "local" });
  } catch (err) {
    console.error("[/api/interpret] Error:", err);
    const fallback = parseIntentLocal("general");
    return NextResponse.json({ intent: fallback, source: "fallback" }, { status: 200 });
  }
}
