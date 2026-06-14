"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

function CheckoutPage() {
  const router = useRouter();
  const { cart, intent, urgencyMode, getFinalItems, getTotalPrice, loadFromServer, isLoading, error } = useCartStore();

  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from DynamoDB if store is empty (page refresh)
  useEffect(() => {
    if (!cart) loadFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown after confirmation
  useEffect(() => {
    if (!confirmed || countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [confirmed, countdown]);

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);

    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Confirmation failed" }));
        throw new Error(err.error ?? "Confirmation failed");
      }

      setConfirmed(true);
      setCountdown(cart?.estimatedEta ?? 15);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Confirmation failed";
      setConfirmError(message);
    } finally {
      setConfirming(false);
    }
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Failed to load checkout</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 380, marginBottom: 24 }}>{error}</p>
        <button className="btn-primary" onClick={() => router.push("/")}>← Start Over</button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const finalItems = getFinalItems();
  const deliveryFee = 0;
  const platformFee = 3;

  // ─── Confirmed State ──────────────────────────────────────────────
  if (confirmed) {
    const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
    const ss = String(countdown % 60).padStart(2, "0");

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 20, animation: "float-in 0.5s ease-out" }}>✅</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, marginBottom: 10 }}>
          Order <span className="gradient-text">Confirmed!</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
          Your cart is on its way. Estimated arrival:
        </p>

        <div className="glass-elevated" style={{ padding: "24px 48px", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 52, color: "var(--accent-teal)", letterSpacing: "-0.03em" }}>
            {countdown > 0 ? `${mm}:${ss}` : "Arriving soon"}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>minutes remaining</div>
        </div>

        <div style={{ marginBottom: 32, padding: "16px 24px", borderRadius: 16, background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Order summary</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>₹{totalPrice}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{cart?.itemCount} items · {intent?.scenarioLabel}</div>
        </div>

        <button className="btn-secondary" onClick={() => router.push("/")}>← Shop Again</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32" style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(245,246,250,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", marginBottom: 24, padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => router.push("/cart")}>
            ← Cart
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Checkout</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {isLoading ? "Loading…" : `${cart?.itemCount ?? 0} items · ₹${totalPrice}`}
            </div>
          </div>
          <Logo />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : cart && (
        <>
          {/* Intent badge */}
          {intent && (
            <div className="glass-elevated animate-float-in" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>✦</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
                  {intent.scenarioLabel} order · {intent.urgency} urgency
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {intent.confidence}% confident · via Amazon Bedrock
                </div>
              </div>
              {intent.usedBedrock && <span className="badge badge-purple" style={{ marginLeft: "auto" }}>AI ✓</span>}
            </div>
          )}

          {/* Order items */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              Order Summary
            </div>
            {finalItems.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.image}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {item.brand} · ×{item.quantity} · ⚡{item.eta} min
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>📍 Delivery Address</div>
              <button className="btn-ghost" style={{ fontSize: 12 }}>Change</button>
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
              123 MG Road, Bengaluru<br />
              Karnataka 560001 · Home
            </div>
          </div>

          {/* Payment */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>💳 Payment</div>
              <button className="btn-ghost" style={{ fontSize: 12 }}>Change</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#FF6B35,#FF9A6B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                AP
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Amazon Pay Balance</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>₹2,450.00 available</div>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
              Price Details
            </div>
            {[
              { label: `Items (${cart.itemCount})`, value: totalPrice },
              { label: "Delivery fee", value: deliveryFee, zero: true },
              { label: "Platform fee", value: platformFee },
            ].map(({ label, value, zero }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ color: zero ? "var(--accent-green)" : "var(--text-primary)", fontWeight: 500 }}>
                  {zero ? "FREE" : `₹${value}`}
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>
                ₹{totalPrice + platformFee}
              </span>
            </div>
          </div>

          {/* Delivery ETA chip */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div className="badge badge-teal" style={{ fontSize: 14, padding: "10px 20px", borderRadius: 24 }}>
              ⚡ Estimated delivery in {cart.estimatedEta} minutes
            </div>
          </div>

          {/* Confirm error */}
          {confirmError && (
            <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 14 }}>
              {confirmError}
            </div>
          )}
        </>
      )}

      {/* Bottom CTA */}
      {!isLoading && cart && !confirmed && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px", background: "rgba(245,246,250,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", zIndex: 20 }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <button
              id="confirm-order-btn"
              className="btn-primary"
              style={{ width: "100%", fontSize: 17, padding: "18px 32px", opacity: confirming ? 0.7 : 1 }}
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <><span style={{ display: "inline-block", animation: "rotate-slow 0.8s linear infinite" }}>⚙️</span> Confirming…</>
              ) : (
                `✓ Confirm & Place Order · ₹${totalPrice + platformFee}`
              )}
            </button>
            <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 11, marginTop: 8 }}>
              By placing this order you agree to Amazon Now OS terms
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <CheckoutPage />
    </ErrorBoundary>
  );
}
