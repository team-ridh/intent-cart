"use client";

import type { ReactNode } from "react";
import {
  UsersThree,
  CloudRain,
  Coffee,
  Lightning,
  Backpack,
  Thermometer,
  Airplane,
  Flame,
} from "@phosphor-icons/react";

interface Chip {
  icon: ReactNode;
  label: string;
  text: string;
}

const CHIPS: Chip[] = [
  { icon: <UsersThree size={14} weight="bold" />, label: "Guests arriving",  text: "Guests are arriving in 30 minutes" },
  { icon: <CloudRain  size={14} weight="bold" />, label: "Rainy day",        text: "It's raining heavily outside today" },
  { icon: <Coffee     size={14} weight="bold" />, label: "Tea break",        text: "Time for an afternoon tea break" },
  { icon: <Lightning  size={14} weight="bold" />, label: "Power cut",        text: "Power outage, need emergency items" },
  { icon: <Backpack   size={14} weight="bold" />, label: "School project",   text: "My child has a school project due tomorrow" },
  { icon: <Thermometer size={14} weight="bold" />, label: "Fever care",      text: "Feeling sick with fever and cold" },
  { icon: <Airplane   size={14} weight="bold" />, label: "Travel prep",      text: "Leaving for a trip in 2 hours" },
  { icon: <Flame      size={14} weight="bold" />, label: "Pooja essentials", text: "Need pooja items before evening" },
];

interface SituationChipsProps {
  activeText: string;
  onSelect: (text: string) => void;
}

export function SituationChips({ activeText, onSelect }: SituationChipsProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
        }}
      >
        Quick situations
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} className="stagger">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            id={`chip-${c.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={`chip animate-float-in${activeText === c.text ? " active" : ""}`}
            onClick={() => onSelect(c.text)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
