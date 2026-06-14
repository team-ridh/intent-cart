import { NextRequest, NextResponse, connection } from "next/server";
import { generateCart } from "@/lib/ai/cartGenerator";
import { applyUrgencyMode } from "@/lib/ai/substituteRanker";
import {
  getSession,
  saveCart,
  updateCartState,
} from "@/lib/db/sessions";
import type { GeneratedCart, UrgencyMode } from "@/lib/types";

const SESSION_COOKIE = "ic_session";

function getSessionId(req: NextRequest): string {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    throw new Error("No session cookie found. Call /api/interpret first.");
  }
  return sessionId;
}

// ─── GET /api/cart — load cart for the current session ───────────
export async function GET(req: NextRequest) {
  try {
    // Force Next.js 16 to read env vars at runtime, not build time
    await connection();

    const sessionId = getSessionId(req);
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found. Start a new session at /." },
        { status: 404 }
      );
    }

    if (!session.intent) {
      return NextResponse.json(
        { error: "Session has no intent yet. Call /api/interpret first." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      situationText: session.situationText,
      intent: session.intent,
      cart: session.cart ?? null,
      urgencyMode: session.urgencyMode,
      selectedSubstitutes: session.selectedSubstitutes,
      status: session.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/cart] Error:", message);
    return NextResponse.json(
      { error: "Failed to load cart", details: message },
      { status: message.includes("No session cookie") ? 401 : 500 }
    );
  }
}

// ─── POST /api/cart — generate and save cart to DynamoDB ─────────
export async function POST(req: NextRequest) {
  try {
    // Force Next.js 16 to read env vars at runtime, not build time
    await connection();

    const sessionId = getSessionId(req);
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found. Start a new session at /." },
        { status: 404 }
      );
    }

    if (!session.intent) {
      return NextResponse.json(
        { error: "Session has no intent. Call /api/interpret first." },
        { status: 422 }
      );
    }

    const body = await req.json() as { urgencyMode?: UrgencyMode };
    const urgencyMode: UrgencyMode = body.urgencyMode ?? session.urgencyMode ?? "fastest";

    const cart = generateCart(session.intent, urgencyMode);
    await saveCart(sessionId, cart, urgencyMode);

    return NextResponse.json({ cart, urgencyMode });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/cart] Error:", message);
    return NextResponse.json(
      { error: "Failed to generate cart", details: message },
      { status: message.includes("No session cookie") ? 401 : 500 }
    );
  }
}

// ─── PATCH /api/cart — update urgency, qty, substitutes ──────────
export async function PATCH(req: NextRequest) {
  try {
    // Force Next.js 16 to read env vars at runtime, not build time
    await connection();

    const sessionId = getSessionId(req);
    const session = await getSession(sessionId);

    if (!session?.cart) {
      return NextResponse.json(
        { error: "No cart to update. Call POST /api/cart first." },
        { status: 422 }
      );
    }

    const body = await req.json() as {
      urgencyMode?: UrgencyMode;
      selectedSubstitutes?: Record<string, string>;
      adjustItem?: { itemId: string; delta: number };
      removeItem?: string;
    };

    let cart: GeneratedCart = session.cart;
    let urgencyMode: UrgencyMode = session.urgencyMode;
    let selectedSubstitutes: Record<string, string> = session.selectedSubstitutes;

    // Apply urgency mode change (re-ranks substitutes)
    if (body.urgencyMode && body.urgencyMode !== urgencyMode) {
      urgencyMode = body.urgencyMode;
      const rerankedItems = applyUrgencyMode(cart.items, urgencyMode);
      cart = { ...cart, items: rerankedItems };
    }

    // Update selected substitutes
    if (body.selectedSubstitutes !== undefined) {
      selectedSubstitutes = { ...selectedSubstitutes, ...body.selectedSubstitutes };
    }

    // Adjust item quantity
    if (body.adjustItem) {
      const { itemId, delta } = body.adjustItem;
      const items = cart.items
        .map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0);
      const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const estimatedEta = items.length > 0 ? Math.max(...items.map((i) => i.eta)) : 0;
      cart = { ...cart, items, totalPrice, itemCount: items.length, estimatedEta };
    }

    // Remove item
    if (body.removeItem) {
      const items = cart.items.filter((i) => i.id !== body.removeItem);
      const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const estimatedEta = items.length > 0 ? Math.max(...items.map((i) => i.eta)) : 0;
      cart = { ...cart, items, totalPrice, itemCount: items.length, estimatedEta };
    }

    await updateCartState(sessionId, { cart, urgencyMode, selectedSubstitutes });

    return NextResponse.json({ cart, urgencyMode, selectedSubstitutes });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/cart] Error:", message);
    return NextResponse.json(
      { error: "Failed to update cart", details: message },
      { status: message.includes("No session cookie") ? 401 : 500 }
    );
  }
}
