import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  bisleri:       CDN("61LMoY3EYQL"),   // Bisleri 1L Water
  kinley:        CDN("71I2X0KNCBL"),   // Kinley Water
  evian:         CDN("71EFjHq5zGL"),   // Evian Natural Mineral Water
  tooyumm:       CDN("71lniJyDMjL"),   // Too Yumm Trail Mix
  yogabar:       CDN("81H5xDYFpjL"),   // Yoga Bar Oats & Berries
  snickers:      CDN("71LMFhG+uXL"),   // Snickers Bar
  dettol:        CDN("71SKKjG2WRL"),   // Dettol Hand Sanitizer
  purell:        CDN("81yPcGk1LzL"),   // Purell Hand Sanitizer
  syska:         CDN("61qNanBQ9bXL"),  // Syska Travel Charger
  ambrane:       CDN("71I3Y0KNABL"),   // Ambrane Charger
  anker:         CDN("71NBrKFmEZL"),   // Anker Travel Charger
  classmateNB:   CDN("81yScFk1LzL"),   // Classmate Notebook
  napkins:       CDN("71vPHiWqiL"),    // Tork Napkins
  torkNapkins:   CDN("71TORKNapkin"),  // Tork Napkins alt
};

function sub(
  id: string, name: string, brand: string,
  price: number, mrp: number,
  type: Substitute["type"], label: string, reason: string,
  eta: number, image: string,
  asin?: string, rating?: number, reviewCount?: number
): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(
  id: string, name: string, brand: string, category: string,
  price: number, mrp: number,
  qty: number, unit: string, image: string,
  asin: string, rating: number, reviewCount: number,
  badge: string, description: string,
  reason: string, reasonTag: string, eta: number,
  substitutes: Substitute[],
  isEssential = true, isAddon = false
): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return {
    id, name, brand, category, price, mrp, discount, quantity: qty, unit,
    image, asin, rating, reviewCount, badge, description,
    reason, reasonTag, eta, substitutes, isEssential, isAddon,
  };
}

// ─── Travel Essentials ─────────────────────────────────────────────

export const BISLERI_TRAVEL = item(
  "trv_001", "Bisleri Mineral Water", "Bisleri International",
  "Water & Juices",
  22, 22, 2, "1 L each",
  IMG.bisleri,
  "B07XKHQT9P", 4.4, 45231,
  "Best Seller",
  "Purified and mineralised drinking water — 7-stage filtration, ISI certified",
  "Essential hydration for journey", "Travel essential", 10,
  [
    sub("trv_001_s1", "Kinley Packaged Drinking Water", "Coca-Cola India",
      20, 20, "fastest", "Fastest", "8 min ETA, widely available across stores",
      8, IMG.kinley, "B07WDKH8TR", 4.3, 29456),
    sub("trv_001_s2", "Evian Natural Spring Water", "Evian",
      120, 130, "trusted", "Premium Pick", "Natural Alpine spring water, imported",
      14, IMG.evian, "B08PQV9T4L", 4.6, 12341),
  ]
);

export const TOOYUMM_TRAIL_MIX = item(
  "trv_002", "Too Yumm! Multigrain Crisps Trail Pack", "RP-Sanjiv Goenka Group",
  "Namkeen & Snacks",
  65, 75, 2, "60 g each",
  IMG.tooyumm,
  "B07PQV3T6L", 4.1, 18234,
  "Amazon's Choice",
  "Baked not fried multigrain crisps — 40% less fat, great for on-the-go snacking",
  "Healthy travel snack to avoid airport prices", "Travel snack", 12,
  []
);

export const YOGA_BAR_TRAVEL = item(
  "trv_003", "Yoga Bar Oats & Berries Energy Bar", "ITC Limited",
  "Health Foods & Diet",
  55, 65, 3, "38 g each",
  IMG.yogabar,
  "B07XKHQM9P", 4.3, 34521,
  "Amazon's Choice",
  "Real oats, nuts and dried berries — 10g protein per bar, no artificial flavours",
  "Quick energy boost during long journeys", "Energy boost", 12,
  [
    sub("trv_003_s1", "Snickers Original Chocolate Bar", "Mars India",
      50, 55, "cheapest", "Best Value", "₹5 cheaper, quick glucose for energy",
      10, IMG.snickers, "B07PQ9V5RL", 4.4, 67234),
  ]
);

export const DETTOL_SANITIZER = item(
  "trv_004", "Dettol Instant Hand Sanitizer Original", "Reckitt Benckiser India",
  "Health & Personal Care",
  79, 89, 1, "100 ml",
  IMG.dettol,
  "B07QPVK4NT", 4.5, 89234,
  "Best Seller",
  "WHO-recommended 70% v/v alcohol formula — kills 99.9% germs without water",
  "Hygiene essential for travel", "Travel hygiene", 12,
  [
    sub("trv_004_s1", "Purell Advanced Hand Sanitizer", "GOJO Industries",
      99, 115, "trusted", "Most Trusted", "Hospital-grade formula, skin-conditioning",
      12, IMG.purell, "B08JKQ8D3P", 4.6, 34521),
  ]
);

export const SYSKA_TRAVEL_CHARGER = item(
  "trv_005", "Syska 20W Fast Charger with USB-C Cable", "Syska",
  "Mobile Accessories",
  349, 399, 1, "piece",
  IMG.syska,
  "B07WDKH5QL", 4.3, 28934,
  "Amazon's Choice",
  "20W USB-C PD fast charger with 1m braided cable — compact, travel-friendly design",
  "Keep devices charged during transit", "Device power", 20,
  [
    sub("trv_005_s1", "Ambrane 20W USB-C Charger", "Ambrane India",
      279, 349, "cheapest", "Best Value", "₹70 cheaper, same 20W fast charging",
      18, IMG.ambrane, "B08JKQD6P3", 4.2, 18923),
    sub("trv_005_s2", "Anker Nano 20W USB-C Charger", "Anker",
      899, 999, "trusted", "Most Trusted", "Ultra-compact with PowerIQ 3.0 technology",
      20, IMG.anker, "B08TQR9KQL", 4.7, 67234),
  ]
);

export const CLASSMATE_NOTEBOOK_TRAVEL = item(
  "trv_006", "Classmate Pulse Hardcover Notebook", "ITC Limited",
  "Office & Stationery Supplies",
  45, 52, 1, "160 pages",
  IMG.classmateNB,
  "B07XKHQM6P", 4.4, 34521,
  "Amazon's Choice",
  "Hard cover spiral notebook with smooth 70 GSM pages — great for travel journalling",
  "Jot notes or entertain during travel", "Travel companion", 14,
  [], false, true
);
