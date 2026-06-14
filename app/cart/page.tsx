"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CartItemCard } from "@/components/CartItemCard";
import { SubstituteDrawer } from "@/components/SubstituteDrawer";
import { UrgencyBar } from "@/components/UrgencyBar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";
import type { CartItem, UrgencyMode } from "@/lib/types";

const URGENCY_META = {
  fastest: { label: "⚡ Fastest", badgeColor: "teal" },
  value:   { label: "💰 Best Value", badgeColor: "green" },
  trusted: { label: "⭐ Most Trusted", badgeColor: "purple" },
} as const;

function CartPage() {
  const router = useRouter();
  const {
    cart, intent, urgencyMode,
    selectedSubstitutes,
    syncUrgencyMode, syncSubstitute,
    adjustQuantity, removeItem,
    getTotalPrice, getFinalItems,
    loadFromServer, isLoading, error,
  } = useCartStore();

  const [drawerItem, setDrawerItem] = useState<CartItem | null>(null);

  // ─── Hydrate from DynamoDB on mount ──────────────────────────────
  // If cart is already in store (came directly from Screen 1), save it to DynamoDB.
  // If store is empty (e.g. page refresh), load from DynamoDB.
  useEffect(() => {
    if (!cart) {
      // Store is empty (page refresh) — load from DynamoDB
      loadFromServer();
    } else {
      // We have a cart from Screen 1 — persist it to DynamoDB
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ urgencyMode }),
      }).catch((err) => console.error("[Cart] Failed to persist cart to DynamoDB:", err));

      // Simulate AI loading delay for UX
      useCartStore.setState({ isLoading: true });
      setTimeout(() => useCartStore.setState({ isLoading: false }), 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUrgencyChange = useCallback(async (mode: UrgencyMode) => {
    await syncUrgencyMode(mode);
  }, [syncUrgencyMode]);

  const handleSubstituteSelect = useCallback(async (itemId: string, subId: string) => {
    await syncSubstitute(itemId, subId);
    setDrawerItem(null);
  }, [syncSubstitute]);

  // Error state
  if (error && !isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Failed to load cart</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 380, marginBottom: 24 }}>{error}</p>
        <button className="btn-primary" onClick={() => router.push("/")}>← Start Over</button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const urgencyMeta = URGENCY_META[urgencyMode];

  return (
    <main className="min-h-screen pb-32" style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(245,246,250,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", marginBottom: 24, padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button id="cart-back-btn" className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => router.push("/")}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Your Cart</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {isLoading ? "Generating…" : cart ? `${cart.itemCount} items · ₹${totalPrice}` : "Loading…"}
            </div>
          </div>
          {!isLoading && (
            <span className={`badge badge-${urgencyMeta.badgeColor}`}>{urgencyMeta.label}</span>
          )}
        </div>
      </div>

      {/* Intent summary banner */}
      {!isLoading && intent && (
        <div className="glass-elevated animate-float-in" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,93,42,0.15),rgba(0,153,187,0.08))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                {cart?.summaryLine}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-orange">{intent.scenarioLabel}</span>
                <span className={`badge badge-${intent.urgency === "High" ? "orange" : intent.urgency === "Medium" ? "amber" : "teal"}`}>
                  {intent.urgency} urgency
                </span>
                <span className="badge badge-teal">{intent.confidence}% confident</span>
                {intent.usedBedrock && <span className="badge badge-purple">Bedrock ✓</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency mode toggle */}
      {!isLoading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Optimise for</div>
          <UrgencyBar value={urgencyMode} onChange={handleUrgencyChange} idPrefix="cart-urgency" />
        </div>
      )}

      {/* Cart items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="stagger">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : (cart?.items ?? []).map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              selectedSubId={selectedSubstitutes[item.id]}
              onOpenSubs={() => setDrawerItem(item)}
              onAdjustQty={(d) => adjustQuantity(item.id, d)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
      </div>

      {/* Substitute drawer */}
      {drawerItem && (
        <SubstituteDrawer
          item={drawerItem}
          selectedId={selectedSubstitutes[drawerItem.id]}
          onClose={() => setDrawerItem(null)}
          onSelect={(subId) => handleSubstituteSelect(drawerItem.id, subId)}
        />
      )}

      {/* Bottom CTA */}
      {!isLoading && cart && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "rgba(245,246,250,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", zIndex: 20 }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Price summary */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, padding: "10px 16px", borderRadius: 12, background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>₹{totalPrice}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Items</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{cart.itemCount}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Arrives in</div>
                <div style={{ color: "var(--accent-teal)", fontWeight: 700, fontSize: 18 }}>⚡ {cart.estimatedEta} min</div>
              </div>
            </div>

            {/* Secondary actions */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>💾 Save</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>🔄 Refine</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>📤 Share</button>
            </div>

            <button
              id="proceed-checkout-btn"
              className="btn-primary"
              style={{ width: "100%", fontSize: 17, padding: "17px 32px" }}
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout → ₹{totalPrice}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <CartPage />
    </ErrorBoundary>
  );
}
