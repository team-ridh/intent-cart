import { NextRequest, NextResponse } from "next/server";
import type { ParsedIntent, Scenario } from "@/lib/types";
import { parseIntentLocal, SCENARIO_META } from "@/lib/ai/intentParser";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ─── Model selection ──────────────────────────────────────────────
// Claude Haiku 4.5 via cross-region inference profile (non-legacy, active)
// Uses "us." prefix = cross-region inference profile required for 4.x models
// Inference profiles route traffic across us-east-1 / us-west-2 automatically
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ??
  "us.anthropic.claude-haiku-4-5-20251001-v1:0";

// ─── Intent extraction via Amazon Bedrock Converse API ────────────
// Converse API is the recommended approach for Claude 4.x models.
// Falls back gracefully to local keyword engine if Bedrock unavailable.
async function invokeBedrockClaude(input: string): Promise<ParsedIntent | null> {
  const region = process.env.AWS_REGION ?? "us-east-1";

  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return null; // No credentials → skip to local fallback
  }

  try {
    const client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN
          ? { sessionToken: process.env.AWS_SESSION_TOKEN }
          : {}),
      },
    });

    const systemPrompt = `You are a deterministic e-commerce intent extraction engine for a quick-commerce app in India.
Analyse the user's situation and return ONLY a valid JSON object with these exact fields — no markdown, no explanation:
{
  "scenario": one of ["hosting","fever","pooja","rainy","travel","power_cut","school","tea_break","general"],
  "scenarioLabel": human-readable label e.g. "Hosting" or "Fever Care",
  "urgency": one of ["High","Medium","Low"],
  "category": primary product category e.g. "Food & Beverage",
  "confidence": integer 0-100,
  "summary": 6-10 word description of the shopping need,
  "deliveryMode": one of ["fastest","value","trusted"],
  "suggestedItems": array of 4-6 item names the user likely needs
}`;

    const command = new ConverseCommand({
      modelId: BEDROCK_MODEL_ID,
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: "user",
          content: [{ text: `Situation: "${input}"` }],
        },
      ],
      inferenceConfig: {
        maxTokens: 400,
        temperature: 0, // deterministic output
      },
    });

    const response = await client.send(command);
    const content =
      response.output?.message?.content?.[0]?.text ?? "";

    if (!content) return null;

    // Strip any accidental markdown fences
    const cleaned = content.replace(/```json?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.scenario || !SCENARIO_META[parsed.scenario as Scenario]) {
      return null;
    }

    return {
      scenario: parsed.scenario as Scenario,
      scenarioLabel: parsed.scenarioLabel ?? parsed.scenario,
      urgency: parsed.urgency ?? "Medium",
      category: parsed.category ?? "General",
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 80,
      summary: parsed.summary ?? "",
      deliveryMode: parsed.deliveryMode ?? "fastest",
      suggestedItems: Array.isArray(parsed.suggestedItems)
        ? parsed.suggestedItems
        : [],
      usedBedrock: true,
    } satisfies ParsedIntent;
  } catch (err) {
    console.error("[Bedrock] Error invoking model:", err);
    return null; // → falls through to local fallback
  }
}

// ─── POST /api/interpret ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { input } = (await req.json()) as { input: string };

    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 1. Try Amazon Bedrock (Claude Haiku 4.5)
    const bedrockResult = await invokeBedrockClaude(input.trim());
    if (bedrockResult) {
      return NextResponse.json({ intent: bedrockResult, source: "bedrock" });
    }

    // 2. Deterministic local fallback (always works, no API needed)
    const localResult = parseIntentLocal(input.trim());
    return NextResponse.json({ intent: localResult, source: "local" });
  } catch (err) {
    console.error("[/api/interpret] Error:", err);
    const fallback = parseIntentLocal("general");
    return NextResponse.json(
      { intent: fallback, source: "fallback" },
      { status: 200 }
    );
  }
}
