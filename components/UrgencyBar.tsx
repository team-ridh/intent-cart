"use client";

import type { ReactNode } from "react";
import type { UrgencyMode } from "@/lib/types";
import { Lightning, CurrencyDollar, ShieldCheck } from "@phosphor-icons/react";

interface UrgencyBarProps {
  value: UrgencyMode;
  onChange: (mode: UrgencyMode) => void;
  idPrefix?: string;
}

const MODES: { value: UrgencyMode; label: string; icon: ReactNode }[] = [
  { value: "fastest", label: "Fastest", icon: <Lightning size={14} weight="fill" /> },
  { value: "value",   label: "Best Value", icon: <CurrencyDollar size={14} weight="bold" /> },
  { value: "trusted", label: "Most Trusted", icon: <ShieldCheck size={14} weight="fill" /> },
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
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          {m.icon} {m.label}
        </button>
      ))}
    </div>
  );
}
