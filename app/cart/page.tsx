"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CartItemCard } from "@/components/CartItemCard";
import { FeaturedItemCard } from "@/components/FeaturedItemCard";
import { SubstituteDrawer } from "@/components/SubstituteDrawer";
import { UrgencyBar } from "@/components/UrgencyBar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/Navbar";
import { getFeaturedItems, type FeaturedItem } from "@/lib/featuredItems";
import {
  LightningIcon,
  WarningCircleIcon,
  ShoppingCartIcon,
  PencilSimpleIcon,
  ArrowCounterClockwiseIcon,
  ShareNetworkIcon,
  FloppyDiskIcon,
  SparkleIcon,
  ArrowLeftIcon,
  DotsThreeIcon,
  GiftIcon,
  TruckIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react";
import type { CartItem, GeneratedCart, UrgencyMode } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = "success" | "info" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss };
}

function Toast({ message, type, onDismiss }: ToastState & { onDismiss: () => void }) {
  return (
    <div
      className={`cart-toast cart-toast--${type} animate-float-in`}
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sheet backdrop (shared)
// ─────────────────────────────────────────────────────────────────────────────

function SheetBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      aria-hidden
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Cart Refine Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface CartRefineSheetProps {
  onApplied: (cart: GeneratedCart, feedback: string) => void;
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

      if (!res.ok) {
        setFeedback(data.error ?? "Something went wrong");
        return;
      }

      const fb = data.appliedOps?.length
        ? data.appliedOps.join(" · ")
        : (data.noopReason ?? "No changes made");

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
      <SheetBackdrop onClose={onClose} />
      <div className="bottom-sheet animate-slide-up" role="dialog" aria-label="Edit cart with AI">
        <div className="bottom-sheet__header">
          <div>
            <p className="bottom-sheet__title">Edit with AI</p>
            <p className="bottom-sheet__subtitle">Tell the AI what to change in your cart</p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cart-refine__row">
          <input
            id="cart-refine-input"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRefine(); }}
            placeholder='e.g. "remove the soup" or "I already have Vicks"'
            className="cart-refine__input"
            disabled={loading}
          />
          <button
            className="btn-primary cart-refine__submit"
            onClick={handleRefine}
            disabled={loading || !text.trim()}
          >
            {loading ? "…" : "→"}
          </button>
        </div>

        {feedback && (
          <p className="cart-refine__feedback">✓ {feedback}</p>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// More Actions Sheet
// ─────────────────────────────────────────────────────────────────────────────

interface MoreActionsSheetProps {
  onSave: () => void;
  onRefine: () => void;
  onShare: () => void;
  onAiEdit: () => void;
  onClose: () => void;
}

const MORE_ACTIONS = [
  { id: "ai-edit",  Icon: SparkleIcon,     label: "Edit with AI",     sub: "Tell AI what to change",      colorVar: "var(--accent)" },
  { id: "refine",   Icon: PencilSimpleIcon, label: "Refine situation", sub: "Go back and rephrase",        colorVar: "var(--text-secondary)" },
  { id: "save",     Icon: FloppyDiskIcon,   label: "Save cart",        sub: "Save to browser storage",     colorVar: "var(--text-secondary)" },
  { id: "share",    Icon: ShareNetworkIcon, label: "Share cart",       sub: "Copy or share cart summary",  colorVar: "var(--text-secondary)" },
] as const;

function MoreActionsSheet({ onSave, onRefine, onShare, onAiEdit, onClose }: MoreActionsSheetProps) {
  const handlers: Record<string, () => void> = {
    "ai-edit": onAiEdit,
    refine:    onRefine,
    save:      onSave,
    share:     onShare,
  };

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div className="bottom-sheet animate-slide-up" role="dialog" aria-label="More actions">
        <div className="bottom-sheet__header">
          <p className="bottom-sheet__title">More options</p>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="more-actions__list">
          {MORE_ACTIONS.map(({ id, Icon, label, sub, colorVar }) => (
            <button
              key={id}
              id={`more-${id}`}
              className="more-actions__item"
              onClick={() => { onClose(); handlers[id](); }}
            >
              <span className="more-actions__icon">
                <Icon size={18} weight="bold" color={colorVar} />
              </span>
              <span>
                <span className="more-actions__label">{label}</span>
                <span className="more-actions__sub">{sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Summary (sidebar)
// ─────────────────────────────────────────────────────────────────────────────

interface OrderSummaryProps {
  itemCount: number;
  totalPrice: number;
  isGift: boolean;
  onGiftToggle: () => void;
  onCheckout: () => void;
}

function OrderSummary({ itemCount, totalPrice, isGift, onGiftToggle, onCheckout }: OrderSummaryProps) {
  return (
    <div className="order-summary">
      <p className="order-summary__subtotal">
        Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""}
        ):{" "}
        <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
      </p>

      <label className="order-summary__gift-label">
        <input
          type="checkbox"
          checked={isGift}
          onChange={onGiftToggle}
          className="order-summary__gift-checkbox"
        />
        <GiftIcon size={12} weight="regular" />
        This order contains a gift
      </label>

      <button
        id="proceed-checkout-btn"
        className="order-summary__checkout-btn"
        onClick={onCheckout}
      >
        Proceed to checkout
      </button>

      <div className="order-summary__meta">
        <span className="order-summary__meta-row order-summary__meta-row--secure">
          <LockSimpleIcon size={11} weight="fill" /> Secure transaction
        </span>
        <span className="order-summary__meta-row order-summary__meta-row--delivery">
          <TruckIcon size={11} weight="fill" /> FREE delivery on orders above ₹499
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured Items Panel (sidebar)
// ─────────────────────────────────────────────────────────────────────────────

interface FeaturedPanelProps {
  items: FeaturedItem[];
  onAdd: (item: FeaturedItem) => void;
}

function FeaturedPanel({ items, onAdd }: FeaturedPanelProps) {
  if (items.length === 0) return null;

  return (
    <div className="featured-panel">
      <p className="featured-panel__heading">Featured items you may like</p>
      <div className="featured-panel__list">
        {items.slice(0, 6).map((item) => (
          <FeaturedItemCard key={item.id} item={item} onAddToCart={onAdd} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Situation context pill
// ─────────────────────────────────────────────────────────────────────────────

interface SituationPillProps {
  text: string;
  urgency?: "High" | "Medium" | "Low";
  label?: string;
}

function SituationPill({ text, urgency, label }: SituationPillProps) {
  const badgeColor =
    urgency === "High" ? "orange" : urgency === "Medium" ? "amber" : "teal";

  return (
    <div className="situation-pill">
      <SparkleIcon size={13} weight="fill" color="var(--accent)" className="situation-pill__icon" />
      <span className="situation-pill__text">{text}</span>
      {label && (
        <span className={`badge badge-${badgeColor} situation-pill__badge`}>{label}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty / Error states
// ─────────────────────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry, onBack }: { error: string; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="cart-empty-state">
      <WarningCircleIcon size={48} weight="fill" color="#EF4444" />
      <h2 className="cart-empty-state__heading">Failed to load cart</h2>
      <p className="cart-empty-state__body">{error}</p>
      <div className="cart-empty-state__actions">
        <button className="btn-secondary" onClick={onRetry}>
          <ArrowCounterClockwiseIcon size={14} weight="bold" /> Try Again
        </button>
        <button className="btn-primary" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" /> Start Over
        </button>
      </div>
    </div>
  );
}

function EmptyCartState({ onRefine, onNew }: { onRefine: () => void; onNew: () => void }) {
  return (
    <div className="cart-empty-state">
      <ShoppingCartIcon size={56} weight="light" color="var(--text-muted)" />
      <h2 className="cart-empty-state__heading">Cart is empty</h2>
      <p className="cart-empty-state__body">
        We couldn&apos;t find items for this situation. Try describing it differently.
      </p>
      <div className="cart-empty-state__actions">
        <button className="btn-secondary" onClick={onRefine}>
          <PencilSimpleIcon size={14} weight="bold" /> Refine Situation
        </button>
        <button className="btn-primary" onClick={onNew}>
          <LightningIcon size={14} weight="fill" /> New Situation
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CartPage
// ─────────────────────────────────────────────────────────────────────────────

function CartPage() {
  const router = useRouter();
  const {
    cart, intent, urgencyMode, selectedSubstitutes,
    syncUrgencyMode, syncSubstitute,
    adjustQuantity, removeItem,
    getTotalPrice, getFinalItems,
    loadFromServer, isLoading, error,
    situationText, setIsLoading, setCart,
  } = useCartStore();

  const [drawerItem,       setDrawerItem]       = useState<CartItem | null>(null);
  const [showRefineSheet,  setShowRefineSheet]   = useState(false);
  const [showMoreSheet,    setShowMoreSheet]     = useState(false);
  const [isGift,           setIsGift]           = useState(false);

  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // Derive featured items from the current scenario (memoised via useMemo pattern)
  const featuredItems: FeaturedItem[] = cart && intent
    ? getFeaturedItems(new Set(cart.items.map((i) => i.id)), intent.scenario, 8)
    : [];

  // ── Bootstrap ──────────────────────────────────────────────────
  useEffect(() => {
    if (!cart) {
      loadFromServer();
    } else {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────
  const handleUrgencyChange = useCallback(
    (mode: UrgencyMode) => syncUrgencyMode(mode),
    [syncUrgencyMode],
  );

  const handleSubstituteSelect = useCallback(
    async (itemId: string, subId: string) => {
      await syncSubstitute(itemId, subId);
      setDrawerItem(null);
    },
    [syncSubstitute],
  );

  const handleSave = useCallback(() => {
    if (!cart) return;
    const existing = localStorage.getItem("ic_saved_cart");
    localStorage.setItem(
      "ic_saved_cart",
      JSON.stringify({ cart, intent, urgencyMode, selectedSubstitutes, savedAt: new Date().toISOString() }),
    );
    showToast(existing ? "Cart updated" : "Cart saved", "success");
  }, [cart, intent, urgencyMode, selectedSubstitutes, showToast]);

  const handleRefine = useCallback(() => router.push("/?refine=1"), [router]);

  const handleShare = useCallback(async () => {
    if (!cart || !intent) return;
    const lines = getFinalItems()
      .slice(0, 5)
      .map((i) => `• ${i.name} — ₹${i.price}`)
      .join("\n");
    const text = `Amazon Now OS — ${intent.scenarioLabel} Cart\n\n${cart.summaryLine}\n\n${lines}\n\nTotal: ₹${getTotalPrice()} · ETA: ~${cart.estimatedEta} min`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Amazon Now OS — ${intent.scenarioLabel} Cart`, text, url: window.location.origin });
        showToast("Shared!", "success");
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") showToast("Could not share", "warning");
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard", "info");
      } catch {
        showToast("Could not copy", "warning");
      }
    }
  }, [cart, intent, getFinalItems, getTotalPrice, showToast]);

  const handleAddFeatured = useCallback((featured: FeaturedItem) => {
    if (!cart) return;
    if (cart.items.some((i) => i.id === featured.id)) {
      showToast("Already in cart", "info");
      return;
    }

    const newItem: CartItem = {
      id:          featured.id,
      name:        featured.name,
      brand:       featured.brand,
      category:    featured.category,
      price:       featured.price,
      mrp:         featured.mrp,
      discount:    featured.discount,
      quantity:    1,
      unit:        "1 unit",
      image:       featured.image,
      asin:        featured.asin,
      rating:      featured.rating,
      reviewCount: featured.reviewCount,
      badge:       featured.badge,
      reason:      "Added from featured items",
      reasonTag:   featured.reasonTag,
      eta:         featured.eta,
      substitutes: [],
      isEssential: false,
      isAddon:     true,
    };

    const updatedItems = [...cart.items, newItem];
    const totalPrice   = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const estimatedEta = Math.max(...updatedItems.map((i) => i.eta));

    setCart({ ...cart, items: updatedItems, totalPrice, itemCount: updatedItems.length, estimatedEta });
    showToast(`${featured.name.split(" ").slice(0, 3).join(" ")} added`, "success");
  }, [cart, setCart, showToast]);

  // ── Derived values ─────────────────────────────────────────────
  const totalPrice   = getTotalPrice();
  const itemCount    = cart?.itemCount ?? 0;
  const estimatedEta = cart?.estimatedEta ?? 30;

  // ── Early returns ──────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <ErrorState
        error={error}
        onRetry={loadFromServer}
        onBack={() => router.push("/")}
      />
    );
  }

  if (!isLoading && cart && cart.items.length === 0) {
    return (
      <EmptyCartState
        onRefine={handleRefine}
        onNew={() => router.push("/")}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <main className="cart-page">

      {/* Toast notification */}
      {toast && <Toast {...toast} onDismiss={dismissToast} />}

      {/* AI refine sheet */}
      {showRefineSheet && (
        <CartRefineSheet
          onApplied={(updatedCart, fb) => {
            useCartStore.setState({ cart: updatedCart });
            showToast(fb, "success");
            setShowRefineSheet(false);
          }}
          onClose={() => setShowRefineSheet(false)}
        />
      )}

      {/* More actions sheet */}
      {showMoreSheet && (
        <MoreActionsSheet
          onSave={handleSave}
          onRefine={handleRefine}
          onShare={handleShare}
          onAiEdit={() => setShowRefineSheet(true)}
          onClose={() => setShowMoreSheet(false)}
        />
      )}

      {/* ── Sticky top nav ─────────────────────────────────────── */}
      <Navbar
        title={isLoading ? "Building cart…" : "Shopping Cart"}
        subtitle={
          !isLoading && cart
            ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
            : undefined
        }
        cartItemCount={itemCount}
      />

      {/* ── Page body ──────────────────────────────────────────── */}
      <div className="cart-body">
        <div className="cart-layout">

          {/* ── LEFT: Cart panel ─────────────────────────────── */}
          <div className="cart-panel">

            {/* Panel header */}
            <div className="cart-panel__header">
              <h1 className="cart-panel__title">
                {isLoading ? "Building cart…" : "Shopping Cart"}
              </h1>
              {!isLoading && cart && cart.items.length > 0 && (
                <span className="cart-panel__price-label">Price</span>
              )}
            </div>

            {/* Situation context */}
            {!isLoading && situationText && (
              <div className="cart-panel__situation">
                <SituationPill
                  text={situationText}
                  urgency={intent?.urgency}
                  label={intent?.scenarioLabel}
                />
              </div>
            )}

            {/* Items list */}
            <div className="cart-panel__items stagger">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="cart-panel__item-row cart-panel__item-row--skeleton">
                      <SkeletonCard />
                    </div>
                  ))
                : (cart?.items ?? []).map((item, idx, arr) => (
                    <div
                      key={item.id}
                      className={`cart-panel__item-row${idx < arr.length - 1 ? " cart-panel__item-row--bordered" : ""}`}
                    >
                      <CartItemCard
                        item={item}
                        selectedSubId={selectedSubstitutes[item.id]}
                        onOpenSubs={() => setDrawerItem(item)}
                        onAdjustQty={(d) => adjustQuantity(item.id, d)}
                        onRemove={() => removeItem(item.id)}
                      />
                    </div>
                  ))
              }
            </div>


            {/* Subtotal row */}
            {!isLoading && cart && (
              <div className="cart-panel__subtotal">
                Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""}):{" "}
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────────────── */}
          <aside className="cart-sidebar">
            {isLoading ? (
              <div className="cart-sidebar__skeleton">
                <div className="skeleton" style={{ height: 22, width: "85%", borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "55%", borderRadius: 6 }} />
              </div>
            ) : cart ? (
              <>
                {/* Fixed: urgency + order summary + featured heading */}
                <div className="cart-sidebar__fixed">
                  <div className="cart-sidebar__urgency">
                    <p className="cart-panel__urgency-label">Optimise Cart for</p>
                    <UrgencyBar
                      value={urgencyMode}
                      onChange={handleUrgencyChange}
                      idPrefix="cart-urgency"
                      showDescription
                    />
                  </div>

                  <OrderSummary
                    itemCount={itemCount}
                    totalPrice={totalPrice}
                    isGift={isGift}
                    onGiftToggle={() => setIsGift((v) => !v)}
                    onCheckout={() => router.push("/checkout")}
                  />

                  {/* Featured heading — pinned, never scrolls away */}
                  {featuredItems.length > 0 && (
                    <div className="featured-panel featured-panel--header">
                      <p className="featured-panel__heading">Featured items you may like</p>
                    </div>
                  )}
                </div>

                {/* Scrollable: only the featured items list */}
                {featuredItems.length > 0 && (
                  <div className="cart-sidebar__scrollable">
                    <div className="featured-panel featured-panel--body">
                      {featuredItems.slice(0, 6).map((item) => (
                        <FeaturedItemCard key={item.id} item={item} onAddToCart={handleAddFeatured} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </aside>

        </div>
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

      {/* ── Mobile bottom CTA ──────────────────────────────────── */}
      {!isLoading && cart && (
        <div className="cart-bottom-bar">
          <button
            id="cart-more-btn"
            className="btn-secondary cart-bottom-bar__more"
            onClick={() => setShowMoreSheet(true)}
            aria-label="More options"
          >
            <DotsThreeIcon size={22} weight="bold" />
          </button>
          <button
            className="btn-primary cart-bottom-bar__checkout"
            onClick={() => router.push("/checkout")}
          >
            <span>Checkout</span>
            <span className="cart-bottom-bar__price-stack">
              <span className="cart-bottom-bar__price">₹{totalPrice.toLocaleString("en-IN")}</span>
              <span className="cart-bottom-bar__eta">
                <LightningIcon size={10} weight="fill" /> ~{estimatedEta} min
              </span>
            </span>
          </button>
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <ErrorBoundary>
      <CartPage />
    </ErrorBoundary>
  );
}
