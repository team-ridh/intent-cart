import { NextRequest, NextResponse, connection } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, saveSession } from "@/lib/db/sessions";
import type { GeneratedCart, ParsedIntent, UrgencyMode } from "@/lib/types";

const SESSION_COOKIE = "ic_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── POST /api/cart/browse ─────────────────────────────────────────────────
// Bootstraps a "General Shopping" session + empty cart for users who add
// items from the /products browse page without first going through the
// intent/AI flow.
//
// If an active (non-confirmed) session already exists, it is reused — this
// endpoint is idempotent.
// ──────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connection();

    const urgencyMode: UrgencyMode = "fastest";

    // ── Reuse existing active session if one already exists ────────────────
    const existingSessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (existingSessionId) {
      const existing = await getSession(existingSessionId);
      if (existing && existing.status !== "confirmed" && existing.cart) {
        // Session already has an active cart — return it as-is
        return NextResponse.json({
          cart: existing.cart,
          urgencyMode: existing.urgencyMode,
          selectedSubstitutes: existing.selectedSubstitutes,
        });
      }
    }

    // ── Create a new browse-mode session ──────────────────────────────────
    const sessionId = uuidv4();

    const browseIntent: ParsedIntent = {
      scenario: "general",
      scenarioLabel: "General Shopping",
      urgency: "Low",
      category: "General",
      confidence: 100,
      summary: "Browsing the product catalog",
      deliveryMode: "standard",
      suggestedItems: [],
      usedBedrock: false,
    };

    const emptyCart: GeneratedCart = {
      items: [],
      totalPrice: 0,
      estimatedEta: 30,
      itemCount: 0,
      summaryLine: "0 items · General Shopping",
      intent: browseIntent,
    };

    await saveSession({
      sessionId,
      situationText: "Browsing products",
      intent: browseIntent,
      cart: emptyCart,
      urgencyMode,
      selectedSubstitutes: {},
      status: "active",
    });

    const res = NextResponse.json({
      cart: emptyCart,
      urgencyMode,
      selectedSubstitutes: {},
    });

    // Set the session cookie so subsequent PATCH /api/cart calls work
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/cart/browse] Error:", message);
    return NextResponse.json(
      { error: "Failed to create browse session", details: message },
      { status: 500 }
    );
  }
}
