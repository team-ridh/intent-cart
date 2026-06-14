"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/types";
import { Lightning, X, ArrowsLeftRight, Trophy, CheckCircle, Package, StarIcon } from "@phosphor-icons/react";

const TAG_COLORS: Record<string, string> = {
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

interface CartItemCardProps {
  item: CartItem;
  selectedSubId?: string;
  onOpenSubs: () => void;
  onAdjustQty: (delta: number) => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  selectedSubId,
  onOpenSubs,
  onAdjustQty,
  onRemove,
}: CartItemCardProps) {
  const [removing, setRemoving] = useState(false);

  const activeSub = item.substitutes.find((s) => s.id === selectedSubId);
  const displayPrice = activeSub ? activeSub.price : item.price;
  const displayName = activeSub ? activeSub.name : item.name;
  const displayBrand = activeSub ? activeSub.brand : item.brand;
  const displayEta = activeSub ? activeSub.eta : item.eta;
  const badgeColor = TAG_COLORS[item.reasonTag] ?? "orange";

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(onRemove, 300);
  };

  return (
    <div
      className="card animate-float-in"
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        opacity: removing ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          flexShrink: 0,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          overflow: "hidden",
        }}
      >
        {item.image.startsWith("http") ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = document.createElement("div");
                icon.style.cssText = "display:flex;align-items:center;justify-content:center;width:100%;height:100%";
                parent.appendChild(icon);
              }
            }}
          />
        ) : (
          <Package size={28} weight="light" color="var(--text-muted)" />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + price row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {item.badge && (
              <div style={{ fontSize: 10, fontWeight: 700, color: "#FF9900", marginBottom: 2, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 3 }}>
                {item.badge === "Best Seller"
                  ? <Trophy size={10} weight="fill" color="#FF9900" />
                  : item.badge === "Amazon's Choice"
                  ? <CheckCircle size={10} weight="fill" color="#FF9900" />
                  : null
                }
                {item.badge}
              </div>
            )}
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{displayName}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 1 }}>{displayBrand}</div>
            {item.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <span style={{ display: "flex", gap: 1 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      size={11}
                      weight={i < Math.round(item.rating!) ? "fill" : "regular"}
                      color="#FF9900"
                      style={{ opacity: i < Math.round(item.rating!) ? 1 : 0.35 }}
                    />
                  ))}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                  {item.rating.toFixed(1)} ({item.reviewCount?.toLocaleString("en-IN")})
                </span>
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>
              ₹{displayPrice}
            </div>
            {item.mrp && item.mrp > item.price && (
              <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.4 }}>
                <span style={{ textDecoration: "line-through" }}>₹{item.mrp}</span>
                {" "}
                <span style={{ color: "#5cb85c", fontWeight: 600 }}>{item.discount}% off</span>
              </div>
            )}
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>/{item.unit}</div>
          </div>
        </div>

        {/* Reason + description */}
        <div style={{ marginTop: 6 }}>
          <span className={`badge badge-${badgeColor}`}>{item.reasonTag}</span>
        </div>
        {item.description && (
          <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>
            {item.description}
          </div>
        )}
        <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 3, fontStyle: "italic" }}>
          {item.reason}
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {/* ETA */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Lightning size={12} weight="fill" color="var(--accent-teal)" />
            <span style={{ color: "var(--accent-teal)", fontSize: 12, fontWeight: 600 }}>
              ~{displayEta}-{displayEta + 5} min est.
            </span>
          </div>

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              id={`qty-dec-${item.id}`}
              className="btn-ghost"
              style={{ padding: "2px 8px", fontSize: 16 }}
              onClick={() => onAdjustQty(-1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center", fontSize: 14 }}>
              {item.quantity}
            </span>
            <button
              id={`qty-inc-${item.id}`}
              className="btn-ghost"
              style={{ padding: "2px 8px", fontSize: 16 }}
              onClick={() => onAdjustQty(1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Substitutes */}
          {item.substitutes.length > 0 && (
            <button
              id={`subs-btn-${item.id}`}
              className="btn-ghost"
              style={{
                fontSize: 12,
                padding: "4px 10px",
                color: activeSub ? "var(--accent)" : "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
              onClick={onOpenSubs}
            >
              {activeSub
                ? <><CheckCircle size={12} weight="fill" /> {activeSub.name.split(" ")[0]}</>
                : <><ArrowsLeftRight size={12} weight="bold" /> Substitutes ({item.substitutes.length})</>
              }
            </button>
          )}

          {/* Remove */}
          <button
            id={`remove-${item.id}`}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "4px 8px", color: "var(--text-faint)", marginLeft: "auto", display: "inline-flex", alignItems: "center" }}
            onClick={handleRemove}
            aria-label={`Remove ${item.name}`}
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
