import type { GeneratedCart, ParsedIntent, Scenario } from "../types";

// ─── Scenario metadata (used server-side to validate Bedrock response) ───
export const SCENARIO_META: Record<
  Scenario,
  Omit<ParsedIntent, "confidence" | "usedBedrock">
> = {
  hosting: {
    scenario: "hosting",
    scenarioLabel: "Hosting",
    urgency: "High",
    category: "Food & Beverage",
    summary: "Quick snack and beverage setup for guests",
    deliveryMode: "fastest",
    suggestedItems: ["Tea", "Milk", "Snacks", "Paper Cups", "Napkins"],
  },
  fever: {
    scenario: "fever",
    scenarioLabel: "Fever Care",
    urgency: "High",
    category: "Health & Medicine",
    summary: "Fever relief and recovery essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Paracetamol", "ORS", "Tissues", "Soup", "Honey"],
  },
  pooja: {
    scenario: "pooja",
    scenarioLabel: "Pooja Essentials",
    urgency: "Medium",
    category: "Religious & Spiritual",
    summary: "Ritual items and fresh offerings for pooja",
    deliveryMode: "fastest",
    suggestedItems: ["Agarbatti", "Camphor", "Flowers", "Coconut", "Ghee"],
  },
  rainy: {
    scenario: "rainy",
    scenarioLabel: "Rainy Day",
    urgency: "Medium",
    category: "Comfort & Food",
    summary: "Warm food and comfort essentials for a rainy day",
    deliveryMode: "fastest",
    suggestedItems: ["Hot Chocolate", "Maggi", "Bread", "Eggs", "Candles"],
  },
  travel: {
    scenario: "travel",
    scenarioLabel: "Travel Prep",
    urgency: "High",
    category: "Travel Essentials",
    summary: "Travel kit with snacks, hydration and essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Water", "Snacks", "Sanitizer", "Charger", "Energy Bar"],
  },
  power_cut: {
    scenario: "power_cut",
    scenarioLabel: "Power Cut",
    urgency: "High",
    category: "Emergency",
    summary: "Emergency lighting and backup power essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Torch", "Batteries", "Candles", "Matchbox", "Power Bank"],
  },
  school: {
    scenario: "school",
    scenarioLabel: "School Project",
    urgency: "High",
    category: "Stationery & Craft",
    summary: "Project materials and stationery for school deadline",
    deliveryMode: "fastest",
    suggestedItems: ["Pencils", "Notebook", "Colour Pencils", "Fevicol", "Scissors"],
  },
  tea_break: {
    scenario: "tea_break",
    scenarioLabel: "Tea Break",
    urgency: "Low",
    category: "Beverages & Snacks",
    summary: "Quick tea setup with snacks for a relaxing break",
    deliveryMode: "value",
    suggestedItems: ["Tea Bags", "Milk", "Biscuits", "Namkeen"],
  },
  general: {
    scenario: "general",
    scenarioLabel: "General Shopping",
    urgency: "Low",
    category: "Essentials",
    summary: "Common everyday household essentials",
    deliveryMode: "value",
    suggestedItems: ["Water", "Bread", "Milk", "Eggs"],
  },
  cooking: {
    scenario: "cooking",
    scenarioLabel: "Cooking Essentials",
    urgency: "Medium",
    category: "Groceries",
    summary: "Essential ingredients for daily home cooking",
    deliveryMode: "fastest",
    suggestedItems: ["Oil", "Salt", "Onions", "Tomatoes", "Dal", "Rice"],
  },
  home_repair: {
    scenario: "home_repair",
    scenarioLabel: "Home Repair",
    urgency: "Medium",
    category: "Home Improvement",
    summary: "Quick fix for broken items at home",
    deliveryMode: "fastest",
    suggestedItems: ["LED Bulb", "Tape", "Screwdriver", "Fuse", "Glue"],
  },
};

// ─── Client-side intent parse via Bedrock API route ──────────────
// Throws on any error — no silent fallback.
// Returns intent, the server-generated cart, and initial substitute selections.
export async function parseIntent(input: string, photoS3Key?: string): Promise<{
  intent: ParsedIntent;
  cart: GeneratedCart;
  initialSelections: Record<string, string>;
}> {
  const res = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, photoS3Key }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(
      `Intent parsing failed (${res.status}): ${body.error ?? "Unknown error"}`
    );
  }

  const data = await res.json();
  return {
    intent: data.intent as ParsedIntent,
    cart: data.cart as GeneratedCart,
    initialSelections: (data.initialSelections ?? {}) as Record<string, string>,
  };
}
