"use client";

import { useState } from "react";
import { StarIcon, ShoppingCartSimpleIcon } from "@phosphor-icons/react";
import type { FeaturedItem } from "@/lib/featuredItems";

interface FeaturedItemCardProps {
  item: FeaturedItem;
  onAddToCart: (item: FeaturedItem) => void;
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < fullStars;
          const half = !filled && hasHalf && i === fullStars;
          return (
            <div key={i} style={{ position: "relative", width: 12, height: 12 }}>
              {/* Background (empty) star */}
              <StarIcon size={12} weight="regular" color="#D5D9D9" style={{ position: "absolute", top: 0, left: 0 }} />
              {/* Filled star or half star */}
              {(filled || half) && (
                <div
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: half ? "50%" : "100%",
                    overflow: "hidden",
                  }}
                >
                  <StarIcon size={12} weight="fill" color="#FF9900" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {count !== undefined && (
        <span style={{ fontSize: 12, color: "#007185", lineHeight: 1 }}>
          {count.toLocaleString("en-IN")}
        </span>
      )}
    </div>
  );
}

export function FeaturedItemCard({ item, onAddToCart }: FeaturedItemCardProps) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    if (added) return;
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Estimate shipping cost based on price (free for items > ₹499)
  const shippingCost = item.price >= 499 ? 0 : Math.round(item.price * 0.05);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid #e7e7e7",
      }}
    >
      {/* Product image — small square thumbnail like Amazon */}
      <div
        style={{
          width: 68,
          height: 68,
          flexShrink: 0,
          border: "1px solid #ddd",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {!imgError && item.image?.startsWith("http") ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <ShoppingCartSimpleIcon size={24} weight="light" color="#aaa" />
        )}
      </div>

      {/* Info column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name — 2-line clamp */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "#0F1111",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 3,
          }}
        >
          {item.name}
        </div>

        {/* Stars */}
        {item.rating && (
          <StarRating rating={item.rating} count={item.reviewCount} />
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1111" }}>
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          {item.mrp && item.mrp > item.price && (
            <span style={{ fontSize: 12, color: "#565959", textDecoration: "line-through" }}>
              ₹{item.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Shipping */}
        <div style={{ fontSize: 12, color: "#565959", marginBottom: 7 }}>
          {shippingCost === 0
            ? <span style={{ color: "#007600" }}>FREE delivery</span>
            : <span>₹{shippingCost} shipping</span>
          }
        </div>

        {/* Add to cart button — Amazon yellow style */}
        <button
          onClick={handleAdd}
          disabled={added}
          style={{
            padding: "5px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 400,
            border: added ? "1px solid #c7c7c7" : "1px solid #FFA41C",
            background: added
              ? "linear-gradient(to bottom, #f7f8fa, #e7e9ec)"
              : "linear-gradient(to bottom, #FFE789, #F5C518)",
            color: "#0F1111",
            cursor: added ? "default" : "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            boxShadow: added ? "none" : "0 1px 0 rgba(255,255,255,.4) inset",
          }}
          onMouseEnter={(e) => {
            if (!added) (e.currentTarget as HTMLElement).style.background = "linear-gradient(to bottom, #F5DE68, #E8B800)";
          }}
          onMouseLeave={(e) => {
            if (!added) (e.currentTarget as HTMLElement).style.background = "linear-gradient(to bottom, #FFE789, #F5C518)";
          }}
        >
          {added ? "Added to Cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
