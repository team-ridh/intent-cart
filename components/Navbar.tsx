"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useCartStore } from "@/store/cartStore";
import { getOrderHistory, type OrderHistoryEntry } from "@/lib/orderHistory";
import { parseIntent } from "@/lib/ai/intentParser";
import {
  ShoppingCartSimpleIcon,
  ClockCounterClockwiseIcon,
  XIcon,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(epochMs: number): string {
  const diff = Date.now() - epochMs;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

// ─── Orders Drawer ─────────────────────────────────────────────────────────────

interface OrderHistoryDrawerProps {
  orders: OrderHistoryEntry[];
  onReorder: (order: OrderHistoryEntry) => void;
  onClose: () => void;
  error?: string | null;
}

function OrderHistoryDrawer({
  orders,
  onReorder,
  onClose,
  error,
}: OrderHistoryDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="navbar-drawer-backdrop" aria-hidden />
      {/* Drawer panel */}
      <div
        className="navbar-drawer animate-slide-up"
        role="dialog"
        aria-label="Previous orders"
      >
        {/* Header */}
        <div className="navbar-drawer__header">
          <div>
            <div className="navbar-drawer__title">Previous Orders</div>
            <div className="navbar-drawer__subtitle">
              Tap any order to re-order it
            </div>
          </div>
          <button
            className="navbar-drawer__close btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        {/* Re-order error banner */}
        {error && (
          <div style={{
            margin: "0 0 12px",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Order list */}
        {orders.length === 0 ? (
          <div className="navbar-drawer__empty">
            <ClockCounterClockwiseIcon
              size={40}
              weight="light"
              color="var(--text-faint)"
            />
            <p>No previous orders yet</p>
          </div>
        ) : (
          <div className="navbar-drawer__list">
            {orders.map((order, i) => (
              <div key={order.sessionId || i} className="navbar-order-card">
                <div className="navbar-order-card__meta">
                  <div className="navbar-order-card__tags">
                    <span
                      className="badge badge-orange"
                      style={{ fontSize: 10 }}
                    >
                      {order.scenarioLabel}
                    </span>
                    <span className="navbar-order-card__time">
                      {formatRelativeTime(order.confirmedAt)}
                    </span>
                  </div>
                  <div className="navbar-order-card__situation">
                    {order.situationText}
                  </div>
                  <div className="navbar-order-card__summary">
                    {order.itemCount} items · ₹{order.totalPrice}
                  </div>
                </div>
                <button
                  className="btn-secondary navbar-order-card__reorder"
                  onClick={() => onReorder(order)}
                >
                  Re-order
                </button>
              </div>
            ))}
            {/* View full history link */}
            <a
              href="/history"
              style={{
                display: "block",
                textAlign: "center",
                padding: "12px 0 4px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--accent-teal)",
                textDecoration: "none",
              }}
            >
              View full order history →
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Navbar Props ──────────────────────────────────────────────────────────────

export interface NavbarProps {
  /** Optional centre title (used on the cart page) */
  title?: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Replaces the cart icon badge count. Pass the live item count from cart page. */
  cartItemCount?: number;
  /** Extra right-side content rendered between Orders and Cart buttons */
  rightSlot?: React.ReactNode;
  /** Called when the user successfully triggers a re-order (navigates away) */
  onReorder?: (order: OrderHistoryEntry) => Promise<void>;
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar({
  title,
  subtitle,
  cartItemCount,
  rightSlot,
  onReorder,
}: NavbarProps) {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);

  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Read order history on mount (client-only)
  useEffect(() => {
    setOrderHistory(getOrderHistory());
  }, []);

  // Transparent → frosted-glass on scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll(); // set correct state immediately on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Derive item count: prop override > store cart
  const itemCount =
    cartItemCount !== undefined ? cartItemCount : cart ? cart.itemCount : 0;

  // Default re-order handler if not provided by parent
  const {
    setSituationText,
    setIsLoading,
    setIntent,
    setCart,
    setSelectedSubstitutes,
  } = useCartStore();

  const handleReorder = useCallback(
    async (order: OrderHistoryEntry) => {
      setShowDrawer(false);

      if (onReorder) {
        await onReorder(order);
        return;
      }

      // Built-in: parse intent and navigate to cart
      setSituationText(order.situationText);
      setIsReordering(true);
      setIsLoading(true);
      setReorderError(null);
      try {
        const {
          intent,
          cart: newCart,
          initialSelections,
        } = await parseIntent(order.situationText, undefined);
        setIntent(intent);
        setCart(newCart);
        setSelectedSubstitutes(initialSelections);
        router.push("/cart");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Re-order failed. Please try again.";
        setReorderError(msg);
      } finally {
        setIsReordering(false);
        setIsLoading(false);
      }
    },
    [
      onReorder,
      setSituationText,
      setIsLoading,
      setIntent,
      setCart,
      setSelectedSubstitutes,
      router,
    ],
  );

  return (
    <>
      <nav className={`navbar${isScrolled ? " navbar--scrolled" : ""}`} aria-label="Main navigation">
        <div className="navbar__inner">
          {/* ── Left: Logo ──────────────────────────────────────── */}
          <a
            href="/"
            className="navbar__logo-link"
            aria-label="Intent Cart — home"
          >
            <Logo variant="nav" />
          </a>

          {/* ── Centre: optional title ──────────────────────────── */}
          {title && (
            <div className="navbar__title-group">
              <span className="navbar__title">{title}</span>
              {subtitle && <span className="navbar__subtitle">{subtitle}</span>}
            </div>
          )}

          {/* ── Right: spacer + Orders + Cart ──────────────────── */}
          <div className="navbar__right">
            {rightSlot}

            {/* Orders button */}
            <button
              id="nav-orders-btn"
              className={`navbar__orders-btn${isReordering ? " navbar__orders-btn--loading" : ""}`}
              onClick={() => setShowDrawer(true)}
              aria-label={`View order history (${orderHistory.length} orders)`}
              disabled={isReordering}
            >
              <ClockCounterClockwiseIcon size={16} weight="bold" />
              <span className="navbar__orders-label">Orders</span>
              {orderHistory.length > 0 && (
                <span className="navbar__orders-badge">
                  {orderHistory.length > 9 ? "9+" : orderHistory.length}
                </span>
              )}
            </button>

            {/* Cart icon */}
            <button
              id="nav-cart-btn"
              className="navbar__cart-btn"
              onClick={() => router.push("/cart")}
              aria-label={`View cart${itemCount > 0 ? ` — ${itemCount} items` : ""}`}
            >
              <ShoppingCartSimpleIcon
                size={20}
                weight={itemCount > 0 ? "fill" : "regular"}
              />
              {itemCount > 0 && (
                <span className="navbar__cart-badge">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Orders drawer — rendered in a portal-like position */}
      {showDrawer && (
        <OrderHistoryDrawer
          orders={orderHistory}
          onReorder={handleReorder}
          onClose={() => setShowDrawer(false)}
          error={reorderError}
        />
      )}
    </>
  );
}
