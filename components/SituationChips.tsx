"use client";

import type { ReactNode } from "react";
import {
  UsersThreeIcon,
  CloudRainIcon,
  CoffeeIcon,
  LightningIcon,
  BackpackIcon,
  ThermometerIcon,
  AirplaneIcon,
  FlameIcon,
} from "@phosphor-icons/react";

interface Chip {
  icon: ReactNode;
  label: string;
  text: string;
}

const CHIPS: Chip[] = [
  { icon: <UsersThreeIcon size={24} weight="regular" />, label: "Guests Arriving",  text: "Guests are arriving in 30 minutes" },
  { icon: <CoffeeIcon     size={24} weight="regular" />, label: "Tea Time",         text: "Time for an afternoon tea break" },
  { icon: <CloudRainIcon  size={24} weight="regular" />, label: "Rainy Day",        text: "It's raining heavily outside today" },
  { icon: <LightningIcon  size={24} weight="regular" />, label: "Power Cut",        text: "Power outage, need emergency items" },
  { icon: <BackpackIcon   size={24} weight="regular" />, label: "School Project",   text: "My child has a school project due tomorrow" },
  { icon: <ThermometerIcon size={24} weight="regular" />, label: "Fever Care",      text: "Feeling sick with fever and cold" },
  { icon: <AirplaneIcon   size={24} weight="regular" />, label: "Travel Prep",      text: "Leaving for a trip in 2 hours" },
  { icon: <FlameIcon      size={24} weight="regular" />, label: "Pooja Essentials", text: "Need pooja items before evening" },
];

interface SituationChipsProps {
  activeText: string;
  onSelect: (text: string) => void;
  onSubmit?: (text: string) => void; // if provided, tapping a chip submits immediately
}

export function SituationChips({ activeText, onSelect, onSubmit }: SituationChipsProps) {
  return (
    <div>
      {/* Section label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 12,
          fontFamily: "var(--font-display)",
        }}
      >
        Quick Situations
      </div>

      {/* Horizontally scrollable grid of cards */}
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="chips-scroll"
      >
        {CHIPS.map((c) => {
          const isActive = activeText === c.text;
          return (
            <button
              key={c.label}
              id={`chip-${c.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => {
                onSelect(c.text);
                onSubmit?.(c.text);
              }}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: 90,
                height: 90,
                borderRadius: 14,
                border: `1.5px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                background: isActive
                  ? "var(--accent-dim)"
                  : "var(--bg-raised)",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                padding: "12px 8px 10px",
                boxShadow: isActive
                  ? "0 0 0 3px var(--accent-glow)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
                }
              }}
            >
              {/* Icon */}
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {c.icon}
              </span>

              {/* Label — wraps at 2 lines max */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: "100%",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                  wordBreak: "break-word",
                  fontFamily: "var(--font-body)",
                }}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
