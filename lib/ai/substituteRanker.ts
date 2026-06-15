import type { CartItem, Substitute, UrgencyMode } from "../types";

// ─── Score functions: higher = better for each mode ───────────────────────────

function fastestScore(candidate: Substitute): number {
  // Lower ETA is better → negate. Tiebreak: lower price is better.
  return -candidate.eta * 10000 - candidate.price;
}

function valueScore(candidate: Substitute): number {
  // Lower price is better → negate. Tiebreak: lower ETA is better.
  return -candidate.price * 10000 - candidate.eta;
}

function trustedScore(candidate: Substitute): number {
  // Higher rating is better. Tiebreak: more reviews = more reliable signal.
  // Unrated items default to 2.5 (mid-scale neutral) so they don't unfairly
  // underrank against items with reviews but no explicit rating.
  const rating = candidate.rating ?? 2.5;
  const reviews = candidate.reviewCount ?? 0;
  return rating * 10000 + Math.log1p(reviews);
}

function scoreForMode(sub: Substitute, mode: UrgencyMode): number {
  if (mode === "fastest") return fastestScore(sub);
  if (mode === "value")   return valueScore(sub);
  return trustedScore(sub); // "trusted"
}

// ─── Also score the original item itself (using it as a baseline candidate) ───
function itemScore(item: CartItem, mode: UrgencyMode): number {
  const base: Substitute = {
    id: "",
    name: item.name,
    brand: item.brand,
    price: item.price,
    mrp: item.mrp,
    type: "best",
    label: "Original",
    reason: "",
    eta: item.eta,
    image: item.image,
    asin: item.asin,
    rating: item.rating,
    reviewCount: item.reviewCount,
  };
  return scoreForMode(base, mode);
}

/**
 * For each item in the cart, determine the best substitute ID for the given mode.
 * Returns a map of { itemId → substituteId (or "" to keep original) }.
 *
 * Pure processing logic — operates only on data fields (eta, price, rating).
 * No item IDs or brand names are hardcoded here.
 */
export function computeAutoSelections(
  items: CartItem[],
  mode: UrgencyMode
): Record<string, string> {
  const selections: Record<string, string> = {};

  for (const item of items) {
    if (item.substitutes.length === 0) {
      // No choice — keep original (empty string means "use original item")
      selections[item.id] = "";
      continue;
    }

    // Score every substitute
    let bestId = "";             // "" means "keep original"
    let bestScore = itemScore(item, mode);

    for (const sub of item.substitutes) {
      const s = scoreForMode(sub, mode);
      if (s > bestScore) {
        bestScore = s;
        bestId = sub.id;
      }
    }

    selections[item.id] = bestId;
  }

  return selections;
}

/**
 * Re-sort the substitutes list within each item so the drawer shows them
 * in the right order for the mode (best first). Does NOT change which item is selected.
 */
export function applyUrgencyMode(items: CartItem[], mode: UrgencyMode): CartItem[] {
  return items.map((item) => {
    const subs = [...item.substitutes].sort(
      (a, b) => scoreForMode(b, mode) - scoreForMode(a, mode)
    );
    return { ...item, substitutes: subs };
  });
}

/**
 * Sort the cart items themselves by the mode's primary metric:
 * - fastest: ascending ETA (quickest items first)
 * - value:   ascending effective price × qty (cheapest first)
 * - trusted: descending rating (most trusted first)
 */
export function sortItemsByMode(items: CartItem[], mode: UrgencyMode): CartItem[] {
  return [...items].sort((a, b) => {
    if (mode === "fastest") {
      return a.eta - b.eta;
    }
    if (mode === "value") {
      return (a.price * a.quantity) - (b.price * b.quantity);
    }
    // trusted: highest rating first
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    // tiebreak: more reviews
    return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  });
}

/**
 * Get the top-ranked substitute for a given item and mode.
 * Used for display purposes (e.g. showing what would be selected).
 */
export function getTopSubstitute(item: CartItem, mode: UrgencyMode): Substitute | null {
  if (item.substitutes.length === 0) return null;
  const ranked = applyUrgencyMode([item], mode);
  return ranked[0]?.substitutes[0] ?? null;
}
