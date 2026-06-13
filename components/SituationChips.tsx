"use client";

interface Chip {
  emoji: string;
  label: string;
  text: string;
}

const CHIPS: Chip[] = [
  { emoji: "👥", label: "Guests arriving",  text: "Guests are arriving in 30 minutes" },
  { emoji: "🌧️", label: "Rainy day",       text: "It's raining heavily outside today" },
  { emoji: "☕", label: "Tea break",        text: "Time for an afternoon tea break" },
  { emoji: "⚡", label: "Power cut",        text: "Power outage, need emergency items" },
  { emoji: "🎒", label: "School project",   text: "My child has a school project due tomorrow" },
  { emoji: "🤒", label: "Fever care",       text: "Feeling sick with fever and cold" },
  { emoji: "✈️", label: "Travel prep",      text: "Leaving for a trip in 2 hours" },
  { emoji: "🪔", label: "Pooja essentials", text: "Need pooja items before evening" },
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
          >
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
