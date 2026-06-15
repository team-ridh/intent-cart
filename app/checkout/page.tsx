"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { saveOrderToHistory } from "@/lib/orderHistory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/Navbar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import {
  HouseIcon,
  BuildingsIcon,
  MapPinIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  LightningIcon,
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  GearSixIcon,
  PackageIcon,
  WarningIcon,
  LockSimpleIcon,
  TruckIcon,
  PlusIcon,
  CaretDownIcon,
  CaretUpIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";

// ─── Address types ────────────────────────────────────────────────
type AddressType = "Home" | "Work" | "Other";

interface Address {
  name: string;
  line1: string;
  line2: string;
  pincode: string;
  type: AddressType;
}

const DEFAULT_ADDRESS: Address = {
  name: "Anand",
  line1: "123 MG Road, Indiranagar",
  line2: "Bengaluru, Karnataka",
  pincode: "560038",
  type: "Home",
};

// ─── Payment types ────────────────────────────────────────────────
type PaymentMethod = "amazonpay" | "upi" | "cod";

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  icon: string;
  sub: string;
  fee: number;
}> = [
  {
    id: "amazonpay",
    label: "Amazon Pay Balance",
    icon: "AP",
    sub: "₹15,979.04 available",
    fee: 0,
  },
  {
    id: "upi",
    label: "UPI",
    icon: "UPI",
    sub: "Google Pay, PhonePe, Paytm",
    fee: 0,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "₹",
    sub: "Pay when delivered",
    fee: 50,
  },
];

// ─── Address Editor ───────────────────────────────────────────────
interface AddressEditorProps {
  address: Address;
  onChange: (a: Address) => void;
  onSave: () => void;
  onCancel: () => void;
}

function AddressEditor({
  address,
  onChange,
  onSave,
  onCancel,
}: AddressEditorProps) {
  return (
    <div className="checkout-addr-editor">
      <input
        className="checkout-input"
        placeholder="Full name"
        value={address.name}
        onChange={(e) => onChange({ ...address, name: e.target.value })}
      />
      <input
        className="checkout-input"
        placeholder="Street address"
        value={address.line1}
        onChange={(e) => onChange({ ...address, line1: e.target.value })}
      />
      <input
        className="checkout-input"
        placeholder="City, State"
        value={address.line2}
        onChange={(e) => onChange({ ...address, line2: e.target.value })}
      />
      <input
        className="checkout-input"
        placeholder="PIN code"
        value={address.pincode}
        onChange={(e) => onChange({ ...address, pincode: e.target.value })}
      />
      <div className="checkout-addr-types">
        {(["Home", "Work", "Other"] as AddressType[]).map((t) => (
          <button
            key={t}
            className={`checkout-addr-type${address.type === t ? " checkout-addr-type--active" : ""}`}
            onClick={() => onChange({ ...address, type: t })}
          >
            {t === "Home" ? (
              <HouseIcon size={12} weight="bold" />
            ) : t === "Work" ? (
              <BuildingsIcon size={12} weight="bold" />
            ) : (
              <MapPinIcon size={12} weight="bold" />
            )}
            {t}
          </button>
        ))}
      </div>
      <div className="checkout-addr-actions">
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn-primary"
          style={{ fontSize: 13, padding: "10px 20px" }}
          onClick={onSave}
        >
          <CheckCircleIcon size={13} weight="fill" /> Save Address
        </button>
      </div>
    </div>
  );
}

// ─── Payment Section ──────────────────────────────────────────────
interface PaymentSectionProps {
  selected: PaymentMethod;
  upiId: string;
  onUpiIdChange: (v: string) => void;
  onSelect: (m: PaymentMethod) => void;
  expanded: boolean;
  onToggle: () => void;
}

function PaymentSection({
  selected,
  upiId,
  onUpiIdChange,
  onSelect,
  expanded,
  onToggle,
}: PaymentSectionProps) {
  return (
    <div className="checkout-section">
      <div
        className="checkout-section__header"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >
        <div className="checkout-section__step">2</div>
        <h2 className="checkout-section__title">Payment method</h2>
        {!expanded && (
          <button
            className="checkout-change-btn"
            style={{ marginLeft: "auto" }}
          >
            Change
          </button>
        )}
      </div>

      {!expanded && (
        <div className="checkout-section__summary">
          <div className="checkout-payment-badge">
            <div
              className={`checkout-payment-icon checkout-payment-icon--${selected}`}
            >
              {PAYMENT_OPTIONS.find((o) => o.id === selected)?.icon}
            </div>
            <span>{PAYMENT_OPTIONS.find((o) => o.id === selected)?.label}</span>
          </div>
        </div>
      )}

      {expanded && (
        <div className="checkout-section__body">
          <div className="checkout-pay-heading">Select payment method</div>

          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`checkout-pay-option${selected === opt.id ? " checkout-pay-option--active" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                checked={selected === opt.id}
                onChange={() => onSelect(opt.id)}
                className="checkout-radio"
              />
              <div
                className={`checkout-payment-icon checkout-payment-icon--${opt.id}`}
              >
                {opt.icon}
              </div>
              <div className="checkout-pay-option__info">
                <div className="checkout-pay-option__label">{opt.label}</div>
                <div className="checkout-pay-option__sub">
                  {opt.sub}
                  {opt.fee > 0 && (
                    <span className="checkout-pay-fee"> +₹{opt.fee} fee</span>
                  )}
                </div>
              </div>
            </label>
          ))}

          {selected === "upi" && (
            <input
              className="checkout-input"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => onUpiIdChange(e.target.value)}
              style={{ marginTop: 8 }}
            />
          )}

          {/* Coupon code input */}
          <div className="checkout-coupon-row">
            <PlusIcon size={12} weight="bold" color="var(--text-muted)" />
            <input
              className="checkout-input checkout-coupon-input"
              placeholder="Enter promo code"
            />
            <button
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Item Row ───────────────────────────────────────────────
function OrderItemRow({ item }: { item: CartItem }) {
  return (
    <div className="checkout-item-row">
      <div className="checkout-item-row__img-wrap">
        {item.image?.startsWith("http") ? (
          <img
            src={item.image}
            alt={item.name}
            className="checkout-item-row__img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <PackageIcon size={28} weight="light" color="var(--text-muted)" />
        )}
      </div>
      <div className="checkout-item-row__details">
        <div className="checkout-item-row__name">{item.name}</div>
        <div className="checkout-item-row__brand">{item.brand}</div>
        <div className="checkout-item-row__meta">
          <span className="checkout-item-row__price">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          {item.mrp && item.mrp > item.price && (
            <span className="checkout-item-row__mrp">
              ₹{item.mrp.toLocaleString("en-IN")}
            </span>
          )}
          <span className="checkout-item-row__qty">Qty: {item.quantity}</span>
        </div>
        <div className="checkout-item-row__delivery">
          <LightningIcon size={11} weight="fill" />
          <span>~{item.eta} min delivery</span>
        </div>
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────
interface OrderSidebarProps {
  itemCount: number;
  totalPrice: number;
  platformFee: number;
  codFee: number;
  grandTotal: number;
  estimatedEta: number;
  onPlaceOrder: () => void;
  confirming: boolean;
  disabled: boolean;
}

function OrderSidebar({
  itemCount,
  totalPrice,
  platformFee,
  codFee,
  grandTotal,
  estimatedEta,
  onPlaceOrder,
  confirming,
  disabled,
}: OrderSidebarProps) {
  return (
    <div className="checkout-sidebar">
      <button
        className="btn-primary checkout-sidebar__cta"
        onClick={onPlaceOrder}
        disabled={confirming || disabled}
      >
        {confirming ? (
          <>
            <GearSixIcon size={14} weight="bold" className="checkout-spin" />{" "}
            Placing order…
          </>
        ) : (
          "Place your order"
        )}
      </button>

      <div className="checkout-sidebar__secure">
        <LockSimpleIcon size={11} weight="fill" />
        <span>Secure transaction</span>
      </div>

      <div className="checkout-sidebar__divider" />

      <h3 className="checkout-sidebar__heading">Order Summary</h3>

      <div className="checkout-sidebar__rows">
        <div className="checkout-sidebar__row">
          <span>Items ({itemCount})</span>
          <span>₹{totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="checkout-sidebar__row">
          <span>Delivery</span>
          <span className="checkout-sidebar__free">FREE</span>
        </div>
        <div className="checkout-sidebar__row">
          <span>Platform fee</span>
          <span>₹{platformFee}</span>
        </div>
        {codFee > 0 && (
          <div className="checkout-sidebar__row">
            <span>COD fee</span>
            <span>₹{codFee}</span>
          </div>
        )}
      </div>

      <div className="checkout-sidebar__divider" />

      <div className="checkout-sidebar__total">
        <span>Order Total:</span>
        <span>₹{grandTotal.toLocaleString("en-IN")}</span>
      </div>

      <div className="checkout-sidebar__eta">
        <LightningIcon size={12} weight="fill" />
        <span>
          Estimated delivery: ~{estimatedEta}–{estimatedEta + 5} min
        </span>
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────
function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    intent,
    situationText,
    getFinalItems,
    getTotalPrice,
    loadFromServer,
    isLoading,
    error,
  } = useCartStore();

  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  // Snapshot the grand total at confirmation time so the confirmed screen
  // is never stale if the component remounts and paymentMethod resets.
  const [confirmedGrandTotal, setConfirmedGrandTotal] = useState<number | null>(null);

  // Address state
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [editingAddress, setEditingAddress] = useState(false);
  const [pendingAddress, setPendingAddress] =
    useState<Address>(DEFAULT_ADDRESS);

  // Payment state
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("amazonpay");
  const [editingPayment, setEditingPayment] = useState(true);
  const [upiId, setUpiId] = useState("");

  // Items expand state
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (!cart) loadFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalItems = getFinalItems();
  const totalPrice = getTotalPrice();
  const platformFee = 3;
  const codFee = PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)!.fee;
  const grandTotal = totalPrice + platformFee + codFee;

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);

    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        credentials: "include",
      });
      const data = await res
        .json()
        .catch(() => ({ error: "Confirmation failed" }));

      if (!res.ok) throw new Error(data.error ?? "Confirmation failed");

      // Snapshot the total before any state resets can happen
      const snapshotTotal = grandTotal;
      setConfirmedGrandTotal(snapshotTotal);

      if (cart && intent) {
        saveOrderToHistory({
          sessionId: data.sessionId ?? crypto.randomUUID(),
          situationText,
          scenarioLabel: intent.scenarioLabel,
          itemCount: cart.itemCount,
          totalPrice: snapshotTotal, // includes platformFee + codFee
          estimatedEta: cart.estimatedEta,
          confirmedAt: Date.now(),
          items: finalItems.map((item) => ({
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        });
      }

      setConfirmed(true);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Confirmation failed",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleAddressSave = () => {
    setAddress(pendingAddress);
    setEditingAddress(false);
  };

  // ─── Error state ────────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <div className="checkout-error-state">
        <WarningCircleIcon size={48} weight="fill" color="#EF4444" />
        <h2>Failed to load checkout</h2>
        <p>{error}</p>
        <div className="checkout-error-state__actions">
          <button className="btn-secondary" onClick={() => loadFromServer()}>
            <ArrowCounterClockwiseIcon size={14} weight="bold" /> Try Again
          </button>
          <button className="btn-primary" onClick={() => router.push("/")}>
            <ArrowLeftIcon size={14} weight="bold" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  // ─── Confirmed state ────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="checkout-page">
        <Navbar title="Order Confirmed" />
        <main className="checkout-confirmed">
          <div className="checkout-confirmed__icon">
            <CheckCircleIcon
              size={72}
              weight="fill"
              color="var(--accent-green)"
            />
          </div>
          <h1 className="checkout-confirmed__title">
            Order <span className="gradient-text">Placed!</span>
          </h1>
          <p className="checkout-confirmed__desc">
            Your cart has been saved. In a live deployment, this would initiate
            quick commerce delivery.
          </p>

          <div className="checkout-confirmed__card">
            <div className="checkout-confirmed__row">
              <span>Order Total</span>
              <strong>₹{(confirmedGrandTotal ?? grandTotal).toLocaleString("en-IN")}</strong>
            </div>
            <div className="checkout-confirmed__row">
              <span>Items</span>
              <span>{cart?.itemCount}</span>
            </div>
            <div className="checkout-confirmed__row">
              <span>Estimated Delivery</span>
              <span className="checkout-confirmed__eta">
                ~{cart?.estimatedEta ?? 15} min
              </span>
            </div>
            <div className="checkout-confirmed__row">
              <span>Delivering to</span>
              <span>
                {address.name}, {address.line1}
              </span>
            </div>
          </div>

          <div className="checkout-confirmed__demo-badge">
            <WarningIcon size={13} weight="fill" />
            Demo mode — no payment processed · no delivery dispatched
          </div>

          <div className="checkout-confirmed__actions">
            <button
              className="btn-primary"
              onClick={() => {
                useCartStore.getState().reset();
                router.push("/");
              }}
            >
              Build a New Cart
            </button>
            <button
              className="btn-ghost"
              onClick={() => router.push("/history")}
            >
              View Order History →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Main checkout layout ───────────────────────────────────────
  return (
    <div className="checkout-page">
      {/* Use the shared Navbar */}
      <Navbar
        title="Secure Checkout"
        subtitle={
          !isLoading && cart
            ? `${cart.itemCount} items · ₹${grandTotal.toLocaleString("en-IN")}`
            : undefined
        }
        cartItemCount={cart?.itemCount ?? 0}
      />

      {/* Demo banner */}
      <div className="checkout-demo-banner">
        <WarningIcon size={13} weight="fill" />
        <span>
          <strong>Demo prototype</strong> — no real order will be placed or
          payment charged.
        </span>
      </div>

      {/* ── Edit Cart shortcut ────────────────────────────────────── */}
      {!isLoading && cart && (
        <div style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px clamp(16px, 5vw, 40px) 0",
          width: "100%",
        }}>
          <button
            id="checkout-edit-cart-btn"
            className="btn-ghost"
            onClick={() => router.push("/cart")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              padding: "6px 12px 6px 8px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-accent)",
              background: "var(--accent-dim)",
            }}
          >
            <ArrowLeftIcon size={14} weight="bold" />
            Edit Cart
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="checkout-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        cart && (
          <div className="checkout-layout">
            {/* ── Left Column ────────────────────────────────────── */}
            <div className="checkout-main">
              {/* 1. Delivery Address */}
              <div className="checkout-section">
                <div className="checkout-section__header">
                  <div className="checkout-section__step">1</div>
                  <h2 className="checkout-section__title">Delivery address</h2>
                  {!editingAddress && (
                    <button
                      className="checkout-change-btn"
                      style={{ marginLeft: "auto" }}
                      onClick={() => {
                        setPendingAddress(address);
                        setEditingAddress(true);
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>

                {!editingAddress ? (
                  <div className="checkout-section__summary">
                    <div className="checkout-address-display">
                      <strong>Delivering to {address.name}</strong>
                      <span>
                        {address.line1}, {address.line2} — {address.pincode}
                      </span>
                      <span className="checkout-address-tag">
                        {address.type === "Home" ? (
                          <HouseIcon size={10} weight="bold" />
                        ) : address.type === "Work" ? (
                          <BuildingsIcon size={10} weight="bold" />
                        ) : (
                          <MapPinIcon size={10} weight="bold" />
                        )}
                        {address.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="checkout-section__body">
                    <AddressEditor
                      address={pendingAddress}
                      onChange={setPendingAddress}
                      onSave={handleAddressSave}
                      onCancel={() => setEditingAddress(false)}
                    />
                  </div>
                )}
              </div>

              {/* 2. Payment Method */}
              <PaymentSection
                selected={paymentMethod}
                upiId={upiId}
                onUpiIdChange={setUpiId}
                onSelect={setPaymentMethod}
                expanded={editingPayment}
                onToggle={() => setEditingPayment(!editingPayment)}
              />

              {/* 3. Review items and delivery */}
              <div className="checkout-section">
                <div
                  className="checkout-section__header"
                  onClick={() => setShowItems(!showItems)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="checkout-section__step">3</div>
                  <h2 className="checkout-section__title">
                    Review items and delivery
                  </h2>
                  <span className="checkout-section__caret">
                    {showItems ? (
                      <CaretUpIcon size={14} weight="bold" />
                    ) : (
                      <CaretDownIcon size={14} weight="bold" />
                    )}
                  </span>
                </div>

                {showItems && (
                  <div className="checkout-section__body">
                    <div className="checkout-items-delivery-info">
                      <LightningIcon size={13} weight="fill" />
                      <span>
                        Estimated delivery:{" "}
                        <strong>
                          ~{cart.estimatedEta}–{cart.estimatedEta + 5} min
                        </strong>
                      </span>
                    </div>
                    <div className="checkout-items-list">
                      {finalItems.map((item) => (
                        <OrderItemRow key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {!showItems && (
                  <div className="checkout-section__summary">
                    <div className="checkout-items-preview">
                      <TruckIcon
                        size={13}
                        weight="fill"
                        color="var(--accent-teal)"
                      />
                      <span>
                        {cart.itemCount} items · Delivery in ~
                        {cart.estimatedEta} min
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile place order button */}
              <div className="checkout-mobile-cta">
                <button
                  className="btn-primary checkout-mobile-cta__btn"
                  onClick={handleConfirm}
                  disabled={confirming || editingAddress}
                >
                  {confirming ? (
                    <>
                      <GearSixIcon
                        size={14}
                        weight="bold"
                        className="checkout-spin"
                      />{" "}
                      Placing…
                    </>
                  ) : (
                    `Place Demo Order · ₹${grandTotal.toLocaleString("en-IN")}`
                  )}
                </button>
                <div className="checkout-mobile-cta__secure">
                  <ShieldCheckIcon size={12} weight="fill" />
                  <span>Secure transaction · demo mode</span>
                </div>
              </div>

              {/* Confirm error */}
              {confirmError && (
                <div className="checkout-error-msg">
                  <WarningCircleIcon size={14} weight="fill" />
                  <div>
                    <strong>Order failed</strong>
                    <p>{confirmError}</p>
                  </div>
                  <button
                    className="checkout-change-btn"
                    onClick={handleConfirm}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* ── Right Sidebar ──────────────────────────────────── */}
            <aside className="checkout-aside">
              <OrderSidebar
                itemCount={cart.itemCount}
                totalPrice={totalPrice}
                platformFee={platformFee}
                codFee={codFee}
                grandTotal={grandTotal}
                estimatedEta={cart.estimatedEta}
                onPlaceOrder={handleConfirm}
                confirming={confirming}
                disabled={editingAddress}
              />
            </aside>
          </div>
        )
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <CheckoutPage />
    </ErrorBoundary>
  );
}
