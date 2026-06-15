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
  ForkKnifeIcon,
  WrenchIcon,
  GiftIcon,
  DeviceMobileIcon,
  BabyIcon,
  PersonIcon,
  BalloonIcon,
  PawPrintIcon,
  BarbellIcon,
  BroomIcon,
  SunHorizonIcon,
  CowIcon,
  SnowflakeIcon,
  PepperIcon,
  BagIcon,
  PlantIcon,
  SparkleIcon,
  BugIcon,
  BowlFoodIcon,
  PaperclipIcon,
} from "@phosphor-icons/react";

interface Chip {
  icon: ReactNode;
  label: string;
  text: string;
}

const CHIPS: Chip[] = [
  // ── Situational / Emergency ───────────────────────────────────
  {
    icon: <UsersThreeIcon size={22} weight="regular" />,
    label: "Guests\nArriving",
    text: "Guests are arriving in 30 minutes",
  },
  {
    icon: <ThermometerIcon size={22} weight="regular" />,
    label: "Fever\nCare",
    text: "Feeling sick with fever and cold",
  },
  {
    icon: <LightningIcon size={22} weight="regular" />,
    label: "Power\nCut",
    text: "Power outage, need emergency items",
  },
  {
    icon: <CloudRainIcon size={22} weight="regular" />,
    label: "Rainy\nDay",
    text: "It's raining heavily outside today",
  },
  {
    icon: <AirplaneIcon size={22} weight="regular" />,
    label: "Travel\nPrep",
    text: "Leaving for a trip in 2 hours",
  },
  {
    icon: <BalloonIcon size={22} weight="regular" />,
    label: "Party\nTime",
    text: "Planning a birthday party at home",
  },
  // ── Daily Routine ─────────────────────────────────────────────
  {
    icon: <CoffeeIcon size={22} weight="regular" />,
    label: "Tea\nBreak",
    text: "Time for an afternoon tea break",
  },
  {
    icon: <SunHorizonIcon size={22} weight="regular" />,
    label: "Breakfast\nTime",
    text: "Need breakfast items for the morning",
  },
  {
    icon: <ForkKnifeIcon size={22} weight="regular" />,
    label: "Mid-Cook\nItem",
    text: "I ran out of an ingredient while cooking",
  },
  {
    icon: <BowlFoodIcon size={22} weight="regular" />,
    label: "Quick\nMeals",
    text: "Need ready-to-eat or instant food options",
  },
  // ── Grocery & Pantry ──────────────────────────────────────────
  {
    icon: <PlantIcon size={22} weight="regular" />,
    label: "Restock\nPantry",
    text: "Need to restock atta, rice, dal, oil and masalas",
  },
  {
    icon: <CowIcon size={22} weight="regular" />,
    label: "Dairy &\nEggs",
    text: "Running low on milk, curd, paneer and eggs",
  },
  {
    icon: <SnowflakeIcon size={22} weight="regular" />,
    label: "Frozen\nFood",
    text: "Need to stock up on frozen snacks and veggies",
  },
  {
    icon: <BagIcon size={22} weight="regular" />,
    label: "Snacks &\nMunchies",
    text: "Want some snacks and munchies to munch on",
  },
  {
    icon: <PepperIcon size={22} weight="regular" />,
    label: "Sauces &\nSpreads",
    text: "Need ketchup, mayo, soy sauce and condiments",
  },
  // ── Home & Lifestyle ──────────────────────────────────────────
  {
    icon: <BroomIcon size={22} weight="regular" />,
    label: "Deep\nCleaning",
    text: "Need cleaning supplies for a deep clean",
  },
  {
    icon: <WrenchIcon size={22} weight="regular" />,
    label: "Home\nRepair",
    text: "Something broke, need repair supplies",
  },
  {
    icon: <BugIcon size={22} weight="regular" />,
    label: "Pest\nControl",
    text: "Mosquito and insect problem at home",
  },
  // ── Personal & Health ────────────────────────────────────────
  {
    icon: <PersonIcon size={22} weight="regular" />,
    label: "Personal\nCare",
    text: "Running low on shampoo, soap and toiletries",
  },
  {
    icon: <SparkleIcon size={22} weight="regular" />,
    label: "Skincare\nRoutine",
    text: "Need sunscreen, serums and skincare products",
  },
  {
    icon: <BarbellIcon size={22} weight="regular" />,
    label: "Gym &\nFitness",
    text: "Need protein, supplements and gym accessories",
  },
  {
    icon: <BabyIcon size={22} weight="regular" />,
    label: "Baby\nCare",
    text: "Running out of diapers and baby essentials",
  },
  // ── Special & Other ───────────────────────────────────────────
  {
    icon: <FlameIcon size={22} weight="regular" />,
    label: "Pooja\nEssentials",
    text: "Need pooja items before evening",
  },
  {
    icon: <GiftIcon size={22} weight="regular" />,
    label: "Gift\nShopping",
    text: "Need to buy a gift for someone",
  },
  {
    icon: <PawPrintIcon size={22} weight="regular" />,
    label: "Pet\nCare",
    text: "Need pet food and supplies for my dog or cat",
  },
  {
    icon: <DeviceMobileIcon size={22} weight="regular" />,
    label: "Tech\nAccessories",
    text: "Need cables, charger or electronics accessories",
  },
  {
    icon: <BackpackIcon size={22} weight="regular" />,
    label: "School\nProject",
    text: "My child has a school project due tomorrow",
  },
  {
    icon: <PaperclipIcon size={22} weight="regular" />,
    label: "Office\nSupplies",
    text: "Need A4 paper, pens and office stationery",
  },
];

interface SituationChipsProps {
  activeText: string;
  onSelect: (text: string) => void;
}

export function SituationChips({ activeText, onSelect }: SituationChipsProps) {
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

      {/* Horizontally scrollable row of cards */}
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
              id={`chip-${c.label.toLowerCase().replace(/[\s\n]+/g, "-")}`}
              onClick={() => onSelect(c.text)}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: 86,
                height: 86,
                borderRadius: 14,
                border: `1.5px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                background: isActive ? "var(--accent-dim)" : "var(--bg-raised)",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                padding: "10px 6px 8px",
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
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {c.icon}
              </span>

              {/* Label — two physical lines via white-space: pre-line */}
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  textAlign: "center",
                  lineHeight: 1.3,
                  whiteSpace: "pre-line",
                  maxWidth: "100%",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
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
