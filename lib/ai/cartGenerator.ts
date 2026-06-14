import type { CartItem, GeneratedCart, ParsedIntent, UrgencyMode } from "../types";
import { SCENARIO_CARTS } from "../mockProducts";
import { applyUrgencyMode, sortItemsByMode, computeAutoSelections } from "./substituteRanker";

// ─── Generate cart from intent ────────────────────────────────────────────────
export function generateCart(
  intent: ParsedIntent,
  mode: UrgencyMode = "fastest"
): GeneratedCart {
  const rawItems: CartItem[] = SCENARIO_CARTS[intent.scenario] ?? SCENARIO_CARTS.general;

  // Apply urgency-based ETA multiplier (affects initial ETA at generation time only)
  const etaMultiplier = mode === "fastest" ? 1.0 : mode === "value" ? 1.2 : 1.1;
  const itemsWithEta = rawItems.map((i) => ({
    ...i,
    eta: Math.round(i.eta * etaMultiplier),
  }));

  // Re-sort substitutes drawer by mode
  const rankedItems = applyUrgencyMode(itemsWithEta, mode);

  // Sort cart items themselves by mode metric
  const sortedItems = sortItemsByMode(rankedItems, mode);

  const totalPrice = sortedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estimatedEta = sortedItems.length > 0 ? Math.max(...sortedItems.map((i) => i.eta)) : 0;
  const essentialCount = sortedItems.filter((i) => i.isEssential).length;

  const summaryLine = buildSummaryLine(intent, sortedItems.length, essentialCount, estimatedEta);

  return {
    items: sortedItems,
    totalPrice,
    estimatedEta,
    itemCount: sortedItems.length,
    summaryLine,
    intent,
  };
}

/**
 * Generate the initial auto-selected substitutes for a given cart + mode.
 * Called after cart generation to pre-select the best substitute per item.
 */
export function generateInitialSelections(
  items: CartItem[],
  mode: UrgencyMode
): Record<string, string> {
  return computeAutoSelections(items, mode);
}

function buildSummaryLine(
  intent: ParsedIntent,
  total: number,
  essential: number,
  eta: number
): string {
  const urgencyStr =
    intent.urgency === "High"
      ? "urgent"
      : intent.urgency === "Medium"
      ? "time-sensitive"
      : "relaxed";

  return `${total} items curated for your ${urgencyStr} ${intent.scenarioLabel.toLowerCase()} need · arrives in ~${eta} min`;
}
