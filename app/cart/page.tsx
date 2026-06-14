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
import {
  LightningIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
  ShoppingCartIcon,
  PencilSimpleIcon,
  ArrowCounterClockwiseIcon,
  ShareNetworkIcon,
  FloppyDiskIcon,
  SparkleIcon,
  ArrowLeftIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import type { CartItem, UrgencyMode } from "@/lib/types";

const URGENCY_META = {
  fastest: { label: "Fastest",      badgeColor: "teal",   icon: LightningIcon },
  value:   { label: "Best Value",   badgeColor: "green",  icon: CurrencyDollarIcon },
  trusted: { label: "Most Trusted", badgeColor: "purple", icon: ShieldCheckIcon },
} as const;

// ─── Toast ─────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  onDismiss: () => void;
}

function Toast({ message, type = "success", onDismiss }: ToastProps) {
  const color =
    type === "success" ? "var(--accent-green)"
    : type === "warning" ? "var(--accent-amber)"
    : "var(--accent-teal)";
  const bg =
    type === "success" ? "rgba(22,163,74,0.12)"
    : type === "warning" ? "rgba(217,119,6,0.12)"
    : "rgba(0,153,187,0.12)";
  const border =
    type === "success" ? "rgba(22,163,74,0.35)"
    : type === "warning" ? "rgba(217,119,6,0.35)"
    : "rgba(0,153,187,0.35)";

  return (
    <div
      className="animate-float-in"
      onClick={onDismiss}
      style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 80, background: bg, border: `1px solid ${border}`, color,
        padding: "10px 20px", borderRadius: 50, fontSize: 13, fontWeight: 600,
        backdropFilter: "blur(20px)", whiteSpace: "nowrap", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {message}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);
  const timerRef = { current: 0 as unknown as ReturnType<typeof setTimeout> };
  const show = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

// ─── AI cart refine — as a modal sheet ────────────────────────────
interface CartRefineSheetProps {
  onApplied: (cart: import("@/lib/types").GeneratedCart, feedback: string) => void;
  onClose: () => void;
}

function CartRefineSheet({ onApplied, onClose }: CartRefineSheetProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRefine = async () => {
    const msg = text.trim();
    if (!msg) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/cart/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback(data.error ?? "Something went wrong"); return; }
      const fb = data.appliedOps?.length ? data.appliedOps.join(" · ") : data.noopReason ?? "No changes made";
      onApplied(data.cart, fb);
      setFeedback(fb);
      setText("");
    } catch {
      setFeedback("Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", zIndex: 60 }} aria-hidden />
      <div className="animate-slide-up" role="dialog" aria-label="Edit cart with AI" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
        borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Edit with AI</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Tell the AI what to change in your cart</div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="cart-refine-input"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRefine(); }}
            placeholder='e.g. "remove the soup" or "I already have Vicks"'
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 50,
              border: "1px solid var(--border)", background: "var(--bg-raised)",
              fontSize: 14, color: "var(--text-primary)", outline: "none",
            }}
            disabled={loading}
          />
          <button
            className="btn-primary"
            style={{ padding: "12px 20px", fontSize: 15, flexShrink: 0 }}
            onClick={handleRefine}
            disabled={loading || !text.trim()}
          >
            {loading ? "…" : "→"}
          </button>
        </div>
        {feedback && (
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--accent-teal)", paddingLeft: 4 }}>
            ✓ {feedback}
          </div>
        )}
      </div>
    </>
  );
}

// ─── More actions sheet ────────────────────────────────────────────
interface MoreActionsSheetProps {
  onSave: () => void;
  onRefine: () => void;
  onShare: () => void;
  onAiEdit: () => void;
  onClose: () => void;
}

function MoreActionsSheet({ onSave, onRefine, onShare, onAiEdit, onClose }: MoreActionsSheetProps) {
  const actions = [
    { id: "ai-edit", icon: SparkleIcon, label: "Edit with AI", sub: "Tell AI what to change", color: "var(--accent)", fn: onAiEdit },
    { id: "refine", icon: PencilSimpleIcon, label: "Refine situation", sub: "Go back and rephrase", color: "var(--text-secondary)", fn: onRefine },
    { id: "save", icon: FloppyDiskIcon, label: "Save cart", sub: "Save to browser storage", color: "var(--text-secondary)", fn: onSave },
    { id: "share", icon: ShareNetworkIcon, label: "Share cart", sub: "Copy or share cart summary", color: "var(--text-secondary)", fn: onShare },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", zIndex: 60 }} aria-hidden />
      <div className="animate-slide-up" role="dialog" aria-label="More actions" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
        borderRadius: "24px 24px 0 0", padding: "20px 20px 36px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>More options</div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {actions.map((a) => (
            <button
              key={a.id}
              id={`more-${a.id}`}
              onClick={() => { onClose(); a.fn(); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 12px", borderRadius: 14,
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "var(--bg-raised)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <a.icon size={18} weight="bold" color={a.color} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{a.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Main cart page ────────────────────────────────────────────────
function CartPage() {
  const router = useRouter();
  const {
    cart, intent, urgencyMode,
    selectedSubstitutes,
    syncUrgencyMode, syncSubstitute,
    adjustQuantity, removeItem,
    getTotalPrice, getFinalItems,
    loadFromServer, isLoading, error,
    situationText,
    setIsLoading,
  } = useCartStore();

  const [drawerItem, setDrawerItem] = useState<CartItem | null>(null);
  const [showRefineSheet, setShowRefineSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  useEffect(() => {
    if (!cart) {
      loadFromServer();
    } else {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
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

  const handleSave = useCallback(() => {
    if (!cart) return;
    const existing = localStorage.getItem("ic_saved_cart");
    localStorage.setItem("ic_saved_cart", JSON.stringify({ cart, intent, urgencyMode, selectedSubstitutes, savedAt: new Date().toISOString() }));
    showToast(existing ? "Cart updated" : "Cart saved", "success");
  }, [cart, intent, urgencyMode, selectedSubstitutes, showToast]);

  const handleRefine = useCallback(() => { router.push("/?refine=1"); }, [router]);

  const handleShare = useCallback(async () => {
    if (!cart || !intent) return;
    const items = getFinalItems().slice(0, 5).map((i) => `• ${i.name} — ₹${i.price}`).join("\n");
    const text = `Amazon Now OS — ${intent.scenarioLabel} Cart\n\n${cart.summaryLine}\n\n${items}\n\nTotal: ₹${getTotalPrice()} · ETA: ~${cart.estimatedEta} min`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `Amazon Now OS — ${intent.scenarioLabel} Cart`, text, url: window.location.origin }); showToast("Shared!", "success"); }
      catch (e) { if (e instanceof Error && e.name !== "AbortError") showToast("Could not share", "warning"); }
    } else {
      try { await navigator.clipboard.writeText(text); showToast("Copied to clipboard", "info"); }
      catch { showToast("Could not copy", "warning"); }
    }
  }, [cart, intent, getFinalItems, getTotalPrice, showToast]);

  // ─── Error state ──────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <WarningCircleIcon size={48} weight="fill" color="#EF4444" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Failed to load cart</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 380, marginBottom: 24 }}>{error}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => loadFromServer()}>
            <ArrowCounterClockwiseIcon size={14} weight="bold" /> Try Again
          </button>
          <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => router.push("/")}>
            <ArrowLeftIcon size={14} weight="bold" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty cart ───────────────────────────────────────────────
  if (!isLoading && cart && cart.items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <ShoppingCartIcon size={56} weight="light" color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Cart is empty</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360, marginBottom: 24, lineHeight: 1.6 }}>
          We couldn&apos;t find items for this situation. Try describing it differently.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={handleRefine}>
            <PencilSimpleIcon size={14} weight="bold" /> Refine Situation
          </button>
          <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => router.push("/")}>
            <LightningIcon size={14} weight="fill" /> New Situation
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const urgencyMeta = URGENCY_META[urgencyMode];

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "max(140px, calc(120px + env(safe-area-inset-bottom)))", maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      {/* Sheets */}
      {showRefineSheet && (
        <CartRefineSheet
          onApplied={(updatedCart, fb) => { useCartStore.setState({ cart: updatedCart }); showToast(fb, "success"); setShowRefineSheet(false); }}
          onClose={() => setShowRefineSheet(false)}
        />
      )}
      {showMoreSheet && (
        <MoreActionsSheet
          onSave={handleSave}
          onRefine={handleRefine}
          onShare={handleShare}
          onAiEdit={() => setShowRefineSheet(true)}
          onClose={() => setShowMoreSheet(false)}
        />
      )}

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(245,246,250,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", padding: "14px 0", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button id="cart-back-btn" className="btn-ghost" style={{ padding: "8px 12px" }} onClick={() => router.push("/")}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
              {isLoading ? "Building cart…" : "Your Cart"}
            </div>
            {!isLoading && cart && (
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 1 }}>
                {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""} · ₹{totalPrice}
              </div>
            )}
          </div>
          <Logo />
        </div>
      </div>

      {/* Situation context pill */}
      {!isLoading && situationText && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 12,
          background: "var(--bg-raised)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <SparkleIcon size={14} weight="fill" color="var(--accent)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {situationText}
          </span>
          {intent && (
            <span className={`badge badge-${intent.urgency === "High" ? "orange" : intent.urgency === "Medium" ? "amber" : "teal"}`} style={{ flexShrink: 0, fontSize: 11 }}>
              {intent.scenarioLabel}
            </span>
          )}
        </div>
      )}

      {/* Urgency toggle */}
      {!isLoading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Optimise for
          </div>
          <UrgencyBar value={urgencyMode} onChange={handleUrgencyChange} idPrefix="cart-urgency" showDescription />
        </div>
      )}

      {/* Cart items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="stagger">
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
          ))
        }
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
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: "rgba(245,246,250,0.97)", backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)", zIndex: 20,
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
            {/* More options */}
            <button
              id="cart-more-btn"
              className="btn-secondary"
              style={{ flexShrink: 0, padding: "0 14px", height: 52, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 14 }}
              onClick={() => setShowMoreSheet(true)}
              aria-label="More options"
            >
              <DotsThreeIcon size={22} weight="bold" />
            </button>

            {/* Delivery + checkout */}
            <button
              id="proceed-checkout-btn"
              className="btn-primary"
              style={{ flex: 1, fontSize: 16, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
              onClick={() => router.push("/checkout")}
            >
              <span>Checkout</span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                <span style={{ fontWeight: 800, fontSize: 17 }}>₹{totalPrice}</span>
                <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, display: "flex", alignItems: "center", gap: 3 }}>
                  <LightningIcon size={10} weight="fill" /> ~{cart.estimatedEta} min
                </span>
              </span>
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
