"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, intent, getFinalItems, getTotalPrice, urgencyMode, reset } = useCartStore();

  const [confirmed, setConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!cart || !intent) { router.replace("/"); return; }
  }, [cart, intent, router]);

  // ETA countdown after confirm
  useEffect(() => {
    if (!confirmed || !cart) return;
    setCountdown(cart.estimatedEta * 60);
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmed, cart]);

  if (!cart || !intent) return null;

  const finalItems = getFinalItems();
  const totalPrice = getTotalPrice();
  const platformFee = 9;
  const deliveryFee = urgencyMode === "fastest" ? 29 : urgencyMode === "value" ? 0 : 15;
  const grandTotal = totalPrice + platformFee + deliveryFee;

  const handleConfirm = () => {
    setConfirmed(true);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (confirmed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ textAlign: "center" }}>
        {/* Confetti dots */}
        {confetti && (
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 50 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: ["#FF6B35","#00D4FF","#22C55E","#8B5CF6","#F59E0B"][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  animation: `float-in ${0.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                  transform: `translateX(${(Math.random() - 0.5) * 200}px)`,
                }}
              />
            ))}
          </div>
        )}

        <div className="animate-bounce-in" style={{ maxWidth: 420 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "linear-gradient(135deg,#22C55E,#16A34A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 0 40px rgba(34,197,94,0.4)",
            fontSize: 46,
          }}>✓</div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
            letterSpacing: "-0.03em", marginBottom: 12
          }}>
            Order <span className="gradient-text">Confirmed!</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 16 }}>
            Your {intent.scenarioLabel.toLowerCase()} cart is on its way
          </p>

          {/* ETA Card */}
          <div className="glass-elevated" style={{ padding: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Arriving in
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48,
              color: "var(--accent-teal)", letterSpacing: "-0.04em",
              animation: "glow-pulse 2s ease-in-out infinite"
            }}>
              {formatTime(countdown)}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
              ⚡ {cart.estimatedEta}-{cart.estimatedEta + 3} minutes estimated
            </div>
          </div>

          {/* Summary pills */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <span className="badge badge-green">✓ {cart.itemCount} items</span>
            <span className="badge badge-teal">₹{grandTotal} charged</span>
            <span className="badge badge-orange">{intent.scenarioLabel}</span>
          </div>

          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <button className="btn-secondary" onClick={() => router.push("/")}>
              ← Back to Home
            </button>
            <button
              className="btn-ghost"
              style={{ color: "var(--text-muted)", fontSize: 13 }}
              onClick={() => { reset(); router.push("/"); }}
            >
              Start a new cart
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-40" style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>

      {/* ─── Header ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(10,11,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "16px 0", marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button id="checkout-back-btn" className="btn-ghost" onClick={() => router.back()}>← Cart</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Order Preview</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Review before confirming</div>
          </div>
          <span className="badge badge-green">Preview Only</span>
        </div>
      </div>

      {/* ─── Intent Summary ─── */}
      <div className="glass-elevated animate-float-in" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#FF6B35,#FF9A6B)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>✦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              {intent.scenarioLabel} · {cart.itemCount} items
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{intent.summary}</div>
          </div>
        </div>
      </div>

      {/* ─── Delivery ETA Card ─── */}
      <div className="card card-accent animate-float-in" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Estimated Delivery</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36,
              color: "var(--accent-teal)", lineHeight: 1,
            }}>
              {cart.estimatedEta} min
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
              {urgencyMode === "fastest" ? "⚡ Express delivery selected" :
               urgencyMode === "value" ? "💰 Best value delivery" : "⭐ Trusted courier"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              padding: "8px 16px", borderRadius: 12,
              background: "var(--accent-teal-dim)",
              border: "1px solid rgba(0,212,255,0.3)",
            }}>
              <div style={{ fontSize: 11, color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Window
              </div>
              <div style={{ color: "var(--accent-teal)", fontWeight: 700, fontSize: 14 }}>
                {cart.estimatedEta}–{cart.estimatedEta + 3} min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Delivery Address ─── */}
      <div className="card animate-float-in" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 22 }}>📍</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Delivery Address</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                Flat 4B, Prestige Towers, MG Road
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Bangalore, Karnataka 560001</div>
            </div>
          </div>
          <button className="btn-ghost" style={{ fontSize: 12 }}>Change</button>
        </div>
      </div>

      {/* ─── Payment Method ─── */}
      <div className="card animate-float-in" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>💳</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Amazon Pay</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Balance: ₹2,450 available</div>
            </div>
          </div>
          <div className="badge badge-green">Default</div>
        </div>
      </div>

      {/* ─── Order Items ─── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Your items ({cart.itemCount})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {finalItems.map((item, i) => (
            <div
              key={item.id}
              className="animate-float-in"
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 10,
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{item.image}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.brand} · qty {item.quantity}</div>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Substitution Review ─── */}
      {Object.keys(useCartStore.getState().selectedSubstitutes).length > 0 && (
        <div className="card animate-float-in" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>🔄 Substitutions Applied</div>
          {Object.entries(useCartStore.getState().selectedSubstitutes).map(([itemId, subId]) => {
            const cartItem = cart.items.find(i => i.id === itemId);
            const sub = cartItem?.substitutes.find(s => s.id === subId);
            if (!cartItem || !sub) return null;
            return (
              <div key={itemId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>{cartItem.name}</span>
                <span style={{ color: "var(--accent-teal)" }}>→ {sub.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Price Breakdown ─── */}
      <div className="glass-elevated animate-float-in" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Price Breakdown</div>
        {[
          { label: "Items total", value: `₹${totalPrice}` },
          { label: `Delivery fee ${urgencyMode === "value" ? "(free — value mode)" : ""}`, value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}` },
          { label: "Platform fee", value: `₹${platformFee}` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 14, marginBottom: 10,
            color: "var(--text-secondary)"
          }}>
            <span>{label}</span>
            <span style={{ color: value === "FREE" ? "var(--accent-green)" : "var(--text-primary)", fontWeight: 500 }}>
              {value}
            </span>
          </div>
        ))}
        <div className="divider" />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span style={{ fontFamily: "var(--font-display)" }}>₹{grandTotal}</span>
        </div>
        <div style={{ color: "var(--accent-green)", fontSize: 12, marginTop: 8 }}>
          ✓ No hidden charges · All prices inclusive of GST
        </div>
      </div>

      {/* ─── Trust badges ─── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        {["🔒 Secure payment", "📦 Packed safely", "⚡ Fast delivery", "🔄 Easy returns"].map((t) => (
          <span key={t} style={{ fontSize: 12, color: "var(--text-muted)" }}>{t}</span>
        ))}
      </div>

      {/* ─── Bottom CTA ─── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px", background: "rgba(10,11,15,0.9)",
        backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)",
        zIndex: 20,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <button
            id="confirm-order-btn"
            className="btn-primary animate-glow"
            style={{ width: "100%", fontSize: 18, padding: "18px 32px" }}
            onClick={handleConfirm}
          >
            ✓ Confirm & Place Order · ₹{grandTotal}
          </button>
          <p style={{
            textAlign: "center", color: "var(--text-faint)", fontSize: 11, marginTop: 8
          }}>
            By confirming, you agree to our Terms of Service. Payment via Amazon Pay.
          </p>
        </div>
      </div>
    </main>
  );
}
