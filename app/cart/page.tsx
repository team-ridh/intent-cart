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
  Lightning,
  CurrencyDollar,
  ShieldCheck,
  WarningCircle,
  ShoppingCart,
  PencilSimple,
  ArrowCounterClockwise,
  ShareNetwork,
  FloppyDisk,
  Sparkle,
  CheckCircle,
  ClipboardText,
  Warning,
  ArrowLeft,
  Crosshair,
} from "@phosphor-icons/react";
import type { CartItem, UrgencyMode } from "@/lib/types";

const URGENCY_META = {
  fastest: { label: "Fastest",      badgeColor: "teal",   icon: Lightning },
  value:   { label: "Best Value",   badgeColor: "green",  icon: CurrencyDollar },
  trusted: { label: "Most Trusted", badgeColor: "purple", icon: ShieldCheck },
} as const;

// ─── Toast notification ────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  onDismiss: () => void;
}

function Toast({ message, type = "success", onDismiss }: ToastProps) {
  const bg =
    type === "success"
      ? "rgba(22,163,74,0.12)"
      : type === "warning"
      ? "rgba(217,119,6,0.12)"
      : "rgba(0,153,187,0.12)";
  const border =
    type === "success"
      ? "rgba(22,163,74,0.35)"
      : type === "warning"
      ? "rgba(217,119,6,0.35)"
      : "rgba(0,153,187,0.35)";
  const color =
    type === "success"
      ? "var(--accent-green)"
      : type === "warning"
      ? "var(--accent-amber)"
      : "var(--accent-teal)";

  return (
    <div
      className="animate-float-in"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 80,
        background: bg,
        border: `1px solid ${border}`,
        color,
        padding: "12px 20px",
        borderRadius: 50,
        fontSize: 14,
        fontWeight: 600,
        backdropFilter: "blur(20px)",
        whiteSpace: "nowrap",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
      onClick={onDismiss}
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
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
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
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // ─── Hydrate from DynamoDB on mount ────────────────────────────
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
      setIsLoading(true); // ✅ Uses proper store action (not useCartStore.setState)
      setTimeout(() => setIsLoading(false), 1200);
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

  // ─── Save cart ─────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!cart) return;
    const savedData = {
      cart,
      intent,
      urgencyMode,
      selectedSubstitutes,
      savedAt: new Date().toISOString(),
    };
    const existing = localStorage.getItem("ic_saved_cart");
    const isUpdate = !!existing;
    localStorage.setItem("ic_saved_cart", JSON.stringify(savedData));
    showToast(isUpdate ? "Cart updated" : "Cart saved", "success");
  }, [cart, intent, urgencyMode, selectedSubstitutes, showToast]);

  // ─── Refine (back to input WITHOUT resetting store) ─────────────
  const handleRefine = useCallback(() => {
    router.push("/?refine=1");
  }, [router]);

  // ─── Share cart ────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!cart || !intent) return;

    const finalItems = getFinalItems();
    const itemList = finalItems
      .slice(0, 5)
      .map((item) => `• ${item.name} — ₹${item.price}`)
      .join("\n");

    const shareText =
      `Amazon Now OS — ${intent.scenarioLabel} Cart\n\n` +
      `${cart.summaryLine}\n\n` +
      `${itemList}\n\n` +
      `Total: ₹${getTotalPrice()} · ETA: ~${cart.estimatedEta} min`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Amazon Now OS — ${intent.scenarioLabel} Cart`,
          text: shareText,
          url: window.location.origin,
        });
        showToast("Shared!", "success");
      } catch (err) {
        // User cancelled share — not an error
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[Cart] Share failed:", err.message);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Cart summary copied to clipboard", "info");
      } catch {
        showToast("Could not copy to clipboard", "warning");
      }
    }
  }, [cart, intent, getFinalItems, getTotalPrice, showToast]);

  // ─── Error state ──────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <WarningCircle size={48} weight="fill" color="#EF4444" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
          Failed to load cart
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 380, marginBottom: 24 }}>{error}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => loadFromServer()}>
            <ArrowCounterClockwise size={14} weight="bold" /> Try Again
          </button>
          <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => router.push("/")}>
            <ArrowLeft size={14} weight="bold" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty cart state ─────────────────────────────────────────
  if (!isLoading && cart && cart.items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <ShoppingCart size={56} weight="light" color="var(--text-muted)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
          Cart is empty
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360, marginBottom: 24, lineHeight: 1.6 }}>
          We couldn&apos;t find items for this situation. Try describing it differently.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={handleRefine}>
            <PencilSimple size={14} weight="bold" /> Refine Situation
          </button>
          <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => router.push("/")}>
            <Lightning size={14} weight="fill" /> New Situation
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const urgencyMeta = URGENCY_META[urgencyMode];

  return (
    <main className="min-h-screen pb-32" style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

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
            <span className={`badge badge-${urgencyMeta.badgeColor}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <urgencyMeta.icon size={11} weight="fill" /> {urgencyMeta.label}
            </span>
          )}
        </div>
      </div>

      {/* Refining banner */}
      {situationText && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <Crosshair size={13} weight="bold" color="var(--accent)" style={{ flexShrink: 0 }} />
            <span style={{ color: "var(--text-muted)" }}>Situation:</span> {situationText}
          </div>
          <button className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }} onClick={handleRefine}>
            <PencilSimple size={11} weight="bold" /> Refine
          </button>
        </div>
      )}

      {/* Intent summary banner */}
      {!isLoading && intent && cart && (
        <div className="glass-elevated animate-float-in" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,rgba(232,93,42,0.15),rgba(0,153,187,0.08))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkle size={20} weight="fill" color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                {/* Rebuild dynamically — cart.summaryLine is stale after item changes */}
                {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""} curated for your{" "}
                {intent.urgency === "High" ? "urgent" : intent.urgency === "Medium" ? "time-sensitive" : "relaxed"}{" "}
                {intent.scenarioLabel.toLowerCase()} need · arrives in ~{cart.estimatedEta} min
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-orange">{intent.scenarioLabel}</span>
                <span className={`badge badge-${intent.urgency === "High" ? "orange" : intent.urgency === "Medium" ? "amber" : "teal"}`}>
                  {intent.urgency} urgency
                </span>
                <span className="badge badge-teal">{intent.confidence}% confident</span>
                {intent.usedBedrock && <span className="badge badge-purple" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><CheckCircle size={10} weight="fill" /> Bedrock</span>}
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
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>+₹3 platform fee</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Items</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{cart.itemCount}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Arrives in</div>
                <div style={{ color: "var(--accent-teal)", fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                  <Lightning size={14} weight="fill" /> {cart.estimatedEta} min
                </div>
              </div>
            </div>

            {/* Secondary actions — all wired */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                id="cart-save-btn"
                className="btn-secondary"
                style={{ flex: 1, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onClick={handleSave}
              >
                <FloppyDisk size={13} weight="bold" /> Save
              </button>
              <button
                id="cart-refine-btn"
                className="btn-secondary"
                style={{ flex: 1, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onClick={handleRefine}
              >
                <ArrowCounterClockwise size={13} weight="bold" /> Refine
              </button>
              <button
                id="cart-share-btn"
                className="btn-secondary"
                style={{ flex: 1, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onClick={handleShare}
              >
                <ShareNetwork size={13} weight="bold" /> Share
              </button>
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
