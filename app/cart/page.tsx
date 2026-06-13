"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import type { CartItem, Substitute, UrgencyMode } from "@/lib/types";

// ─── Skeleton loader ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: "80%", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 70 }} />
          <div className="skeleton" style={{ height: 24, width: 50 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Substitute Drawer ────────────────────────────────────────────
function SubstituteDrawer({
  item,
  onClose,
  onSelect,
  selectedId,
}: {
  item: CartItem;
  onClose: () => void;
  onSelect: (subId: string) => void;
  selectedId?: string;
}) {
  const typeColor: Record<string, string> = {
    fastest: "var(--accent-teal)",
    cheapest: "var(--accent-green)",
    trusted: "var(--accent-purple)",
    best: "var(--accent)",
  };
  const typeLabel: Record<string, string> = {
    fastest: "⚡ Fastest",
    cheapest: "💰 Cheapest",
    trusted: "⭐ Trusted",
    best: "✦ Best Match",
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", zIndex: 40,
        }}
      />
      {/* Drawer */}
      <div
        className="animate-slide-up"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: 24, maxHeight: "80vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
              {item.image} Substitutes for {item.name}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
              Select the best option for your need
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} id="close-substitute-drawer">✕</button>
        </div>

        {/* Original item */}
        <div
          className={`card${!selectedId ? " card-accent" : ""}`}
          style={{ marginBottom: 10, cursor: "pointer" }}
          onClick={() => onSelect("")}
          id={`sub-original-${item.id}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="badge badge-orange">✦ Best Match</span>
                {!selectedId && <span style={{ fontSize: 11, color: "var(--accent)" }}>Selected</span>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.brand}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>₹{item.price}</div>
              <div style={{ color: "var(--accent-teal)", fontSize: 12 }}>⚡ {item.eta} min</div>
            </div>
          </div>
        </div>

        {/* Substitutes */}
        {item.substitutes.map((sub) => (
          <div
            key={sub.id}
            className={`card${selectedId === sub.id ? " card-accent" : ""}`}
            style={{ marginBottom: 10, cursor: "pointer" }}
            onClick={() => onSelect(sub.id)}
            id={`sub-${sub.id}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                    background: `${typeColor[sub.type]}20`, color: typeColor[sub.type],
                    border: `1px solid ${typeColor[sub.type]}40`
                  }}>
                    {typeLabel[sub.type]}
                  </span>
                  {selectedId === sub.id && <span style={{ fontSize: 11, color: "var(--accent)" }}>Selected</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{sub.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{sub.brand}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                  {sub.reason}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                  ₹{sub.price}
                  {sub.price < item.price && (
                    <span style={{ fontSize: 11, color: "var(--accent-green)", display: "block" }}>
                      save ₹{item.price - sub.price}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--accent-teal)", fontSize: 12 }}>⚡ {sub.eta} min</div>
              </div>
            </div>
          </div>
        ))}

        {item.substitutes.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0", fontSize: 14 }}>
            No substitutes available — this is the only option in stock.
          </div>
        )}
      </div>
    </>
  );
}

// ─── Cart Item Card ───────────────────────────────────────────────
function CartItemCard({
  item,
  onOpenSubs,
  onAdjustQty,
  onRemove,
  selectedSubId,
}: {
  item: CartItem;
  onOpenSubs: () => void;
  onAdjustQty: (delta: number) => void;
  onRemove: () => void;
  selectedSubId?: string;
}) {
  const [removing, setRemoving] = useState(false);
  const activeSub = item.substitutes.find((s) => s.id === selectedSubId);
  const displayPrice = activeSub ? activeSub.price : item.price;
  const displayName = activeSub ? activeSub.name : item.name;
  const displayBrand = activeSub ? activeSub.brand : item.brand;
  const displayEta = activeSub ? activeSub.eta : item.eta;

  const tagColors: Record<string, string> = {
    "Hosting essential": "orange",
    "Required for serving": "orange",
    "Serving necessity": "orange",
    "Tea pairing": "orange",
    "Quick serving": "orange",
    "Cleanup convenience": "teal",
    "Fever relief": "orange",
    "Congestion relief": "teal",
    "Hygiene essential": "teal",
    "Hydration": "teal",
    "Recovery nutrition": "green",
    "Natural remedy": "green",
    "Immunity boost": "green",
    "Pooja essential": "purple",
    "Sacred offering": "purple",
    "Ritual offering": "purple",
    "Aarti ritual": "purple",
    "Emergency light": "amber",
    "Battery backup": "amber",
    "Fire starter": "amber",
    "Water backup": "teal",
    "Travel essential": "teal",
    "Travel hygiene": "green",
    "Device power": "orange",
    "Energy boost": "green",
    "Project essential": "purple",
    "Craft tool": "purple",
    "Rainy day comfort": "teal",
    "Indoor meal": "teal",
    "Comfort food": "teal",
  };
  const badgeType = tagColors[item.reasonTag] ?? "orange";

  return (
    <div
      className={`card animate-float-in${removing ? "" : ""}`}
      style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        opacity: removing ? 0 : 1, transition: "opacity 0.3s",
        position: "relative",
      }}
    >
      {/* Emoji icon */}
      <div style={{
        width: 60, height: 60, borderRadius: 12, flexShrink: 0,
        background: "var(--bg-elevated)", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 28,
      }}>
        {item.image}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{displayName}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{displayBrand}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>₹{displayPrice}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>/{item.unit}</div>
          </div>
        </div>

        {/* Reason badge */}
        <div style={{ marginTop: 8 }}>
          <span className={`badge badge-${badgeType}`}>
            {item.reasonTag}
          </span>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
          {item.reason}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {/* ETA */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--accent-teal)", fontSize: 12 }}>⚡</span>
            <span style={{ color: "var(--accent-teal)", fontSize: 12, fontWeight: 600 }}>{displayEta} min</span>
          </div>

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              id={`qty-dec-${item.id}`}
              className="btn-ghost"
              style={{ padding: "2px 8px", fontSize: 16 }}
              onClick={() => onAdjustQty(-1)}
            >−</button>
            <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center", fontSize: 14 }}>
              {item.quantity}
            </span>
            <button
              id={`qty-inc-${item.id}`}
              className="btn-ghost"
              style={{ padding: "2px 8px", fontSize: 16 }}
              onClick={() => onAdjustQty(1)}
            >+</button>
          </div>

          {/* Substitutes button */}
          {item.substitutes.length > 0 && (
            <button
              id={`subs-btn-${item.id}`}
              className="btn-ghost"
              style={{ fontSize: 12, padding: "4px 10px", color: activeSub ? "var(--accent)" : "var(--text-muted)" }}
              onClick={onOpenSubs}
            >
              {activeSub ? `✓ ${activeSub.name.split(" ")[0]}` : `⇄ Substitutes (${item.substitutes.length})`}
            </button>
          )}

          {/* Remove */}
          <button
            id={`remove-${item.id}`}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "4px 8px", color: "var(--text-faint)", marginLeft: "auto" }}
            onClick={() => { setRemoving(true); setTimeout(onRemove, 300); }}
          >✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const {
    cart, intent, urgencyMode, setUrgencyMode,
    selectedSubstitutes, selectSubstitute,
    adjustQuantity, removeItem,
    getTotalPrice, getFinalItems,
  } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [drawerItem, setDrawerItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (!cart || !intent) { router.replace("/"); return; }
    const t = setTimeout(() => setLoading(false), 1200); // simulate AI load
    return () => clearTimeout(t);
  }, [cart, intent, router]);

  if (!cart || !intent) return null;

  const totalPrice = getTotalPrice();
  const finalItems = getFinalItems();
  const urgencyMeta = {
    fastest: { label: "⚡ Fastest", color: "var(--accent-teal)", bg: "var(--accent-teal-dim)" },
    value: { label: "💰 Best Value", color: "var(--accent-green)", bg: "var(--accent-green-dim)" },
    trusted: { label: "⭐ Most Trusted", color: "var(--accent-purple)", bg: "rgba(139,92,246,0.15)" },
  };

  return (
    <main className="min-h-screen pb-32" style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>
      {/* ─── Sticky Header ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(10,11,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", marginBottom: 24,
        padding: "16px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button id="cart-back-btn" className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => router.push("/")}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
              Your Cart
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {loading ? "Generating…" : `${cart.items.length} items · ₹${totalPrice}`}
            </div>
          </div>
          <div className={`badge badge-${urgencyMode === "fastest" ? "teal" : urgencyMode === "value" ? "green" : "purple"}`}>
            {urgencyMeta[urgencyMode].label}
          </div>
        </div>
      </div>

      {/* ─── Intent Summary Banner ─── */}
      {!loading && (
        <div className="glass-elevated animate-float-in" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(255,107,53,0.2),rgba(0,212,255,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                {cart.summaryLine}
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

      {/* ─── Urgency Mode Toggle ─── */}
      {!loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
            Optimise for
          </div>
          <div className="urgency-bar">
            {(["fastest", "value", "trusted"] as UrgencyMode[]).map((m) => (
              <button
                key={m}
                id={`cart-urgency-${m}`}
                className={`urgency-item ${m}${urgencyMode === m ? " active" : ""}`}
                onClick={() => setUrgencyMode(m)}
              >
                {m === "fastest" ? "⚡ Fastest" : m === "value" ? "💰 Best Value" : "⭐ Most Trusted"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Cart Items ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="stagger">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : cart.items.map((item) => (
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

      {/* ─── Substitute Drawer ─── */}
      {drawerItem && (
        <SubstituteDrawer
          item={drawerItem}
          selectedId={selectedSubstitutes[drawerItem.id]}
          onClose={() => setDrawerItem(null)}
          onSelect={(subId) => {
            selectSubstitute(drawerItem.id, subId);
            setDrawerItem(null);
          }}
        />
      )}

      {/* ─── Bottom CTA ─── */}
      {!loading && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px 20px", background: "rgba(10,11,15,0.9)",
          backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)",
          zIndex: 20,
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Price & ETA summary */}
            <div style={{
              display: "flex", justifyContent: "space-between", marginBottom: 12,
              padding: "10px 16px", borderRadius: 12,
              background: "var(--bg-raised)", border: "1px solid var(--border)"
            }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>
                  ₹{totalPrice}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Items</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{cart.items.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Arrives in</div>
                <div style={{ color: "var(--accent-teal)", fontWeight: 700, fontSize: 18 }}>
                  ⚡ {cart.estimatedEta} min
                </div>
              </div>
            </div>

            {/* Secondary actions */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>
                💾 Save Situation
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>
                🔄 Refine Cart
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>
                📤 Share
              </button>
            </div>

            <button
              id="proceed-checkout-btn"
              className="btn-primary animate-glow"
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
