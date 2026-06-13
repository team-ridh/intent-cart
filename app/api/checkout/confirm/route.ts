import { NextRequest, NextResponse, connection } from "next/server";
import { confirmSession, getSession } from "@/lib/db/sessions";

const SESSION_COOKIE = "ic_session";

// ─── POST /api/checkout/confirm — mark session as confirmed ──────
export async function POST(req: NextRequest) {
  try {
    // Force Next.js 16 to read env vars at runtime, not build time
    await connection();

    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "No session found. Start a new session at /." },
        { status: 401 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    if (!session.cart) {
      return NextResponse.json(
        { error: "No cart to confirm. Build a cart first." },
        { status: 422 }
      );
    }

    if (session.status === "confirmed") {
      return NextResponse.json({ alreadyConfirmed: true, sessionId });
    }

    await confirmSession(sessionId);

    return NextResponse.json({
      confirmed: true,
      sessionId,
      totalPrice: session.cart.totalPrice,
      itemCount: session.cart.itemCount,
      estimatedEta: session.cart.estimatedEta,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/checkout/confirm] Error:", message);
    return NextResponse.json(
      { error: "Failed to confirm order", details: message },
      { status: 500 }
    );
  }
}
