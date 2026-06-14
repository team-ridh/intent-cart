import { NextRequest, NextResponse, connection } from "next/server";
import { getConfirmedSession } from "@/lib/db/sessions";

const SESSION_COOKIE = "ic_session";

/**
 * GET /api/reorder
 * Returns the last confirmed session for the current user (cookie-based).
 * Used by the home page to show a one-tap re-order option.
 */
export async function GET(req: NextRequest) {
  try {
    await connection();

    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ session: null });
    }

    const session = await getConfirmedSession(sessionId);
    if (!session) {
      return NextResponse.json({ session: null });
    }

    // Return a lightweight summary — not the full cart
    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        situationText: session.situationText,
        scenarioLabel: session.intent?.scenarioLabel ?? "Previous order",
        itemCount: session.cart?.itemCount ?? 0,
        totalPrice: session.cart?.totalPrice ?? 0,
        estimatedEta: session.cart?.estimatedEta ?? 15,
        confirmedAt: session.updatedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/reorder] Error:", message);
    return NextResponse.json({ session: null }); // non-fatal — home page degrades gracefully
  }
}
