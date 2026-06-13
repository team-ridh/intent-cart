"use client";

import type { UrgencyMode } from "@/lib/types";

interface UrgencyBarProps {
  value: UrgencyMode;
  onChange: (mode: UrgencyMode) => void;
  idPrefix?: string;
}

const MODES: { value: UrgencyMode; label: string }[] = [
  { value: "fastest", label: "⚡ Fastest" },
  { value: "value",   label: "💰 Best Value" },
  { value: "trusted", label: "⭐ Most Trusted" },
];

export function UrgencyBar({ value, onChange, idPrefix = "urgency" }: UrgencyBarProps) {
  return (
    <div className="urgency-bar">
      {MODES.map((m) => (
        <button
          key={m.value}
          id={`${idPrefix}-${m.value}`}
          className={`urgency-item ${m.value}${value === m.value ? " active" : ""}`}
          onClick={() => onChange(m.value)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
