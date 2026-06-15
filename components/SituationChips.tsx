"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
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
  CaretLeftIcon,
  CaretRightIcon,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const CHIP_W = 86;
  const GAP = 10;

  // Compute how many chips fit using the full container width
  const computePerPage = useCallback(() => {
    if (!containerRef.current) return;
    const available = containerRef.current.clientWidth;
    const count = Math.max(1, Math.floor((available + GAP) / (CHIP_W + GAP)));
    setPerPage(count);
    setPage((p) => {
      const maxPage = Math.max(0, Math.ceil(CHIPS.length / count) - 1);
      return Math.min(p, maxPage);
    });
  }, []);

  useEffect(() => {
    computePerPage();
    const ro = new ResizeObserver(computePerPage);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [computePerPage]);

  const totalPages = Math.ceil(CHIPS.length / perPage);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const visibleChips = CHIPS.slice(page * perPage, page * perPage + perPage);

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

      {/* Chips track — relative container so nav overlays can be absolute */}
      <div style={{ position: "relative" }}>

        {/* Chips row — fills full width */}
        <div
          ref={containerRef}
          style={{ display: "flex", gap: GAP, justifyContent: "flex-start" }}
        >
          {visibleChips.map((c) => {
            const isActive = activeText === c.text;
            return (
              <button
                key={c.label}
                id={`chip-${c.label.toLowerCase().replace(/[\s\n]+/g, "-")}`}
                onClick={() => onSelect(c.text)}
                style={{
                  flexShrink: 0,
                  width: `calc((100% - ${(perPage - 1) * GAP}px) / ${perPage})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
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
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {c.icon}
                </span>
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

        {/* ── Left overlay nav ── */}
        {canPrev && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingLeft: 4,
              background: "linear-gradient(to right, var(--bg-base, #f5f6fa) 30%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 2,
              borderRadius: "14px 0 0 14px",
            }}
          >
            <button
              id="chips-prev"
              aria-label="Previous situations"
              onClick={() => setPage((p) => p - 1)}
              style={{
                pointerEvents: "auto",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1.5px solid var(--border)",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                transition: "all 0.15s ease",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent)";
                el.style.color = "#fff";
                el.style.borderColor = "var(--accent)";
                el.style.boxShadow = "0 2px 12px rgba(232,93,42,0.28)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.72)";
                el.style.color = "var(--text-secondary)";
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
              }}
            >
              <CaretLeftIcon size={13} weight="bold" />
            </button>
          </div>
        )}

        {/* ── Right overlay nav ── */}
        {canNext && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              width: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 4,
              background: "linear-gradient(to left, var(--bg-base, #f5f6fa) 30%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 2,
              borderRadius: "0 14px 14px 0",
            }}
          >
            <button
              id="chips-next"
              aria-label="Next situations"
              onClick={() => setPage((p) => p + 1)}
              style={{
                pointerEvents: "auto",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1.5px solid var(--border)",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                transition: "all 0.15s ease",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "var(--accent)";
                el.style.color = "#fff";
                el.style.borderColor = "var(--accent)";
                el.style.boxShadow = "0 2px 12px rgba(232,93,42,0.28)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.72)";
                el.style.color = "var(--text-secondary)";
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
              }}
            >
              <CaretRightIcon size={13} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => setPage(i)}
              style={{
                width: i === page ? 18 : 6,
                height: 6,
                borderRadius: 3,
                border: "none",
                background: i === page ? "var(--accent)" : "var(--border)",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
