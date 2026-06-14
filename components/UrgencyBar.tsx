"use client";

import type { ReactNode } from "react";
import type { UrgencyMode } from "@/lib/types";
import { Lightning, CurrencyDollar, ShieldCheck } from "@phosphor-icons/react";

interface UrgencyBarProps {
  value: UrgencyMode;
  onChange: (mode: UrgencyMode) => void;
  idPrefix?: string;
  showDescription?: boolean;
}

const MODES: {
  value: UrgencyMode;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    value: "fastest",
    label: "Fastest",
    icon: <Lightning size={14} weight="fill" />,
    description: "In-stock items, lowest delivery time",
  },
  {
    value: "value",
    label: "Best Value",
    icon: <CurrencyDollar size={14} weight="bold" />,
    description: "Lowest total cost, smart substitutes",
  },
  {
    value: "trusted",
    label: "Most Trusted",
    icon: <ShieldCheck size={14} weight="fill" />,
    description: "Top-rated brands, purchase confidence",
  },
];

const ACTIVE_BG: Record<UrgencyMode, string> = {
  fastest: "var(--accent-teal)",
  value: "var(--accent-green)",
  trusted: "var(--accent-purple)",
};

export function UrgencyBar({
  value,
  onChange,
  idPrefix = "urgency",
  showDescription = false,
}: UrgencyBarProps) {
  return (
    <div style={{ width: "100%" }}>
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
            <button
              key={m.value}
              id={`${idPrefix}-${m.value}`}
              onClick={() => onChange(m.value)}
              style={{
                flex: 1,
                minHeight: 44,
                padding: "8px 10px",
                borderRadius: "var(--radius-pill)",
                fontSize: 13,
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
                gap: 5,
                boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
            >
              {m.icon}
              <span style={{ whiteSpace: "nowrap" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

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
          {MODES.find((m) => m.value === value)?.description}
        </div>
      )}
    </div>
  );
}
