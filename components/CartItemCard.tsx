"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/types";
import {
  LightningIcon, XIcon, ArrowsLeftRightIcon,
  CheckCircleIcon, PackageIcon, StarIcon, TrophyIcon,
} from "@phosphor-icons/react";

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

export function CartItemCard({ item, selectedSubId, onOpenSubs, onAdjustQty, onRemove }: CartItemCardProps) {
  const [removing, setRemoving] = useState(false);

  const activeSub = item.substitutes.find((s) => s.id === selectedSubId);
  const displayPrice = activeSub ? activeSub.price : item.price;
  const displayName  = activeSub ? activeSub.name  : item.name;
  const displayBrand = activeSub ? activeSub.brand : item.brand;
  const displayEta   = activeSub ? activeSub.eta   : item.eta;
  const displayImage = activeSub ? activeSub.image : item.image;
  const badgeColor   = TAG_COLORS[item.reasonTag] ?? "orange";
  const lineTotal    = displayPrice * item.quantity;

  const handleRemove = () => { setRemoving(true); setTimeout(onRemove, 280); };

  return (
    <div
      className="card animate-float-in"
      style={{
        padding: "14px 16px",
        opacity: removing ? 0 : 1,
        transform: removing ? "scale(0.97)" : "scale(1)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>

        {/* Product image */}
        <div style={{
          width: 68, height: 68, borderRadius: 12, flexShrink: 0,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          {displayImage?.startsWith("http") ? (
            <img
              src={displayImage}
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <PackageIcon size={26} weight="light" color="var(--text-muted)" />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top row — name + line total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge (Best Seller etc.) */}
              {item.badge && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "#FF9900", marginBottom: 2, display: "flex", alignItems: "center", gap: 3, letterSpacing: "0.04em" }}>
                  {item.badge === "Best Seller"
                    ? <TrophyIcon size={10} weight="fill" color="#FF9900" />
                    : <CheckCircleIcon size={10} weight="fill" color="#FF9900" />
                  }
                  {item.badge}
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, color: "var(--text-primary)" }}>
                {displayName}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 1 }}>
                {displayBrand} · {item.unit}
              </div>
            </div>

            {/* Price block */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
                ₹{lineTotal}
              </div>
              {item.quantity > 1 && (
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>₹{displayPrice} each</div>
              )}
              {item.mrp && item.mrp > item.price && (
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                  <span style={{ textDecoration: "line-through" }}>₹{item.mrp}</span>
                  {" "}<span style={{ color: "#5cb85c", fontWeight: 600 }}>{item.discount}% off</span>
                </div>
              )}
            </div>
          </div>

          {/* Ratings */}
          {item.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{ display: "flex", gap: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} size={10} weight={i < Math.round(item.rating!) ? "fill" : "regular"} color="#FF9900" style={{ opacity: i < Math.round(item.rating!) ? 1 : 0.3 }} />
                ))}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                {item.rating.toFixed(1)} ({item.reviewCount?.toLocaleString("en-IN")})
              </span>
            </div>
          )}

          {/* Reason tag + ETA */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span className={`badge badge-${badgeColor}`} style={{ fontSize: 11 }}>{item.reasonTag}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--accent-teal)", fontWeight: 600 }}>
              <LightningIcon size={10} weight="fill" /> ~{displayEta}–{displayEta + 5} min
            </span>
          </div>

          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>

            {/* Quantity stepper */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid var(--border)", borderRadius: 10,
              overflow: "hidden", background: "var(--bg-raised)",
            }}>
              <button
                id={`qty-dec-${item.id}`}
                onClick={() => onAdjustQty(-1)}
                aria-label="Decrease"
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, color: "var(--text-secondary)", lineHeight: 1,
                }}
              >−</button>
              <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                {item.quantity}
              </span>
              <button
                id={`qty-inc-${item.id}`}
                onClick={() => onAdjustQty(1)}
                aria-label="Increase"
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, color: "var(--text-secondary)", lineHeight: 1,
                }}
              >+</button>
            </div>

            {/* Substitute picker */}
            {item.substitutes.length > 0 && (
              <button
                id={`subs-btn-${item.id}`}
                onClick={onOpenSubs}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${activeSub ? "var(--accent)" : "var(--border)"}`,
                  background: activeSub ? "var(--accent-dim)" : "var(--bg-raised)",
                  color: activeSub ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {activeSub
                  ? <><CheckCircleIcon size={12} weight="fill" /> {activeSub.name.split(" ").slice(0, 2).join(" ")}</>
                  : <><ArrowsLeftRightIcon size={12} weight="bold" /> Swap ({item.substitutes.length})</>
                }
              </button>
            )}

            {/* Remove — pushed to the right */}
            <button
              id={`remove-${item.id}`}
              onClick={handleRemove}
              aria-label={`Remove ${item.name}`}
              style={{
                marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--bg-raised)", cursor: "pointer", color: "var(--text-faint)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-faint)"; }}
            >
              <XIcon size={13} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
