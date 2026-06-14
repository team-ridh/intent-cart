"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { saveOrderToHistory } from "@/lib/orderHistory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import {
  HouseIcon,
  BuildingsIcon,
  MapPinIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
  SparkleIcon,
  CheckCircleIcon,
  LightningIcon,
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  GearSixIcon,
  PackageIcon,
  WarningIcon,
} from "@phosphor-icons/react";

// ─── Address types ────────────────────────────────────────────────
type AddressType = "Home" | "Work" | "Other";

interface Address {
  line1: string;
  line2: string;
  pincode: string;
  type: AddressType;
}

const DEFAULT_ADDRESS: Address = {
  line1: "123 MG Road, Indiranagar",
  line2: "Bengaluru",
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
    sub: "₹2,450.00 · demo balance",
    fee: 0,
  },
  {
    id: "upi",
    label: "UPI / Google Pay",
    icon: "UPI",
    sub: "demo — no real transaction",
    fee: 0,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "₹",
    sub: "demo — no real delivery",
    fee: 50,
  },
];

// ─── Address editor ───────────────────────────────────────────────
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
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg-raised)",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginTop: 12 }}>
      <input
        id="addr-line1"
        style={inputStyle}
        placeholder="Street address"
        value={address.line1}
        onChange={(e) => onChange({ ...address, line1: e.target.value })}
      />
      <input
        id="addr-line2"
        style={inputStyle}
        placeholder="City"
        value={address.line2}
        onChange={(e) => onChange({ ...address, line2: e.target.value })}
      />
      <input
        id="addr-pincode"
        style={{ ...inputStyle, marginBottom: 14 }}
        placeholder="PIN code"
        value={address.pincode}
        onChange={(e) => onChange({ ...address, pincode: e.target.value })}
      />
      {/* Address type radio */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["Home", "Work", "Other"] as AddressType[]).map((t) => (
          <button
            key={t}
            id={`addr-type-${t.toLowerCase()}`}
            onClick={() => onChange({ ...address, type: t })}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: `1px solid ${address.type === t ? "var(--accent)" : "var(--border)"}`,
              background:
                address.type === t ? "var(--accent-dim)" : "transparent",
              color: address.type === t ? "var(--accent)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {t === "Home" ? (
              <HouseIcon size={13} weight="bold" />
            ) : t === "Work" ? (
              <BuildingsIcon size={13} weight="bold" />
            ) : (
              <MapPinIcon size={13} weight="bold" />
            )}{" "}
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-secondary"
          style={{ flex: 1, fontSize: 13 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          id="addr-save-btn"
          style={{
            flex: 1,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
          onClick={onSave}
        >
          <CheckCircleIcon size={13} weight="fill" /> Save Address
        </button>
      </div>
    </div>
  );
}

// ─── Payment selector ─────────────────────────────────────────────
interface PaymentSelectorProps {
  selected: PaymentMethod;
  upiId: string;
  onUpiIdChange: (v: string) => void;
  onSelect: (m: PaymentMethod) => void;
  onClose: () => void;
}

function PaymentSelector({
  selected,
  upiId,
  onUpiIdChange,
  onSelect,
  onClose,
}: PaymentSelectorProps) {
  return (
    <div style={{ marginTop: 12 }}>
      {PAYMENT_OPTIONS.map((opt) => (
        <div
          key={opt.id}
          id={`pay-${opt.id}`}
          onClick={() => onSelect(opt.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 12,
            border: `1px solid ${selected === opt.id ? "var(--accent)" : "var(--border)"}`,
            background:
              selected === opt.id ? "var(--accent-dim)" : "var(--bg-raised)",
            cursor: "pointer",
            marginBottom: 8,
            transition: "all 0.15s ease",
          }}
        >
          <div
            style={{
              width: 40,
              height: 28,
              borderRadius: 8,
              background:
                opt.id === "amazonpay"
                  ? "linear-gradient(135deg,#FF6B35,#FF9A6B)"
                  : opt.id === "upi"
                    ? "linear-gradient(135deg,#4F46E5,#7C3AED)"
                    : "linear-gradient(135deg,#059669,#10B981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: opt.id === "cod" ? 14 : 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {opt.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {opt.sub}
              {opt.fee > 0 && (
                <span style={{ color: "#EF4444" }}> · +₹{opt.fee} COD fee</span>
              )}
            </div>
          </div>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${selected === opt.id ? "var(--accent)" : "var(--border)"}`,
              background: selected === opt.id ? "var(--accent)" : "transparent",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected === opt.id && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
            )}
          </div>
        </div>
      ))}

      {/* UPI ID input */}
      {selected === "upi" && (
        <input
          id="upi-id-input"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-raised)",
            fontSize: 14,
            color: "var(--text-primary)",
            marginTop: 4,
            marginBottom: 10,
            boxSizing: "border-box",
            outline: "none",
          }}
          placeholder="yourname@upi"
          value={upiId}
          onChange={(e) => onUpiIdChange(e.target.value)}
        />
      )}

      <button
        className="btn-primary"
        id="pay-confirm-btn"
        style={{
          width: "100%",
          fontSize: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
        onClick={onClose}
      >
        <CheckCircleIcon size={14} weight="fill" /> Confirm Payment Method
      </button>
    </div>
  );
}

// ─── Order summary item row ───────────────────────────────────────
function OrderItemRow({ item }: { item: CartItem }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {item.image?.startsWith("http") ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              padding: 2,
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <PackageIcon size={24} weight="light" color="var(--text-muted)" />
        )}
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {item.brand} · ×{item.quantity} ·{" "}
            <LightningIcon
              size={10}
              weight="fill"
              color="var(--accent-teal)"
              style={{ display: "inline", verticalAlign: "middle" }}
            />
            ~{item.eta} min est.
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        ₹{item.price * item.quantity}
      </div>
    </div>
  );
}

// ─── Main checkout page ───────────────────────────────────────────
function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    intent,
    getFinalItems,
    getTotalPrice,
    loadFromServer,
    isLoading,
    error,
  } = useCartStore();

  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // ─── Address state ───────────────────────────────────────────────
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [editingAddress, setEditingAddress] = useState(false);
  const [pendingAddress, setPendingAddress] =
    useState<Address>(DEFAULT_ADDRESS);
  const [addressSaved, setAddressSaved] = useState(false);

  // ─── Payment state ───────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("amazonpay");
  const [editingPayment, setEditingPayment] = useState(false);
  const [upiId, setUpiId] = useState("");

  // Hydrate from DynamoDB if store is empty
  useEffect(() => {
    if (!cart) loadFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);

    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        credentials: "include",
      });

      // Read body once — branching on ok/error afterwards
      const data = await res
        .json()
        .catch(() => ({ error: "Confirmation failed" }));

      if (!res.ok) {
        throw new Error(data.error ?? "Confirmation failed");
      }

      // Persist to local order history before setting confirmed state
      if (cart && intent) {
        saveOrderToHistory({
          sessionId: data.sessionId ?? crypto.randomUUID(),
          situationText: useCartStore.getState().situationText,
          scenarioLabel: intent.scenarioLabel,
          itemCount: cart.itemCount,
          totalPrice: getTotalPrice() + 3, // include platform fee
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
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2000);
  };

  // ─── Error state ─────────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <WarningCircleIcon size={48} weight="fill" color="#EF4444" />
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 20,
            marginBottom: 10,
          }}
        >
          Failed to load checkout
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            maxWidth: 380,
            marginBottom: 24,
          }}
        >
          {error}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => loadFromServer()}
          >
            <ArrowCounterClockwiseIcon size={14} weight="bold" /> Try Again
          </button>
          <button
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={() => router.push("/")}
          >
            <ArrowLeftIcon size={14} weight="bold" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const finalItems = getFinalItems();
  const platformFee = 3;
  const cod = PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)!;
  const codFee = cod.fee;
  const grandTotal = totalPrice + platformFee + codFee;

  // ─── Confirmed state ─────────────────────────────────────────────
  if (confirmed) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircleIcon
            size={72}
            weight="fill"
            color="var(--accent-green)"
          />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 10,
          }}
        >
          Demo Order <span className="gradient-text">Placed!</span>
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            marginBottom: 12,
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          Your cart has been saved. In a live deployment, this would initiate
          quick commerce delivery.
        </p>
        <div
          style={{
            marginBottom: 28,
            padding: "10px 20px",
            borderRadius: 12,
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.25)",
            color: "var(--accent-amber)",
            fontSize: 13,
            maxWidth: 380,
          }}
        >
          Demo mode — no payment processed · no delivery dispatched
        </div>

        <div
          className="glass-elevated"
          style={{ padding: "20px 40px", marginBottom: 28 }}
        >
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Typical delivery for this order
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 36,
              color: "var(--accent-teal)",
              letterSpacing: "-0.03em",
            }}
          >
            ~{cart?.estimatedEta ?? 15} min
          </div>
          <div
            style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}
          >
            catalogue estimate · not tracked
          </div>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: "16px 24px",
            borderRadius: 16,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            minWidth: 260,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            Order summary
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            ₹{grandTotal}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {cart?.itemCount} items · {intent?.scenarioLabel}
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 5,
            justifyContent: "center",
          }}
        >
          <MapPinIcon size={13} weight="bold" /> {address.line1},{" "}
          {address.line2} · {address.type}
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            useCartStore.getState().reset();
            router.push("/");
          }}
        >
          ← Shop Again
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        paddingBottom: "max(160px, calc(140px + env(safe-area-inset-bottom)))",
        padding: "0 clamp(16px, 5vw, 80px)",
      }}
    >
      {/* Demo mode banner */}
      <div
        style={{
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.35)",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 16,
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "#92400e",
        }}
      >
        <WarningIcon size={14} weight="fill" color="#D97706" />
        <span>
          <strong>Demo prototype</strong> — no real order will be placed or
          payment charged.
        </span>
      </div>

      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(245,246,250,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
          padding: "16px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn-ghost"
            style={{ padding: "8px 12px" }}
            onClick={() => router.push("/cart")}
          >
            ← Cart
          </button>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Checkout
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {isLoading
                ? "Loading…"
                : `${cart?.itemCount ?? 0} items · ₹${grandTotal}`}
            </div>
          </div>
          <Logo />
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        cart && (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <>
              {/* Intent badge */}
              {intent && (
                <div
                  className="glass-elevated animate-float-in"
                  style={{
                    padding: "16px 20px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg,rgba(232,93,42,0.15),rgba(0,153,187,0.08))",
                      flexShrink: 0,
                    }}
                  >
                    <SparkleIcon
                      size={14}
                      weight="fill"
                      color="var(--accent)"
                    />
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 15,
                      }}
                    >
                      {intent.scenarioLabel} order · {intent.urgency} urgency
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      Scenario classified via Bedrock · {intent.confidence}%
                      confident
                    </div>
                  </div>
                  {intent.usedBedrock && (
                    <span
                      className="badge badge-purple"
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <CheckCircleIcon size={10} weight="fill" /> AI
                    </span>
                  )}
                </div>
              )}

              {/* Order items */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: 16,
                  }}
                >
                  Order Summary
                </div>
                {finalItems.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>

              {/* Delivery address */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <MapPinIcon
                        size={14}
                        weight="bold"
                        color="var(--accent)"
                      />{" "}
                      Delivery Address
                      {addressSaved && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "var(--accent-green)",
                            fontSize: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <CheckCircleIcon size={11} weight="fill" /> Saved
                        </span>
                      )}
                    </div>
                    {!editingAddress && (
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 14,
                          lineHeight: 1.6,
                          marginTop: 6,
                        }}
                      >
                        {address.line1}
                        <br />
                        {address.line2} — {address.pincode}
                        <span
                          className="badge badge-teal"
                          style={{ marginLeft: 8, fontSize: 11 }}
                        >
                          {address.type}
                        </span>
                      </div>
                    )}
                  </div>
                  {!editingAddress && (
                    <button
                      id="change-address-btn"
                      className="btn-ghost"
                      style={{
                        fontSize: 12,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onClick={() => {
                        setPendingAddress(address);
                        setEditingAddress(true);
                      }}
                    >
                      <PencilSimpleIcon size={11} weight="bold" /> Change
                    </button>
                  )}
                </div>
                {editingAddress && (
                  <AddressEditor
                    address={pendingAddress}
                    onChange={setPendingAddress}
                    onSave={handleAddressSave}
                    onCancel={() => setEditingAddress(false)}
                  />
                )}
              </div>

              {/* Payment */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CheckCircleIcon
                        size={14}
                        weight="bold"
                        color="var(--accent)"
                      />{" "}
                      Payment
                    </div>
                    {!editingPayment && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 28,
                            borderRadius: 8,
                            background:
                              paymentMethod === "amazonpay"
                                ? "linear-gradient(135deg,#FF6B35,#FF9A6B)"
                                : paymentMethod === "upi"
                                  ? "linear-gradient(135deg,#4F46E5,#7C3AED)"
                                  : "linear-gradient(135deg,#059669,#10B981)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: paymentMethod === "cod" ? 14 : 11,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {
                            PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)
                              ?.icon
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>
                            {
                              PAYMENT_OPTIONS.find(
                                (o) => o.id === paymentMethod,
                              )?.label
                            }
                          </div>
                          {paymentMethod === "upi" && upiId && (
                            <div
                              style={{
                                color: "var(--text-muted)",
                                fontSize: 12,
                              }}
                            >
                              {upiId}
                            </div>
                          )}
                          {paymentMethod !== "upi" && (
                            <div
                              style={{
                                color: "var(--text-muted)",
                                fontSize: 12,
                              }}
                            >
                              {
                                PAYMENT_OPTIONS.find(
                                  (o) => o.id === paymentMethod,
                                )?.sub
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {!editingPayment && (
                    <button
                      id="change-payment-btn"
                      className="btn-ghost"
                      style={{
                        fontSize: 12,
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onClick={() => setEditingPayment(true)}
                    >
                      <PencilSimpleIcon size={11} weight="bold" /> Change
                    </button>
                  )}
                </div>
                {editingPayment && (
                  <PaymentSelector
                    selected={paymentMethod}
                    upiId={upiId}
                    onUpiIdChange={setUpiId}
                    onSelect={setPaymentMethod}
                    onClose={() => setEditingPayment(false)}
                  />
                )}
              </div>

              {/* Price breakdown */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 14,
                  }}
                >
                  Price Details
                </div>
                {[
                  {
                    label: `Items (${cart.itemCount})`,
                    value: totalPrice,
                    style: {},
                  },
                  {
                    label: "Delivery fee",
                    value: 0,
                    style: { color: "var(--accent-green)" },
                    display: "FREE",
                  },
                  { label: "Platform fee", value: platformFee, style: {} },
                  ...(codFee > 0
                    ? [
                        {
                          label: "COD fee",
                          value: codFee,
                          style: { color: "#EF4444" },
                        },
                      ]
                    : []),
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {row.label}
                    </span>
                    <span style={{ fontWeight: 500, ...row.style }}>
                      {"display" in row ? row.display : `₹${row.value}`}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    marginTop: 10,
                    paddingTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  >
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* ETA chip */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <div
                  className="badge badge-teal"
                  style={{
                    fontSize: 14,
                    padding: "10px 20px",
                    borderRadius: 24,
                  }}
                >
                  <LightningIcon size={14} weight="fill" /> Estimated delivery:
                  ~{cart.estimatedEta}–{cart.estimatedEta + 5} min
                </div>
              </div>

              {/* Confirm error */}
              {confirmError && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#EF4444",
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <WarningCircleIcon size={14} weight="fill" /> Confirmation
                    failed
                  </div>
                  <div style={{ fontSize: 13 }}>{confirmError}</div>
                  <button
                    className="btn-ghost"
                    style={{ marginTop: 8, fontSize: 12, color: "#EF4444" }}
                    onClick={handleConfirm}
                  >
                    Try again →
                  </button>
                </div>
              )}
            </>
          </div>
        )
      )}

      {/* Bottom CTA */}
      {!isLoading && cart && !confirmed && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 20px",
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
            background: "rgba(245,246,250,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
            zIndex: 20,
          }}
        >
          <div style={{ padding: "0 clamp(16px, 5vw, 80px)" }}>
            <button
              id="confirm-order-btn"
              className="btn-primary"
              style={{
                width: "100%",
                fontSize: 17,
                padding: "18px 32px",
                opacity: confirming ? 0.7 : 1,
              }}
              onClick={handleConfirm}
              disabled={confirming || editingAddress || editingPayment}
            >
              {confirming ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      animation: "rotate-slow 0.8s linear infinite",
                    }}
                  >
                    <GearSixIcon size={16} weight="bold" />
                  </span>{" "}
                  Confirming…
                </>
              ) : (
                `Place Demo Order · ₹${grandTotal}`
              )}
            </button>
            <p
              style={{
                textAlign: "center",
                color: "var(--text-faint)",
                fontSize: 11,
                marginTop: 8,
              }}
            >
              By placing this order you agree to Amazon Now OS terms of service
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
