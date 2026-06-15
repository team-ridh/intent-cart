import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  evereadyTorch: CDN("71T2pNFX2vL"),   // Eveready DL96 LED Torch
  philipsTorch:  CDN("71LNFhH+uXL"),   // Philips LED Torch
  genericTorch:  CDN("410MMqs2qiL"),   // Generic torch
  duracellAA:    CDN("81yPcFk2L0L"),   // Duracell AA Batteries
  energizerAA:   CDN("71c7-qB2jJL"),   // Energizer AA Batteries
  evereadyAA:    CDN("71V7PL+pmtL"),   // Eveready AA Batteries
  candle:        CDN("71vPHiWqiL"),    // Paraffin Wax Candles
  havellsCandle: CDN("71EGjHq6xGL"),   // Havells Emergency Candles
  matchbox:      CDN("81I5xEYFpjL"),   // Vivek Matchbox
  miPowerbank:   CDN("71lVwl3q-kL"),   // Mi Power Bank 3i 20000mAh
  ambrane:       CDN("71lVwl3q-kL"),   // Ambrane 20000mAh
  anker:         CDN("71RPezJmI0L"),   // Anker PowerCore
  bisleriLarge:  CDN("71VpPHiVqjL"),   // Bisleri 2L Water
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

// ─── Emergency & Power Cut Products ───────────────────────────────

export const EVEREADY_TORCH = item(
  "emer_001", "Eveready DL96 LED Torch", "Eveready Industries",
  "Torches & Flashlights",
  215, 249, 1, "piece",
  IMG.evereadyTorch,
  "B07WDHKN5L", 4.3, 28934,
  "Amazon's Choice",
  "10m beam range LED torch with 3AA batteries included — 6-hour continuous use",
  "Immediate lighting during power outage", "Emergency light", 14,
  [
    sub("emer_001_s1", "Philips LED Torch SFL1000P", "Philips India",
      265, 299, "trusted", "Most Trusted", "Brighter 50m beam, premium build quality",
      14, IMG.philipsTorch, "B07XKHQT9P", 4.5, 34521),
    sub("emer_001_s2", "Eveready 3W LED Torch (Basic)", "Eveready Industries",
      149, 175, "cheapest", "Best Value", "₹66 cheaper, same brand reliability",
      12, IMG.genericTorch, "B07PQV5T3L", 4.1, 18234),
  ]
);

export const DURACELL_AA_BATTERIES = item(
  "emer_002", "Duracell Alkaline AA Batteries", "Duracell India",
  "Batteries",
  145, 160, 1, "pack of 4",
  IMG.duracellAA,
  "B07XKHQM8P", 4.6, 89234,
  "Best Seller",
  "10-year storage life, guaranteed leak-proof — powers torches and remotes reliably",
  "Power source for torches and devices", "Battery backup", 14,
  [
    sub("emer_002_s1", "Energizer MAX AA Batteries", "Energizer India",
      129, 145, "trusted", "Most Trusted", "40% more power than standard alkaline",
      14, IMG.energizerAA, "B07WDK3H9R", 4.5, 45672),
    sub("emer_002_s2", "Eveready AA Batteries (10 pack)", "Eveready Industries",
      85, 99, "cheapest", "Best Value", "₹60 cheaper for 10 pcs — great stock-up value",
      12, IMG.evereadyAA, "B07PQV4T6L", 4.2, 34521),
  ]
);

export const PARAFFIN_CANDLES = item(
  "emer_003", "Homelite Paraffin Emergency Candles", "Homelite",
  "Home & Festival Candles",
  49, 55, 3, "packs",
  IMG.candle,
  "B07XKHQE7P", 4.2, 12345,
  "",
  "6-hour burn time per candle — smokeless, dripless paraffin wax for extended outages",
  "Ambient backup lighting for extended outages", "Ambient light", 12,
  [
    sub("emer_003_s1", "Havells LED Emergency Candle", "Havells India",
      199, 249, "trusted", "Most Trusted", "Rechargeable LED candle — 8hr battery life",
      16, IMG.havellsCandle, "B08TQRK3PL", 4.4, 9234),
  ]
);

export const MATCHBOX = item(
  "emer_004", "Vivek Wax Matchbox", "Wimco Limited",
  "Lighters & Matchboxes",
  15, 18, 2, "boxes of 50 sticks",
  IMG.matchbox,
  "B07WDKH3TR", 4.3, 8923,
  "",
  "Safety matchbox with 50 wax sticks — weather-resistant, reliable fire starter",
  "Fire starter for candles and emergency use", "Fire starter", 12,
  [
    sub("emer_004_s1", "Aim Safety Matchbox", "Wimco Limited",
      12, 15, "fastest", "Fastest", "Lighter pack, fastest available at nearby kirana stores",
      8, IMG.matchbox, "B07WDKH4TR", 4.2, 5678),
    sub("emer_004_s2", "Onida Safety Lighter", "Onida India",
      35, 40, "trusted", "Most Trusted", "Refillable gas lighter, more reliable than matchbox in humid conditions",
      12, IMG.matchbox, "B07PQV4T5L", 4.4, 12345),
  ]
);

export const MI_POWERBANK_20000 = item(
  "emer_005", "Mi Power Bank 3i 20000mAh", "Xiaomi India",
  "Mobile Accessories",
  1299, 1499, 1, "piece",
  IMG.miPowerbank,
  "B07XKHQT3P", 4.4, 145231,
  "Best Seller",
  "20000mAh with 18W fast charging — charges phone 4–5 times, dual USB output",
  "Keep mobile charged during extended outage", "Phone backup", 18,
  [
    sub("emer_005_s1", "Ambrane 20000mAh Power Bank", "Ambrane India",
      899, 1199, "cheapest", "Best Value", "₹400 cheaper, 20W fast charging",
      16, IMG.ambrane, "B08JKQD5P2", 4.3, 67234),
    sub("emer_005_s2", "Anker PowerCore 20100mAh", "Anker",
      2299, 2799, "trusted", "Most Trusted", "Ultra-compact premium build, 3 USB ports",
      20, IMG.anker, "B08TQRK8PL", 4.6, 89234),
  ]
);

export const BISLERI_2L = item(
  "emer_006", "Bisleri Mineral Water", "Bisleri International",
  "Water & Juices",
  65, 65, 2, "2 L each",
  IMG.bisleriLarge,
  "B07XKHQT8P", 4.4, 23456,
  "Best Seller",
  "Large 2L bottle — stock up when the water pump may fail during an outage",
  "Stock water in case pump fails", "Water backup", 12,
  [
    sub("emer_006_s1", "Kinley Packaged Drinking Water 2L", "Coca-Cola India",
      55, 55, "cheapest", "Best Value", "₹10 cheaper for 2L, widely available",
      10, IMG.bisleriLarge, "B07WDKH9TR", 4.3, 18923),
    sub("emer_006_s2", "Aquafina Drinking Water 2L", "PepsiCo India",
      58, 58, "fastest", "Fastest", "Fastest available 2L stock, same safety standards",
      8, IMG.bisleriLarge, "B07PQV5T2L", 4.3, 14567),
  ]
);
