"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { UrgencyMode } from "@/lib/types";
import { Lightning, CurrencyDollar, ShieldCheck, Info } from "@phosphor-icons/react";

// ─── Mode definitions ──────────────────────────────────────────────
const MODES: {
  value: UrgencyMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  tooltip: { title: string; bullets: string[] };
}[] = [
  {
    value: "fastest",
    label: "Fastest",
    icon: <Lightning size={12} weight="fill" />,
    description: "In-stock items, lowest delivery time",
    tooltip: {
      title: "Fastest Delivery",
      bullets: [
        "Prioritises items available right now",
        "Sorts by shortest ETA first",
        "Avoids out-of-stock substitutes",
      ],
    },
  },
  {
    value: "value",
    label: "Best Value",
    icon: <CurrencyDollar size={12} weight="bold" />,
    description: "Lowest total cost, smart substitutes",
    tooltip: {
      title: "Best Value",
      bullets: [
        "Minimises your total basket price",
        "Picks cheaper substitutes when available",
        "Ranks items by cost-per-use",
      ],
    },
  },
  {
    value: "trusted",
    label: "Most Trusted",
    icon: <ShieldCheck size={12} weight="fill" />,
    description: "Top-rated brands, purchase confidence",
    tooltip: {
      title: "Most Trusted",
      bullets: [
        "Favours highest-rated brands",
        "Picks items with the most reviews",
        "Avoids unverified generic alternatives",
      ],
    },
  },
];

const ACTIVE_BG: Record<UrgencyMode, string> = {
  fastest: "var(--accent-teal)",
  value:   "var(--accent-green)",
  trusted: "var(--accent-purple)",
};

const TOOLTIP_COLOR: Record<UrgencyMode, string> = {
  fastest: "var(--accent-teal)",
  value:   "var(--accent-green)",
  trusted: "#7C3AED",
};

interface UrgencyBarProps {
  value: UrgencyMode;
  onChange: (mode: UrgencyMode) => void;
  idPrefix?: string;
  showDescription?: boolean;
}

// ─── Tooltip state ─────────────────────────────────────────────────
interface TooltipPos {
  mode: UrgencyMode;
  top: number;
  right: number;
  width: number;
}

export function UrgencyBar({
  value,
  onChange,
  idPrefix = "urgency",
  showDescription = false,
}: UrgencyBarProps) {
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTooltip = useCallback((mode: UrgencyMode, el: HTMLElement) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // Find the parent button wrapper to measure its right edge
    const buttonWrapper = el.closest("[data-urgency-btn]") as HTMLElement | null;
    const rect = (buttonWrapper ?? el).getBoundingClientRect();
    setTooltipPos({
      mode,
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,  // align right edge with button right
      width: Math.max(rect.width, 180),        // at least 180px wide
    });
  }, []);

  const closeTooltip = useCallback((mode: UrgencyMode) => {
    hideTimer.current = setTimeout(() => {
      setTooltipPos((cur) => (cur?.mode === mode ? null : cur));
    }, 120);
  }, []);

  const activeMode = MODES.find((m) => m.value === value)!;

  // ── Portal tooltip ───────────────────────────────────────────────
  const activeTooltip = tooltipPos && MODES.find((m) => m.value === tooltipPos.mode);
  const tooltipPortal =
    activeTooltip && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: tooltipPos!.top,
              right: tooltipPos!.right,
              width: tooltipPos!.width,
              zIndex: 9999,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              pointerEvents: "none",
              animation: "float-in 0.15s ease forwards",
            }}
          >
            {/* Title */}
            <div style={{
              fontWeight: 700,
              fontSize: 12,
              color: TOOLTIP_COLOR[activeTooltip.value],
              marginBottom: 7,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--font-display)",
            }}>
              {activeTooltip.icon}
              {activeTooltip.tooltip.title}
            </div>
            {/* Bullets */}
            <ul style={{ margin: 0, paddingLeft: 14, listStyle: "disc" }}>
              {activeTooltip.tooltip.bullets.map((b) => (
                <li key={b} style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div style={{ width: "100%" }}>
      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: 4,
          gap: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {MODES.map((m) => {
          const isActive = value === m.value;

          return (
            // data-urgency-btn lets getBoundingClientRect target the full button wrapper
            <div key={m.value} style={{ flex: 1, position: "relative" }} data-urgency-btn>

              {/* Main button — ⓘ is now the last inline flex child, no absolute positioning needed */}
              <button
                id={`${idPrefix}-${m.value}`}
                onClick={() => onChange(m.value)}
                style={{
                  width: "100%",
                  minHeight: 36,
                  padding: "5px 8px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: "none",
                  background: isActive ? ACTIVE_BG[m.value] : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {m.icon}
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</span>

                {/* ⓘ inline — part of the flex row, no absolute positioning */}
                <span
                  id={`${idPrefix}-info-${m.value}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`About ${m.label}`}
                  onFocus={(e) => openTooltip(m.value, e.currentTarget as HTMLElement)}
                  onBlur={() => closeTooltip(m.value)}
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 10,
                    color: isActive ? "rgba(255,255,255,0.65)" : "var(--text-faint)",
                    background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    openTooltip(m.value, e.currentTarget as HTMLElement);
                    (e.currentTarget as HTMLElement).style.color = isActive ? "#fff" : "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background = isActive ? "rgba(255,255,255,0.3)" : "var(--bg-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    closeTooltip(m.value);
                    (e.currentTarget as HTMLElement).style.color = isActive ? "rgba(255,255,255,0.65)" : "var(--text-faint)";
                    (e.currentTarget as HTMLElement).style.background = isActive ? "rgba(255,255,255,0.18)" : "transparent";
                  }}
                >
                  <Info size={10} weight="bold" />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Description line ────────────────────────────────────── */}
      {showDescription && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
            transition: "all 0.2s ease",
            minHeight: 18,
          }}
        >
          {activeMode.description}
        </div>
      )}

      {/* ── Portal tooltip (renders at body level, never clipped) ─ */}
      {tooltipPortal}
    </div>
  );
}
