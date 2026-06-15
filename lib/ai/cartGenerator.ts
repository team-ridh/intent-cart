import type { CartItem, GeneratedCart, ParsedIntent, Scenario, UrgencyMode } from "../types";
import { SCENARIO_CARTS } from "../data/scenarios";
import { SCENARIO_META } from "../ai/intentParser";
import { applyUrgencyMode, sortItemsByMode, computeAutoSelections } from "./substituteRanker";

/**
 * Boost items whose name or reasonTag matches any of the AI-suggested item names.
 * Matching items are moved to the front of the list, preserving relative order within each group.
 * Matching is case-insensitive substring (e.g. "Paracetamol" matches "Dolo 650 Paracetamol Tablets").
 */
function boostBySuggestedItems(items: CartItem[], suggestedItems: string[]): CartItem[] {
  if (!suggestedItems || suggestedItems.length === 0) return items;
  const normalized = suggestedItems.map((s) => s.toLowerCase().trim());

  // Bidirectional substring only: item name contains the suggestion, or suggestion
  // contains the item name, or the reasonTag/category matches.
  // The previous first-word check (s.includes(item.name.split(" ")[0])) was too
  // aggressive — short first words like "Oil", "Milk", "Tea" produced false boosts.
  const matches = items.filter((item) =>
    normalized.some(
      (s) =>
        item.name.toLowerCase().includes(s) ||
        s.includes(item.name.toLowerCase()) ||
        item.reasonTag.toLowerCase().includes(s)
    )
  );
  const rest = items.filter((item) => !matches.includes(item));
  return [...matches, ...rest];
}

/**
 * Merge top essential items from a secondary scenario into the primary cart.
 * Takes up to `maxItems` essential items from the secondary that aren't
 * already covered (by name/category) in the primary list.
 * Secondary items are appended at the end as add-ons.
 */
function mergeSecondaryScenario(
  primaryItems: CartItem[],
  secondaryScenario: Scenario,
  maxItems: number = 2
): CartItem[] {
  const secondaryRaw = SCENARIO_CARTS[secondaryScenario] ?? [];
  const primaryNames = new Set(primaryItems.map((i) => i.name.toLowerCase()));
  const primaryCategories = new Set(primaryItems.map((i) => i.category.toLowerCase()));

  const scenarioLabel = SCENARIO_META[secondaryScenario]?.scenarioLabel ?? secondaryScenario;

  const candidates = secondaryRaw
    .filter((item) => item.isEssential)
    .filter((item) => !primaryNames.has(item.name.toLowerCase()))
    .filter((item) => !primaryCategories.has(item.category.toLowerCase()))
    .slice(0, maxItems)
    .map((item) => ({
      ...item,
      // Re-id to avoid collisions
      id: `blend_${item.id}`,
      isAddon: true,
      reasonTag: `Also for ${scenarioLabel}`,
    }));

  return [...primaryItems, ...candidates];
}

// ─── Generate cart from intent ────────────────────────────────────────────────
export function generateCart(
  intent: ParsedIntent,
  mode: UrgencyMode = "fastest"
): GeneratedCart {
  const rawItems: CartItem[] = SCENARIO_CARTS[intent.scenario] ?? SCENARIO_CARTS.general;

  // Boost primary items first — secondary items must not receive this boost
  const boostedItems = boostBySuggestedItems(rawItems, intent.suggestedItems ?? []);

  // Blend secondary scenario items AFTER boosting so they don't inherit the
  // primary's suggested-item boost (Improvement 3 fix)
  const mergedItems = (intent.secondaryScenario && (intent.secondaryConfidence ?? 0) >= 35)
    ? mergeSecondaryScenario(boostedItems, intent.secondaryScenario, 2)
    : boostedItems;

  // Apply urgency-based ETA multiplier (affects initial ETA at generation time only)
  const etaMultiplier = mode === "fastest" ? 1.0 : mode === "value" ? 1.2 : 1.1;
  const itemsWithEta = mergedItems.map((i) => ({
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

  const summaryLine = buildSummaryLine(intent, sortedItems.length, essentialCount, estimatedEta, mode);

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
  eta: number,
  mode: UrgencyMode
): string {
  // Use the user-facing mode label rather than the scenario's inherent urgency.
  // This way the summary updates correctly when the user switches modes.
  const modeStr =
    mode === "fastest"
      ? "fastest delivery"
      : mode === "value"
      ? "best value"
      : "most trusted";

  return `${total} items · ${modeStr} · ${intent.scenarioLabel.toLowerCase()} · ready in ~${eta} min`;
}
