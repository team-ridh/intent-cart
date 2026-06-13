// ─── Core domain types ───────────────────────────────────────────

export type UrgencyMode = "fastest" | "value" | "trusted";

export type Scenario =
  | "hosting"
  | "fever"
  | "pooja"
  | "rainy"
  | "travel"
  | "power_cut"
  | "school"
  | "tea_break"
  | "general";

export interface ParsedIntent {
  scenario: Scenario;
  scenarioLabel: string;
  urgency: "High" | "Medium" | "Low";
  category: string;
  confidence: number;
  summary: string;
  deliveryMode: string;
  suggestedItems: string[];
  usedBedrock: boolean;
}

export interface Substitute {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: "best" | "fastest" | "cheapest" | "trusted";
  label: string;
  reason: string;
  eta: number; // minutes
  image: string;
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  reason: string;
  reasonTag: string;
  eta: number; // minutes
  substitutes: Substitute[];
  isEssential: boolean;
  isAddon: boolean;
}

export interface GeneratedCart {
  items: CartItem[];
  totalPrice: number;
  estimatedEta: number; // minutes
  itemCount: number;
  summaryLine: string;
  intent: ParsedIntent;
}
