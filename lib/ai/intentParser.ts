import type { ParsedIntent, Scenario } from "../types";

// ─── Keyword → scenario mapping (deterministic fallback) ─────────
const KEYWORD_MAP: Array<{ keywords: string[]; scenario: Scenario }> = [
  {
    keywords: ["guest","guests","visitor","visitors","hosting","party","host","arrival","arriving","come over","company","gathering","people coming","invite"],
    scenario: "hosting",
  },
  {
    keywords: ["fever","sick","ill","medicine","cold","cough","throat","headache","temperature","flu","viral","infection","unwell","doctor","health"],
    scenario: "fever",
  },
  {
    keywords: ["pooja","puja","prayer","worship","ritual","diya","aarti","festival","temple","prasad","hawan","navratri","diwali","ganesh","puja items"],
    scenario: "pooja",
  },
  {
    keywords: ["rain","raining","rainy","monsoon","wet","storm","thunder","drizzle","cloudy","umbrella","indoors","inside"],
    scenario: "rainy",
  },
  {
    keywords: ["travel","journey","trip","flight","train","bus","airport","station","pack","luggage","suitcase","holiday","vacation","leaving"],
    scenario: "travel",
  },
  {
    keywords: ["power cut","powercut","outage","electricity","blackout","no power","no light","dark","generator","inverter"],
    scenario: "power_cut",
  },
  {
    keywords: ["school","project","homework","assignment","stationery","craft","drawing","study","exam","class","teacher","deadline"],
    scenario: "school",
  },
  {
    keywords: ["tea","chai","coffee","break","snack time","evening snack","tea time","afternoon","break time"],
    scenario: "tea_break",
  },
];

const SCENARIO_META: Record<Scenario, Omit<ParsedIntent, "confidence" | "usedBedrock">> = {
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
};

// ─── Local keyword-based detection ───────────────────────────────
function detectScenarioLocally(input: string): { scenario: Scenario; confidence: number } {
  const lower = input.toLowerCase();
  let bestScenario: Scenario = "general";
  let bestScore = 0;

  for (const { keywords, scenario } of KEYWORD_MAP) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(" ").length > 1 ? 2 : 1;
    }
    if (score > bestScore) { bestScore = score; bestScenario = scenario; }
  }

  const confidence = bestScore === 0 ? 72 : Math.min(95, 75 + bestScore * 5);
  return { scenario: bestScenario, confidence };
}

// ─── Main entry point ─────────────────────────────────────────────
// Tries Bedrock first; falls back to local detection
export async function parseIntent(input: string): Promise<ParsedIntent> {
  // 1. Try Bedrock via API route
  try {
    const res = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.intent) return data.intent as ParsedIntent;
    }
  } catch {
    // Bedrock unavailable — fall through to local
  }

  // 2. Deterministic local fallback
  const { scenario, confidence } = detectScenarioLocally(input);
  const meta = SCENARIO_META[scenario];
  return { ...meta, confidence, usedBedrock: false };
}

// Direct local parse (no Bedrock round-trip) — used server-side
export function parseIntentLocal(input: string): ParsedIntent {
  const { scenario, confidence } = detectScenarioLocally(input);
  const meta = SCENARIO_META[scenario];
  return { ...meta, confidence, usedBedrock: false };
}

export { SCENARIO_META };
