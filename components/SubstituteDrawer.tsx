"use client";

import type { CartItem } from "@/lib/types";
import { Lightning, CurrencyDollar, ShieldCheck, Sparkle, X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

const TYPE_COLOR: Record<string, string> = {
  fastest: "var(--accent-teal)",
  cheapest: "var(--accent-green)",
  trusted: "var(--accent-purple)",
  best: "var(--accent)",
};

const TYPE_ICON: Record<string, ReactNode> = {
  fastest:  <Lightning size={11} weight="fill" />,
  cheapest: <CurrencyDollar size={11} weight="bold" />,
  trusted:  <ShieldCheck size={11} weight="fill" />,
  best:     <Sparkle size={11} weight="fill" />,
};

const TYPE_LABEL: Record<string, string> = {
  fastest:  "Fastest",
  cheapest: "Cheapest",
  trusted:  "Trusted",
  best:     "Best Match",
};

interface SubstituteDrawerProps {
  item: CartItem;
  selectedId?: string;
  onClose: () => void;
  onSelect: (subId: string) => void;
}

export function SubstituteDrawer({
  item,
  selectedId,
  onClose,
  onSelect,
}: SubstituteDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
        }}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="animate-slide-up"
        role="dialog"
        aria-label={`Substitutes for ${item.name}`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: 24,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>
              {item.image.startsWith("http") ? (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-elevated)", padding: 2, flexShrink: 0 }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span>{item.image}</span>
              )}
              Substitutes for {item.name}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
              Select the best option for your need
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={onClose}
            id="close-substitute-drawer"
            aria-label="Close substitutes drawer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Original item (always shown as "Best Match") */}
        <div
          className={`card${!selectedId ? " card-accent" : ""}`}
          style={{ marginBottom: 10, cursor: "pointer" }}
          onClick={() => onSelect("")}
          id={`sub-original-${item.id}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="badge badge-orange" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Sparkle size={10} weight="fill" /> Best Match
                </span>
                {!selectedId && (
                  <span style={{ fontSize: 11, color: "var(--accent)" }}>Selected</span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.brand}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                ₹{item.price}
              </div>
              <div style={{ color: "var(--accent-teal)", fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
                <Lightning size={11} weight="fill" /> {item.eta} min
              </div>
            </div>
          </div>
        </div>

        {/* Substitute options */}
        {item.substitutes.map((sub) => (
          <div
            key={sub.id}
            className={`card${selectedId === sub.id ? " card-accent" : ""}`}
            style={{ marginBottom: 10, cursor: "pointer" }}
            onClick={() => onSelect(sub.id)}
            id={`sub-${sub.id}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              {/* Substitute thumbnail */}
              <div style={{ width: 46, height: 46, borderRadius: 8, flexShrink: 0, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {sub.image.startsWith("http") ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : sub.image}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: 20,
                      background: `${TYPE_COLOR[sub.type]}20`,
                      color: TYPE_COLOR[sub.type],
                      border: `1px solid ${TYPE_COLOR[sub.type]}40`,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {TYPE_ICON[sub.type]} {TYPE_LABEL[sub.type]}
                  </span>
                  {selectedId === sub.id && (
                    <span style={{ fontSize: 11, color: "var(--accent)" }}>Selected</span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{sub.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{sub.brand}</div>
                {sub.rating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <span style={{ color: "#FF9900", fontSize: 10, letterSpacing: "-1px" }}>
                      {"★".repeat(Math.round(sub.rating))}{"☆".repeat(5 - Math.round(sub.rating))}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                      {sub.rating.toFixed(1)} ({sub.reviewCount?.toLocaleString("en-IN")})
                    </span>
                  </div>
                )}
                <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                  {sub.reason}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                  ₹{sub.price}
                  {sub.price < item.price && (
                    <span style={{ fontSize: 11, color: "var(--accent-green)", display: "block" }}>
                      save ₹{item.price - sub.price}
                    </span>
                  )}
                </div>
                {sub.mrp && sub.mrp > sub.price && (
                  <div style={{ fontSize: 10, color: "var(--text-faint)", lineHeight: 1.4 }}>
                    <span style={{ textDecoration: "line-through" }}>₹{sub.mrp}</span>
                    {" "}
                    <span style={{ color: "#5cb85c", fontWeight: 600 }}>{sub.discount}% off</span>
                  </div>
                )}
                <div style={{ color: "var(--accent-teal)", fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
                  <Lightning size={11} weight="fill" /> {sub.eta} min
                </div>
              </div>
            </div>
          </div>
        ))}

        {item.substitutes.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0", fontSize: 14 }}>
            No substitutes available — this is the only option in stock.
          </div>
        )}
      </div>
    </>
  );
}
