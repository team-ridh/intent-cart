import { NextRequest, NextResponse, connection } from "next/server";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { getSession, updateCartState } from "@/lib/db/sessions";
import type { GeneratedCart, UrgencyMode } from "@/lib/types";

const SESSION_COOKIE = "ic_session";

function getBedrockClient(): BedrockRuntimeClient {
  const accessKeyId = process.env.BEDROCK_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BEDROCK_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "[/api/cart/refine] BEDROCK_ACCESS_KEY_ID and BEDROCK_SECRET_ACCESS_KEY are required. " +
        "Set them in .env.local or Amplify environment variables."
    );
  }
  return new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION ?? "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

type PatchOp =
  | { action: "remove"; itemId: string }
  | { action: "add_qty"; itemId: string; delta: number }
  | { action: "noop"; reason: string };

const SYSTEM_PROMPT = `You are a cart editor assistant for a quick-commerce app.
The user has a cart with items and wants to modify it using natural language.
Return ONLY a valid JSON array of operations — no markdown, no explanation:
[
  { "action": "remove", "itemId": "<id from cart>" },
  { "action": "add_qty", "itemId": "<id from cart>", "delta": <positive integer> },
  { "action": "noop", "reason": "<why no change>" }
]

Rules:
- Match item names case-insensitively. If user says "remove the soup", find the soup item id.
- "I already have X" or "I don't need X" means remove X.
- "add more X" or "more X" means add_qty with delta 1 or 2.
- If nothing matches or the request is unclear, return [{"action":"noop","reason":"..."}].
- Return ONLY the JSON array. Maximum 3 operations per request.`;

/**
 * POST /api/cart/refine
 * Body: { message: string }
 * Uses Bedrock to interpret the message and apply patch operations to the cart.
 */
export async function POST(req: NextRequest) {
  try {
    await connection();

    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session?.cart) {
      return NextResponse.json({ error: "No cart in session" }, { status: 422 });
    }

    const body = await req.json() as { message?: string };
    const raw = body.message;
    const message = raw
      ?.trim()
      .replace(/<[^>]*>/g, "")           // strip HTML tags
      .replace(/[<>{}[\]\\]/g, "")       // strip prompt-injection chars
      .slice(0, 200)
      .trim();
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    // Build a compact cart summary for context
    const cartSummary = session.cart.items
      .map((i) => `id:${i.id} name:"${i.name}" qty:${i.quantity}`)
      .join("\n");

    const command = new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID ?? "us.amazon.nova-2-lite-v1:0",
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{
        role: "user",
        content: [{ text: `Cart items:\n${cartSummary}\n\nUser request: "${message}"` }],
      }],
      inferenceConfig: { maxTokens: 256, temperature: 0 },
    });

    const response = await getBedrockClient().send(command);
    const rawText = response.output?.message?.content?.[0]?.text ?? "";
    const cleaned = rawText.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

    let ops: PatchOp[];
    try {
      ops = JSON.parse(cleaned);
      if (!Array.isArray(ops)) throw new Error("not array");
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid response", raw: rawText.slice(0, 100) },
        { status: 502 }
      );
    }

    // Apply patch operations to the cart
    let cart: GeneratedCart = session.cart;
    const appliedOps: string[] = [];

    for (const op of ops) {
      if (op.action === "remove") {
        const item = cart.items.find((i) => i.id === op.itemId);
        if (item) {
          const items = cart.items.filter((i) => i.id !== op.itemId);
          const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
          const estimatedEta = items.length > 0 ? Math.max(...items.map((i) => i.eta)) : 0;
          cart = { ...cart, items, totalPrice, itemCount: items.length, estimatedEta };
          appliedOps.push(`Removed ${item.name}`);
        }
      } else if (op.action === "add_qty") {
        const item = cart.items.find((i) => i.id === op.itemId);
        if (item && op.delta > 0) {
          const items = cart.items.map((i) =>
            i.id === op.itemId ? { ...i, quantity: i.quantity + op.delta } : i
          );
          const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
          cart = { ...cart, items, totalPrice };
          appliedOps.push(`Added ${op.delta} × ${item.name}`);
        }
      }
    }

    const urgencyMode: UrgencyMode = session.urgencyMode ?? "fastest";
    await updateCartState(sessionId, { cart, urgencyMode });

    return NextResponse.json({
      cart,
      appliedOps,
      noopReason: ops.find((o) => o.action === "noop")
        ? (ops.find((o) => o.action === "noop") as { action: "noop"; reason: string }).reason
        : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/cart/refine] Error:", message);
    return NextResponse.json(
      { error: "Cart refinement failed", details: message },
      { status: 500 }
    );
  }
}
