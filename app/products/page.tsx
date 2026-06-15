"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useCartStore } from "@/store/cartStore";
import { SCENARIO_CARTS } from "@/lib/data";
import type { CartItem, Substitute } from "@/lib/types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ShoppingCartSimpleIcon,
  XIcon,
  CaretDownIcon,
  CaretUpIcon,
  SlidersHorizontalIcon,
  ArrowLeftIcon,
  TruckIcon,
  LockSimpleIcon,
  CheckCircleIcon,
  HeartIcon,
  ShareNetworkIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  PackageIcon,
} from "@phosphor-icons/react";

// ─── Collect all unique products across all scenarios ──────────────────────────

function getAllProducts(): CartItem[] {
  const seen = new Set<string>();
  const all: CartItem[] = [];
  for (const items of Object.values(SCENARIO_CARTS)) {
    for (const item of items) {
      if (!seen.has(item.id) && item.image?.startsWith("http")) {
        seen.add(item.id);
        all.push(item);
      }
    }
  }
  return all;
}

const ALL_PRODUCTS = getAllProducts();

function getCategories(products: CartItem[]): string[] {
  const cats = new Set<string>();
  for (const p of products) {
    if (p.category) cats.add(p.category);
  }
  return ["All", ...Array.from(cats).sort()];
}

// ─── Data disclaimer badge ───────────────────────────────────────────────────

function DataDisclaimerBadge() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const triggerRef            = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({
      top:  r.bottom + 8,
      left: r.right - 240,
    });
    setVisible(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 500,
          color: visible ? "var(--text-muted)" : "var(--text-faint)",
          opacity: visible ? 1 : 0.4,
          transition: "opacity 0.2s ease, color 0.2s ease",
          userSelect: "none",
          padding: "2px 6px",
          borderRadius: 4,
          border: `1px solid ${visible ? "var(--border)" : "transparent"}`,
          background: visible ? "var(--bg-raised)" : "transparent",
          cursor: "default",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 4.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.25 7a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0V7Z" />
        </svg>
        Dataset
      </span>

      {visible && (
        <span
          style={{
            position: "fixed",
            top: pos.top,
            left: Math.max(8, pos.left),
            width: 240,
            padding: "9px 12px",
            background: "rgba(22, 22, 32, 0.94)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            fontSize: 11.5,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.82)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
            zIndex: 9999,
            pointerEvents: "none",
            whiteSpace: "normal",
          }}
        >
          <span style={{
            position: "absolute",
            top: -5,
            right: 12,
            width: 8,
            height: 8,
            background: "rgba(22,22,32,0.94)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderTop:  "1px solid rgba(255,255,255,0.08)",
            transform: "rotate(45deg)",
            display: "block",
          }} />
          Product image and data may not be 100% accurate, as it is sourced from a public dataset and mock data.
        </span>
      )}
    </>
  );
}


type SortKey = "relevance" | "price_asc" | "price_desc" | "rating" | "reviews";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Avg. Customer Rating" },
  { key: "reviews", label: "Most Reviewed" },
];

function sortProducts(products: CartItem[], key: SortKey): CartItem[] {
  const arr = [...products];
  switch (key) {
    case "price_asc":  return arr.sort((a, b) => a.price - b.price);
    case "price_desc": return arr.sort((a, b) => b.price - a.price);
    case "rating":     return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "reviews":    return arr.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    default:           return arr;
  }
}

// ─── Star rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      style={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          size={size}
          weight={i < full ? "fill" : i === full && half ? "duotone" : "regular"}
          color={i < full || (i === full && half) ? "#e77600" : "#d0d0d0"}
        />
      ))}
    </span>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: CartItem;
  inCart: boolean;
  onView: (p: CartItem) => void;
  onAddToCart: (p: CartItem, qty: number) => void;
}

function ProductCard({ product, inCart, onView, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div
      id={`product-${product.id}`}
      role="article"
      aria-label={product.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: hovered ? "var(--shadow-card)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-2px)" : "none",
        borderColor: hovered ? "rgba(0,0,0,0.12)" : "var(--border)",
      }}
    >
      {/* Badge */}
      {product.badge && (
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 2,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 4,
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          {product.badge}
        </span>
      )}

      {/* Image */}
      <button
        onClick={() => onView(product)}
        aria-label={`View ${product.name}`}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "none",
          padding: 0,
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 8,
            transition: "transform 0.2s ease",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f0f2f8'/%3E%3C/svg%3E";
          }}
        />
      </button>

      {/* Info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          {product.brand}
        </p>
        <button
          onClick={() => onView(product)}
          aria-label={`View details for ${product.name}`}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--accent-teal)",
            lineHeight: 1.4,
            textAlign: "left",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </button>

        {product.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <StarRating rating={product.rating} />
            {product.reviewCount && (
              <span style={{ fontSize: 11, color: "var(--accent-teal)" }}>
                {product.reviewCount.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 2 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            ₹{product.price}
          </span>
          {product.mrp && product.mrp > product.price && (
            <>
              <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>₹{product.mrp}</span>
              {discount > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#B12704" }}>-{discount}%</span>
              )}
            </>
          )}
        </div>

        <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>{product.unit}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-teal)", margin: "2px 0 10px" }}>
          <TruckIcon size={11} weight="fill" />
          Delivery in ~{product.eta} min
        </p>
      </div>

      {/* Add to Cart */}
      <button
        onClick={() => onAddToCart(product, 1)}
        id={`add-${product.id}`}
        aria-label={inCart ? `${product.name} is in cart` : `Add ${product.name} to cart`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "9px 12px",
          background: inCart
            ? "linear-gradient(135deg, var(--accent-green) 0%, #22c55e 100%)"
            : "linear-gradient(135deg, var(--accent) 0%, #F97316 100%)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 13,
          border: "none",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          boxShadow: inCart ? "0 2px 10px var(--accent-green-dim)" : "0 2px 10px var(--accent-glow)",
          marginTop: "auto",
          transition: "all 0.2s ease",
        }}
      >
        {inCart ? (
          <><CheckCircleIcon size={14} weight="fill" /> In Cart</>
        ) : (
          <><ShoppingCartSimpleIcon size={14} weight="bold" /> Add to Cart</>
        )}
      </button>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────

interface ProductDetailModalProps {
  product: CartItem;
  inCart: boolean;
  onAddToCart: (p: CartItem, qty: number) => void;
  onClose: () => void;
}

function ProductDetailModal({ product, inCart, onAddToCart, onClose }: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedSub, setSelectedSub] = useState<Substitute | null>(null);
  const displayProduct = selectedSub
    ? { ...product, name: selectedSub.name, brand: selectedSub.brand, price: selectedSub.price, mrp: selectedSub.mrp, image: selectedSub.image }
    : product;
  const discount =
    displayProduct.mrp && displayProduct.mrp > displayProduct.price
      ? Math.round(((displayProduct.mrp - displayProduct.price) / displayProduct.mrp) * 100)
      : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 60,
        }}
      />

      {/* Panel */}
      <div
        className="animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 70,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px 10px",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--bg-surface)",
            zIndex: 2,
          }}
        >
          <button className="btn-ghost" onClick={onClose} aria-label="Close product detail"
            style={{ gap: 4, fontSize: 14 }}>
            <ArrowLeftIcon size={18} weight="bold" />
            Back
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="btn-ghost" style={{ padding: 8, borderRadius: "50%" }} aria-label="Share">
              <ShareNetworkIcon size={18} />
            </button>
            <button className="btn-ghost" style={{ padding: 8, borderRadius: "50%" }} aria-label="Save to wishlist">
              <HeartIcon size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 20,
        }}>

          {/* Image */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              position: "relative",
              width: 220,
              height: 220,
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border)",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              {product.badge && (
                <span style={{
                  position: "absolute", top: 10, left: 10, zIndex: 2,
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: 4, background: "var(--accent)", color: "#fff",
                }}>
                  {product.badge}
                </span>
              )}
              <img
                src={displayProduct.image}
                alt={displayProduct.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f2f8'/%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-teal)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
              {displayProduct.brand}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(17px, 3vw, 22px)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, margin: "0 0 6px" }}>
              {displayProduct.name}
            </h2>
            {product.asin && (
              <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "0 0 8px" }}>ASIN: {product.asin}</p>
            )}

            {product.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <StarRating rating={product.rating} size={14} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e77600" }}>{product.rating}</span>
                {product.reviewCount && (
                  <span style={{ fontSize: 13, color: "var(--accent-teal)" }}>
                    {product.reviewCount.toLocaleString("en-IN")} ratings
                  </span>
                )}
              </div>
            )}

            <div style={{ height: 1, background: "var(--border)", margin: "10px 0 14px" }} />

            {/* Price block */}
            <div style={{ marginBottom: 14 }}>
              {discount > 0 && (
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#B12704", background: "rgba(177,39,4,0.08)",
                  border: "1px solid rgba(177,39,4,0.2)", borderRadius: 4, padding: "2px 8px", marginBottom: 6,
                }}>
                  Deal of the Day
                </span>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#B12704" }}>
                  ₹{displayProduct.price}
                </span>
                {displayProduct.mrp && displayProduct.mrp > displayProduct.price && (
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    M.R.P.: <s>₹{displayProduct.mrp}</s>
                    {discount > 0 && <span style={{ color: "#B12704", fontWeight: 600, marginLeft: 4 }}>({discount}% off)</span>}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--accent-green)", margin: "4px 0 0" }}>Inclusive of all taxes</p>
            </div>

            {product.description && (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                {product.description}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <PackageIcon size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{product.unit}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <TruckIcon size={13} color="var(--accent-teal)" />
              <span style={{ fontSize: 13, color: "var(--accent-teal)", fontWeight: 500 }}>
                Estimated delivery in ~{product.eta} min
              </span>
            </div>

            {product.reasonTag && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
                borderRadius: "var(--radius-pill)", background: "var(--accent-dim)",
                border: "1px solid var(--border-accent)", color: "var(--accent)",
                fontSize: 11, fontWeight: 600, marginBottom: 16,
              }}>
                <TagIcon size={11} />
                {product.reasonTag}
              </div>
            )}

            {/* Substitutes */}
            {product.substitutes && product.substitutes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>
                  Also available as
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setSelectedSub(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: 8, background: "var(--bg-surface)", cursor: "pointer",
                      border: `1px solid ${!selectedSub ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)", fontSize: 11, fontWeight: 600,
                      color: !selectedSub ? "var(--accent)" : "var(--text-secondary)",
                      minWidth: 68,
                      boxShadow: !selectedSub ? "0 0 0 2px var(--accent-glow)" : "none",
                    }}
                  >
                    <img src={product.image} alt={product.name} style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6, background: "var(--bg-elevated)" }} />
                    <span>₹{product.price}</span>
                  </button>
                  {product.substitutes.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      title={sub.name}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: 8, background: "var(--bg-surface)", cursor: "pointer",
                        border: `1px solid ${selectedSub?.id === sub.id ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius-md)", fontSize: 11, fontWeight: 600,
                        color: selectedSub?.id === sub.id ? "var(--accent)" : "var(--text-secondary)",
                        minWidth: 68,
                        boxShadow: selectedSub?.id === sub.id ? "0 0 0 2px var(--accent-glow)" : "none",
                      }}
                    >
                      <img
                        src={sub.image} alt={sub.name}
                        style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6, background: "var(--bg-elevated)" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = product.image; }}
                      />
                      <span>₹{sub.price}</span>
                      <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{sub.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", overflow: "hidden", flexShrink: 0 }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 40, border: "none", background: "var(--bg-raised)", cursor: "pointer", color: "var(--text-secondary)", opacity: qty <= 1 ? 0.4 : 1 }}
                >
                  <MinusIcon size={14} weight="bold" />
                </button>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", minWidth: 32, textAlign: "center" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 40, border: "none", background: "var(--bg-raised)", cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  <PlusIcon size={14} weight="bold" />
                </button>
              </div>
              <button
                id="modal-add-cart-btn"
                onClick={() => onAddToCart(product, qty)}
                style={{
                  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 20px",
                  background: inCart
                    ? "linear-gradient(135deg, var(--accent-green) 0%, #22c55e 100%)"
                    : "linear-gradient(135deg, var(--accent) 0%, #F97316 100%)",
                  color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                  border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer",
                  boxShadow: inCart ? "0 4px 20px var(--accent-green-dim)" : "0 4px 20px var(--accent-glow)",
                }}
              >
                {inCart ? (
                  <><CheckCircleIcon size={16} weight="fill" /> In Cart</>
                ) : (
                  <><ShoppingCartSimpleIcon size={16} weight="bold" /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Trust strip */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#565959" }}>
                <LockSimpleIcon size={11} weight="fill" /> Secure transaction
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#565959" }}>
                <TruckIcon size={11} weight="fill" /> FREE delivery above ₹499
              </span>
            </div>

            {product.reason && (
              <div style={{ background: "rgba(232,93,42,0.05)", border: "1px solid rgba(232,93,42,0.15)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  Why this product?
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{product.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected substitute detail */}
        {selectedSub && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "14px 20px 20px", background: "var(--bg-raised)" }}>
            <div className="badge badge-teal" style={{ marginBottom: 6 }}>{selectedSub.label}</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: "0 0 4px" }}>{selectedSub.name}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{selectedSub.reason}</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────

function ProductsPage() {
  const router = useRouter();
  const { cart, addItem } = useCartStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewProduct, setViewProduct] = useState<CartItem | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const cartItemIds = useMemo(
    () => new Set((cart?.items ?? []).map((i) => i.id)),
    [cart]
  );
  const categories = useMemo(() => getCategories(ALL_PRODUCTS), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToastMsg(msg);
    toastRef.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const filteredProducts = useMemo(() => {
    let products = ALL_PRODUCTS;
    if (activeCategory !== "All") {
      products = products.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return sortProducts(products, sortKey);
  }, [activeCategory, search, sortKey]);

  const handleAddToCart = useCallback(
    async (product: CartItem, qty = 1) => {
      if (cartItemIds.has(product.id) || addedIds.has(product.id)) {
        router.push("/cart");
        return;
      }
      const newItem: CartItem = { ...product, quantity: Math.max(1, qty), isEssential: false, isAddon: true };
      setAddedIds((prev) => new Set([...prev, product.id]));
      await addItem(newItem);
      showToast(`${product.name.split(" ").slice(0, 3).join(" ")} added to cart`);
    },
    [cartItemIds, addedIds, addItem, router, showToast]
  );

  const isInCart = useCallback(
    (id: string) => cartItemIds.has(id) || addedIds.has(id),
    [cartItemIds, addedIds]
  );

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";

  return (
    <main style={{ minHeight: "100vh", background: "transparent", paddingBottom: 60 }}>

      {/* Toast */}
      {toastMsg && (
        <div
          className="cart-toast cart-toast--success animate-float-in"
          role="status"
          aria-live="polite"
        >
          {toastMsg}
        </div>
      )}

      {/* Navbar */}
      <Navbar title="Products (Mock Data)" />

      {/* Controls bar */}
      <div
        style={{
          background: "rgba(245,246,250,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 56,
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px clamp(16px, 5vw, 80px)",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <MagnifyingGlassIcon
              size={16}
              color="var(--text-muted)"
              style={{ position: "absolute", left: 12, pointerEvents: "none" }}
            />
            <input
              id="product-search-input"
              type="search"
              placeholder="Search products, brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
              style={{
                width: "100%",
                padding: "9px 36px 9px 36px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{
                  position: "absolute", right: 10, background: "none", border: "none",
                  cursor: "pointer", color: "var(--text-muted)", padding: 4,
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <XIcon size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Sort */}
            <div style={{ position: "relative" }} ref={sortRef}>
              <button
                id="sort-dropdown-btn"
                onClick={() => setShowSort((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showSort}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-pill)",
                  fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                  color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                <SlidersHorizontalIcon size={14} weight="bold" />
                <span style={{ display: "inline" }}>{sortLabel}</span>
                {showSort ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
              </button>
              {showSort && (
                <div
                  role="listbox"
                  aria-label="Sort options"
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 6px)",
                    zIndex: 50, background: "var(--bg-surface)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-elevated)", padding: 6, minWidth: 200,
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      role="option"
                      aria-selected={sortKey === opt.key}
                      id={`sort-${opt.key}`}
                      onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                      style={{
                        display: "block", width: "100%", padding: "10px 14px",
                        textAlign: "left", border: "none",
                        background: sortKey === opt.key ? "var(--accent-dim)" : "none",
                        borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 14,
                        color: sortKey === opt.key ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: sortKey === opt.key ? 600 : 400, cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle — only on mobile */}
            <button
              id="filter-toggle-btn"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle category filters"
              aria-expanded={showFilters}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 14px", background: "var(--bg-surface)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-pill)",
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                color: showFilters ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <FunnelIcon size={14} weight="bold" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: "flex",
          gap: 0,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px clamp(16px, 5vw, 80px) 0",
          alignItems: "flex-start",
        }}
      >
        {/* Desktop sticky sidebar */}
        <SidebarDesktop
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(cat) => setActiveCategory(cat)}
        />

        {/* Products grid */}
        <div className="prod-main-col" style={{ flex: 1, minWidth: 0, paddingLeft: 20 }}>
          {/* Result meta */}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {filteredProducts.length === 0
                  ? "No products found"
                  : `${filteredProducts.length.toLocaleString("en-IN")} result${filteredProducts.length !== 1 ? "s" : ""}`}
              </span>
              {search && <span style={{ color: "var(--accent)" }}> for &ldquo;{search}&rdquo;</span>}
              {activeCategory !== "All" && <span style={{ color: "var(--accent)" }}> in {activeCategory}</span>}
            </span>
            <DataDisclaimerBadge />
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", gap: 12 }}>
              <MagnifyingGlassIcon size={48} weight="light" color="var(--text-faint)" />
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: 0 }}>
                No products found
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
                Try a different search term or browse a different category.
              </p>
              <button
                className="btn-secondary"
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
            }}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={isInCart(product.id)}
                  onView={setViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {showFilters && (
        <>
          <div
            onClick={() => setShowFilters(false)}
            aria-hidden
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)", zIndex: 79,
            }}
          />
          <aside
            aria-label="Product categories"
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0,
              width: 280, zIndex: 80,
              background: "var(--bg-surface)",
              borderRight: "1px solid var(--border)",
              borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
              padding: 6, overflowY: "auto",
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px 6px", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Department
              </span>
              <button
                className="btn-ghost"
                style={{ padding: "4px 8px" }}
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <XIcon size={14} weight="bold" />
              </button>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }} role="list">
              {categories.map((cat) => {
                const count = cat === "All"
                  ? ALL_PRODUCTS.length
                  : ALL_PRODUCTS.filter((p) => p.category === cat).length;
                const active = activeCategory === cat;
                return (
                  <li key={cat}>
                    <button
                      id={`cat-mobile-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => { setActiveCategory(cat); setShowFilters(false); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 6, width: "100%", padding: "9px 10px",
                        border: "none", borderRadius: "var(--radius-sm)",
                        background: active ? "var(--accent-dim)" : "none",
                        fontFamily: "var(--font-body)", fontSize: 14,
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {cat}
                      <span style={{
                        fontSize: 11, color: active ? "var(--accent)" : "var(--text-faint)",
                        background: active ? "rgba(232,93,42,0.15)" : "var(--bg-elevated)",
                        padding: "2px 6px", borderRadius: 20, flexShrink: 0,
                      }}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </>
      )}


      {/* Product detail modal */}
      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          inCart={isInCart(viewProduct.id)}
          onAddToCart={handleAddToCart}
          onClose={() => setViewProduct(null)}
        />
      )}
    </main>
  );
}

// ─── Desktop sidebar (always-visible, sticky) ─────────────────────────────────
// Separate component to avoid SSR/client mismatch from window.innerWidth

function SidebarDesktop({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <aside
      aria-label="Product categories"
      className="prod-sidebar-desktop"
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 6,
        position: "sticky",
        top: 130,
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        scrollbarWidth: "thin" as const,
      }}
    >
      <div style={{ padding: "10px 10px 6px", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Department
        </span>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }} role="list">
        {categories.map((cat) => {
          const count = cat === "All"
            ? ALL_PRODUCTS.length
            : ALL_PRODUCTS.filter((p) => p.category === cat).length;
          const active = activeCategory === cat;
          return (
            <li key={cat}>
              <button
                id={`cat-desktop-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(cat)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 6, width: "100%", padding: "9px 10px",
                  border: "none", borderRadius: "var(--radius-sm)",
                  background: active ? "var(--accent-dim)" : "none",
                  fontFamily: "var(--font-body)", fontSize: 14,
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                {cat}
                <span style={{
                  fontSize: 11,
                  color: active ? "var(--accent)" : "var(--text-faint)",
                  background: active ? "rgba(232,93,42,0.15)" : "var(--bg-elevated)",
                  padding: "2px 6px", borderRadius: 20, flexShrink: 0,
                }}>
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <ErrorBoundary>
      <ProductsPage />
    </ErrorBoundary>
  );
}
