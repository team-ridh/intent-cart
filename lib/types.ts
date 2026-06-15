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
  | "general"
  | "cooking"
  | "home_repair"
  | "gifting"
  | "electronics"
  | "baby_care"
  | "personal_care"
  | "party"
  | "pet_care"
  | "fitness"
  | "cleaning"
  // ─── Phase 2 & 3 new categories ────────────────────────────
  | "breakfast"
  | "dairy"
  | "frozen_food"
  | "condiments"
  | "snacks"
  | "staples"
  | "skincare"
  | "pest_control"
  | "instant_food"
  | "office";

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
  // ─── Cross-scenario blending ──────────────────────────────
  secondaryScenario?: Scenario;        // optional second intent
  secondaryConfidence?: number;        // 0-100, only set when ≥ 30
}

export interface Substitute {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp?: number;           // original MRP for showing discount
  discount?: number;      // % off
  type: "best" | "fastest" | "cheapest" | "trusted";
  label: string;
  reason: string;
  eta: number; // minutes
  image: string;
  asin?: string;          // Amazon Standard Identification Number
  rating?: number;        // e.g. 4.3
  reviewCount?: number;   // e.g. 12847
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;           // original MRP (shown as ~~strikethrough~~)
  discount?: number;      // % off from MRP
  quantity: number;
  unit: string;
  image: string;
  asin?: string;          // Amazon Standard Identification Number e.g. "B07GNHK45P"
  rating?: number;        // star rating e.g. 4.4
  reviewCount?: number;   // number of reviews e.g. 58234
  badge?: string;         // "Best Seller" | "Amazon's Choice" | "#1 in category"
  description?: string;   // short product description
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

// ─── Session stored in DynamoDB ──────────────────────────────────

export type SessionStatus = "active" | "confirmed";

export interface Session {
  sessionId: string;
  situationText: string;
  photoS3Key?: string;
  intent?: ParsedIntent;
  cart?: GeneratedCart;
  urgencyMode: UrgencyMode;
  selectedSubstitutes: Record<string, string>;
  status: SessionStatus;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  expiresAt: number; // epoch seconds — DynamoDB TTL
}

// ─── S3 upload info ──────────────────────────────────────────────

export interface PresignedUploadResult {
  presignedUrl: string;
  s3Key: string;
  publicUrl: string;
}
