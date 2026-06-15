"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  getOrderHistory,
  type OrderHistoryEntry,
  type OrderHistoryItem,
} from "@/lib/orderHistory";
import { useCartStore } from "@/store/cartStore";
import { parseIntent } from "@/lib/ai/intentParser";
import {
  ClockCounterClockwiseIcon,
  PackageIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
  CaretDownIcon,
  CaretUpIcon,
  LightningIcon,
  ShoppingCartSimpleIcon,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────────────

function formatDate(epochMs: number): string {
  const date = new Date(epochMs);
  const now = new Date();
  const diff = now.getTime() - epochMs;
  const mins = Math.floor(diff / 60_000);

  if (mins < 60) return mins <= 1 ? "Just now" : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatFullDate(epochMs: number): string {
  return new Date(epochMs).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Order detail card ────────────────────────────────────────────

interface OrderCardProps {
  order: OrderHistoryEntry;
  onReorder: (order: OrderHistoryEntry) => void;
  onDelete: (sessionId: string) => void;
  isReordering: boolean;
}

function OrderCard({
  order,
  onReorder,
  onDelete,
  isReordering,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="history-card">
      {/* Header */}
      <div className="history-card__header">
        <div className="history-card__meta">
          <div className="history-card__tags">
            <span className="badge badge-orange">{order.scenarioLabel}</span>
            <span className="history-card__time">
              {formatDate(order.confirmedAt)}
            </span>
          </div>
          <div className="history-card__situation">{order.situationText}</div>
          <div className="history-card__summary">
            <span>{order.itemCount} items</span>
            <span className="history-card__dot">·</span>
            <span className="history-card__price">₹{order.totalPrice}</span>
            <span className="history-card__dot">·</span>
            <span>
              <LightningIcon
                size={11}
                weight="fill"
                style={{ verticalAlign: "middle", color: "var(--accent-teal)" }}
              />{" "}
              ~{order.estimatedEta} min
            </span>
          </div>
        </div>
        <div className="history-card__actions">
          <button
            className="btn-primary history-card__reorder-btn"
            onClick={() => onReorder(order)}
            disabled={isReordering}
            aria-label="Re-order"
          >
            <ArrowCounterClockwiseIcon size={14} weight="bold" />
            Re-order
          </button>
        </div>
      </div>

      {/* Items toggle */}
      {order.items && order.items.length > 0 && (
        <>
          <button
            className="history-card__expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <CaretUpIcon size={12} weight="bold" />
            ) : (
              <CaretDownIcon size={12} weight="bold" />
            )}
            {expanded ? "Hide items" : `View ${order.items.length} items`}
          </button>

          {expanded && (
            <div className="history-card__items">
              {order.items.map((item, i) => (
                <HistoryItemRow key={`${order.sessionId}-${i}`} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="history-card__footer">
        <span className="history-card__date">
          {formatFullDate(order.confirmedAt)}
        </span>
        <button
          className="btn-ghost history-card__delete-btn"
          onClick={() => onDelete(order.sessionId)}
          aria-label="Delete order"
        >
          <TrashIcon size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}

// ─── Item row inside expanded order ───────────────────────────────

function HistoryItemRow({ item }: { item: OrderHistoryItem }) {
  return (
    <div className="history-item-row">
      {item.image?.startsWith("http") ? (
        <img
          src={item.image}
          alt={item.name}
          className="history-item-row__img"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="history-item-row__placeholder">
          <PackageIcon size={18} weight="light" color="var(--text-muted)" />
        </div>
      )}
      <div className="history-item-row__info">
        <div className="history-item-row__name">{item.name}</div>
        <div className="history-item-row__brand">
          {item.brand} · ×{item.quantity}
        </div>
      </div>
      <div className="history-item-row__price">
        ₹{item.price * item.quantity}
      </div>
    </div>
  );
}

// ─── Main History Page ────────────────────────────────────────────

function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const {
    setSituationText,
    setIsLoading,
    setIntent,
    setCart,
    setSelectedSubstitutes,
  } = useCartStore();

  useEffect(() => {
    setOrders(getOrderHistory());
  }, []);

  const handleReorder = useCallback(
    async (order: OrderHistoryEntry) => {
      setIsReordering(true);
      setSituationText(order.situationText);
      setIsLoading(true);
      setReorderError(null);
      try {
        const { intent, cart, initialSelections } = await parseIntent(
          order.situationText,
          undefined,
        );
        setIntent(intent);
        setCart(cart);
        setSelectedSubstitutes(initialSelections);
        router.push("/cart");
      } catch (err) {
        setReorderError(err instanceof Error ? err.message : "Re-order failed. Please try again.");
      } finally {
        setIsReordering(false);
        setIsLoading(false);
      }
    },
    [
      setSituationText,
      setIsLoading,
      setIntent,
      setCart,
      setSelectedSubstitutes,
      router,
    ],
  );

  const handleDelete = useCallback((sessionId: string) => {
    const KEY = "ic_order_history";
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OrderHistoryEntry[];
      const updated = parsed.filter((e) => e.sessionId !== sessionId);
      localStorage.setItem(KEY, JSON.stringify(updated));
      setOrders(updated);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div className="history-page">
      <Navbar title="Order History" subtitle={`${orders.length} orders`} />

      <main className="history-page__content">
        {/* Re-order error banner */}
        {reorderError && (
          <div style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            ⚠ {reorderError}
          </div>
        )}
        {orders.length === 0 ? (
          <div className="history-empty">
            <ClockCounterClockwiseIcon
              size={56}
              weight="light"
              color="var(--text-faint)"
            />
            <h2 className="history-empty__title">No orders yet</h2>
            <p className="history-empty__desc">
              Your order history will appear here once you place your first
              order.
            </p>
            <button
              className="btn-primary"
              onClick={() => router.push("/")}
              style={{ marginTop: 16 }}
            >
              <ShoppingCartSimpleIcon size={16} weight="bold" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="history-list">
            {orders.map((order) => (
              <OrderCard
                key={order.sessionId}
                order={order}
                onReorder={handleReorder}
                onDelete={handleDelete}
                isReordering={isReordering}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <HistoryPage />
    </ErrorBoundary>
  );
}
