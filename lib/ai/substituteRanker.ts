import type { CartItem, UrgencyMode } from "../types";

// ─── Sort substitutes based on urgency mode ───────────────────────
// fastest → lowest eta first
// value   → lowest price first
// trusted → "trusted" type items first, then alphabetical
export function applyUrgencyMode(items: CartItem[], mode: UrgencyMode): CartItem[] {
  return items.map((item) => {
    const subs = [...item.substitutes];

    if (mode === "fastest") {
      subs.sort((a, b) => a.eta - b.eta);
    } else if (mode === "value") {
      subs.sort((a, b) => a.price - b.price);
    } else {
      // trusted: "trusted" type first, then by rating proxy (name alphabetical as stable tiebreak)
      subs.sort((a, b) => {
        if (a.type === "trusted" && b.type !== "trusted") return -1;
        if (b.type === "trusted" && a.type !== "trusted") return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return { ...item, substitutes: subs };
  });
}

// ─── Get the top-ranked substitute for a given item and mode ─────
export function getTopSubstitute(item: CartItem, mode: UrgencyMode) {
  const ranked = applyUrgencyMode([item], mode);
  return ranked[0]?.substitutes[0] ?? null;
}
