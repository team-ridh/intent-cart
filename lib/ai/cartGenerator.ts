import type { CartItem, GeneratedCart, ParsedIntent, UrgencyMode } from "../types";
import { SCENARIO_CARTS } from "../mockProducts";

// ─── Apply urgency mode ordering ──────────────────────────────────
export function applyUrgencyMode(items: CartItem[], mode: UrgencyMode): CartItem[] {
  return items.map((item) => {
    const subs = [...item.substitutes];
    if (mode === "fastest") {
      subs.sort((a, b) => a.eta - b.eta);
    } else if (mode === "value") {
      subs.sort((a, b) => a.price - b.price);
    } else {
      // trusted: prefer "trusted" type first
      subs.sort((a) => (a.type === "trusted" ? -1 : 1));
    }
    return { ...item, substitutes: subs };
  });
}

// ─── Generate cart from intent ────────────────────────────────────
export function generateCart(
  intent: ParsedIntent,
  mode: UrgencyMode = "fastest"
): GeneratedCart {
  const rawItems = SCENARIO_CARTS[intent.scenario] ?? SCENARIO_CARTS.general;

  // Apply urgency-based ETA adjustment
  const etaMultiplier = mode === "fastest" ? 1 : mode === "value" ? 1.2 : 1.1;
  const items = applyUrgencyMode(
    rawItems.map((i) => ({ ...i, eta: Math.round(i.eta * etaMultiplier) })),
    mode
  );

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estimatedEta = Math.max(...items.map((i) => i.eta));
  const essentialCount = items.filter((i) => i.isEssential).length;

  const summaryLine = buildSummaryLine(intent, items.length, essentialCount, estimatedEta);

  return { items, totalPrice, estimatedEta, itemCount: items.length, summaryLine, intent };
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
