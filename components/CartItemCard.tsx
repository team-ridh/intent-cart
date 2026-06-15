"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "@/lib/types";
import { resolveProductImage } from "@/lib/utils/productImage";
import {
  LightningIcon, TrashIcon, ArrowsLeftRightIcon,
  CheckCircleIcon, PackageIcon, StarIcon, TrophyIcon,
} from "@phosphor-icons/react";

const TAG_COLORS: Record<string, string> = {
  "Hosting essential": "orange",
  "Required for serving": "orange",
  "Serving necessity": "orange",
  "Tea pairing": "orange",
  "Quick serving": "orange",
  "Tea essential": "orange",
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
  "Daily essential": "teal",
  "Essential": "teal",
  "Protein source": "green",
  "Quick meal": "teal",
  "Tea companion": "orange",
  "Savory option": "orange",
  "Savoury option": "orange",
  "Snack pairing": "orange",
  "Rainy day meal": "teal",
  "Instant coffee": "orange",
  "Serving essential": "orange",
  "Hosting convenience": "teal",
};

interface CartItemCardProps {
  item: CartItem;
  selectedSubId?: string;
  onOpenSubs: () => void;
  onAdjustQty: (delta: number) => void;
  onRemove: () => void;
}

export function CartItemCard({ item, selectedSubId, onOpenSubs, onAdjustQty, onRemove }: CartItemCardProps) {
  const [removing, setRemoving]       = useState(false);
  const [imgError, setImgError]       = useState(false);
  const [resolvedImage, setResolvedImage] = useState<string>("");

  const activeSub    = item.substitutes.find((s) => s.id === selectedSubId);
  const displayPrice = activeSub ? activeSub.price : item.price;
  const displayMrp   = activeSub ? activeSub.mrp   : item.mrp;
  const displayName  = activeSub ? activeSub.name  : item.name;
  const displayBrand = activeSub ? activeSub.brand : item.brand;
  const displayEta   = activeSub ? activeSub.eta   : item.eta;
  const displayImage = activeSub ? activeSub.image : item.image;
  const displayDiscount = activeSub ? activeSub.discount : item.discount;
  const badgeColor   = TAG_COLORS[item.reasonTag] ?? "orange";
  const lineTotal    = displayPrice * item.quantity;

  // Resolve image from productImages.json map, falling back to existing image field
  useEffect(() => {
    setImgError(false);
    resolveProductImage(item.id, displayImage).then(setResolvedImage);
  }, [item.id, displayImage]);

  const handleRemove = () => { setRemoving(true); setTimeout(onRemove, 280); };

  return (
    <div
      className="animate-float-in"
      style={{
        padding: "16px 0",
        opacity: removing ? 0 : 1,
        transform: removing ? "scale(0.97)" : "scale(1)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
        background: "var(--bg-surface)",
      }}
    >
      {/* ── Three-column: image | details | price ─────────────── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* 1. Product image — large, like Amazon */}
        <div style={{
          width: 120, height: 120,
          flexShrink: 0,
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {resolvedImage?.startsWith("http") && !imgError ? (
            <img
              src={resolvedImage}
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
              onError={() => setImgError(true)}
            />
          ) : (
            <PackageIcon size={36} weight="light" color="var(--text-muted)" />
          )}
        </div>

        {/* 2. Details column — takes remaining space */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Badge (Best Seller / Amazon's Choice) */}
          {item.badge && (
            <div style={{ fontSize: 11, fontWeight: 700, color: "#FF9900", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {item.badge === "Best Seller"
                ? <TrophyIcon size={11} weight="fill" color="#FF9900" />
                : <CheckCircleIcon size={11} weight="fill" color="#FF9900" />
              }
              {item.badge}
            </div>
          )}

          {/* Product name */}
          <div style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.4,
            color: "#0F1111",
            marginBottom: 4,
          }}>
            {displayName}
            <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 400, marginLeft: 6 }}>
              {item.unit}
            </span>
          </div>

          {/* Brand */}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
            by {displayBrand}
          </div>

          {/* In Stock */}
          <div style={{ fontSize: 13, color: "#007600", fontWeight: 500, marginBottom: 6 }}>
            In Stock · ~{displayEta}–{displayEta + 5} min
          </div>

          {/* Ratings */}
          {item.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
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
              <span style={{ fontSize: 12, color: "#007185" }}>
                {item.rating.toFixed(1)} · {item.reviewCount?.toLocaleString("en-IN")} ratings
              </span>
            </div>
          )}

          {/* This is a gift checkbox
          <label style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--text-secondary)",
            cursor: "pointer", userSelect: "none", marginBottom: 8,
          }}>
            <input
              type="checkbox"
              checked={isGift}
              onChange={() => setIsGift((v) => !v)}
              style={{ width: 13, height: 13, cursor: "pointer" }}
            />
            This is a gift
            <span style={{ color: "#007185", fontSize: 12, cursor: "pointer", marginLeft: 2 }}>Learn more</span>
          </label> */}

          {/* Reason tag */}
          <div style={{ marginBottom: 10 }}>
            <span className={`badge badge-${badgeColor}`} style={{ fontSize: 11 }}>{item.reasonTag}</span>
          </div>

          {/* ── Controls row ─────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", rowGap: 8 }}>

            {/* Quantity stepper — Amazon yellow pill */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid #D5D9D9",
              borderRadius: 8,
              overflow: "hidden",
              background: "linear-gradient(to bottom, #f7f8fa, #e7e9ec)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
              marginRight: 12,
            }}>
              <button
                id={`qty-dec-${item.id}`}
                onClick={() => onAdjustQty(-1)}
                aria-label="Decrease quantity"
                style={{
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, color: "#555", lineHeight: 1,
                }}
              >
                <TrashIcon size={13} weight="regular" color="#555" style={{ display: item.quantity <= 1 ? "block" : "none" }} />
                <span style={{ display: item.quantity <= 1 ? "none" : "block" }}>−</span>
              </button>
              <span style={{
                minWidth: 30, textAlign: "center",
                fontWeight: 700, fontSize: 14,
                color: "#0F1111",
                borderLeft: "1px solid #D5D9D9",
                borderRight: "1px solid #D5D9D9",
                padding: "5px 0",
                background: "#fff",
              }}>
                {item.quantity}
              </span>
              <button
                id={`qty-inc-${item.id}`}
                onClick={() => onAdjustQty(1)}
                aria-label="Increase quantity"
                style={{
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, color: "#555", lineHeight: 1,
                }}
              >+</button>
            </div>

            {/* Text-link actions — Amazon style */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
              <button
                id={`remove-${item.id}`}
                onClick={handleRemove}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "#007185",
                  padding: "0 8px 0 0",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
              >
                Delete
              </button>
              <span style={{ color: "#D5D9D9", fontSize: 13, marginRight: 8 }}>|</span>

              {/* Substitute picker */}
              {item.substitutes.length > 0 ? (
                <>
                  <button
                    id={`subs-btn-${item.id}`}
                    onClick={onOpenSubs}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13,
                      color: activeSub ? "var(--accent)" : "#007185",
                      fontWeight: activeSub ? 600 : 400,
                      padding: "0 8px 0 0",
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
                  >
                    {activeSub
                      ? <><CheckCircleIcon size={11} weight="fill" color="var(--accent)" /> Swapped</>
                      : <><ArrowsLeftRightIcon size={11} weight="bold" /> Compare similar ({item.substitutes.length})</>
                    }
                  </button>
                  {/* <span style={{ color: "#D5D9D9", fontSize: 13, marginRight: 8 }}>|</span> */}
                </>
              ) : null}

              {/* <button
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "#007185", padding: 0,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
              >
                <LightningIcon size={11} weight="fill" color="var(--accent-teal)" />
                Save for later
              </button> */}
            </div>
          </div>
        </div>

        {/* 3. Price column — far right, top-aligned */}
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 100 }}>
          {/* Discount badge — red pill like Amazon */}
          {displayDiscount && displayDiscount > 0 && (
            <div style={{ marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  background: "#CC0C39",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 3,
                }}>
                  {displayDiscount}% off
                </span>
                <span style={{ fontSize: 10, color: "#CC0C39", fontWeight: 600 }}>Limited time</span>
              </div>
            </div>
          )}

          {/* Main price */}
          <div style={{
            fontWeight: 700,
            fontSize: 18,
            color: "#0F1111",
            lineHeight: 1.2,
          }}>
            ₹{lineTotal.toLocaleString("en-IN")}
          </div>

          {/* Per-unit if qty > 1 */}
          {item.quantity > 1 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
              ₹{displayPrice} each
            </div>
          )}

          {/* MRP / list price strikethrough */}
          {displayMrp && displayMrp > displayPrice && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              List: <span style={{ textDecoration: "line-through" }}>₹{(displayMrp * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
