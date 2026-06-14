import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  cookingOil:   CDN("71SKKjG5WRL"),   // Fortune Sunflower Oil
  sunflower:    CDN("71LMFhI+uXL"),   // Saffola Gold Oil
  salt:         CDN("81yRcGk1LzL"),   // Tata Salt
  rice:         CDN("71I2X1KNABL"),   // India Gate Rice 5kg
  dal:          CDN("71MBrLFmEZL"),   // Toor Dal
  onion:        CDN("71VpOHiWqjL"),   // Onion 1kg
  tomato:       CDN("71qMen9PbXL"),   // Tomato 500g
  scrubber:     CDN("71T2pOFX2vL"),   // Scotch-Brite Scrubber
  dishSoap:     CDN("71LNHhH+uXL"),   // Vim Dishwash Liquid
  mop:          CDN("81yTcFk1LzL"),   // Scotch-Brite Mop
  bulb:         CDN("71SKMjI0WRL"),   // Wipro LED Bulb
  fuseWire:     CDN("61qOanBP9bXL"),  // Fuse Wire
  tape:         CDN("71vRHiWqiL"),    // Tesa Tape
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

// ─── Cooking Essentials ───────────────────────────────────────────

export const FORTUNE_SUNFLOWER_OIL = item(
  "hh_001", "Fortune Sunflower Refined Oil", "Adani Wilmar",
  "Edible Oils",
  135, 145, 1, "1 L",
  IMG.cookingOil,
  "B07WDHKP8L", 4.4, 56782,
  "Best Seller",
  "100% pure sunflower oil — light, healthy cooking oil with Vitamin E",
  "Essential cooking oil for daily meals", "Cooking essential", 14,
  [
    sub("hh_001_s1", "Saffola Gold Refined Oil", "Marico India",
      155, 169, "trusted", "Most Trusted", "Heart-healthy blend, doctor-recommended",
      14, IMG.sunflower, "B07XKHQT6Q", 4.5, 67234),
    sub("hh_001_s2", "Emami Healthy & Tasty Mustard Oil", "Emami Agrotech",
      89, 99, "cheapest", "Best Value", "₹46 cheaper, traditional mustard oil",
      12, IMG.cookingOil, "B07PQV6T6L", 4.2, 23456),
  ]
);

export const TATA_SALT = item(
  "hh_002", "Tata Salt Lite — Low Sodium", "Tata Consumer Products",
  "Sugar, Salt & Jaggery",
  28, 30, 1, "1 kg",
  IMG.salt,
  "B07XKHQM3Q", 4.6, 89234,
  "Best Seller",
  "Iodised low-sodium salt — 15% lower sodium than regular salt, same taste",
  "Basic cooking essential — ran out", "Cooking essential", 10,
  [
    sub("hh_002_s1", "Catch Iodized Salt", "DS Foods",
      22, 25, "cheapest", "Best Value", "₹6 cheaper, standard iodised salt",
      10, IMG.salt, "B07PQV4T8L", 4.4, 34521),
  ]
);

export const INDIA_GATE_RICE_5KG = item(
  "hh_003", "India Gate Classic Basmati Rice", "KRBL Limited",
  "Rice, Flours & Grains",
  335, 375, 1, "5 kg",
  IMG.rice,
  "B07WDHKP3Q", 4.4, 78923,
  "Best Seller",
  "Extra-long aged Basmati rice — aromatic, non-sticky grains for daily cooking",
  "Bulk rice for regular home cooking", "Staple grain", 18,
  [
    sub("hh_003_s1", "Daawat Rozana Basmati Rice 5kg", "LT Foods",
      295, 330, "cheapest", "Best Value", "₹40 cheaper, everyday basmati quality",
      16, IMG.rice, "B07PQV5T5L", 4.3, 45231),
  ]
);

export const TOOR_DAL_1KG = item(
  "hh_004", "Tata Sampann Unpolished Toor Dal", "Tata Consumer Products",
  "Dals & Pulses",
  155, 175, 1, "1 kg",
  IMG.dal,
  "B07XKHQT7Q", 4.4, 45672,
  "Amazon's Choice",
  "Unpolished split pigeon peas — higher protein retention, cooks faster",
  "Essential dal for daily dal-chawal", "Daily staple", 14,
  [
    sub("hh_004_s1", "24 Mantra Organic Toor Dal", "24 Mantra Organic",
      185, 210, "trusted", "Most Trusted", "Certified organic, pesticide-free",
      16, IMG.dal, "B08JKQD4P2", 4.5, 18923),
  ]
);

export const ONIONS_1KG = item(
  "hh_005", "Fresh Onions", "Amazon Fresh",
  "Fresh Fruits & Vegetables",
  45, 50, 1, "1 kg",
  IMG.onion,
  "B07XKHQE4P", 4.0, 5672,
  "Amazon Fresh",
  "Farm-fresh red onions — washed and sorted, ready to use",
  "Basic vegetable for any Indian cooking", "Vegetable essential", 18,
  []
);

export const TOMATOES_500G = item(
  "hh_006", "Fresh Tomatoes", "Amazon Fresh",
  "Fresh Fruits & Vegetables",
  30, 35, 1, "500 g",
  IMG.tomato,
  "B07XKHQE5P", 4.0, 4823,
  "Amazon Fresh",
  "Ripe, firm tomatoes — essential base for gravies, dals and chutneys",
  "Essential vegetable for Indian cooking", "Vegetable essential", 18,
  []
);

// ─── Home Repair / Maintenance ─────────────────────────────────────

export const WIPRO_LED_BULB = item(
  "hh_007", "Wipro Garnet 9W LED Bulb", "Wipro Lighting",
  "Light Bulbs",
  89, 99, 2, "pieces",
  IMG.bulb,
  "B07WDHKQ1L", 4.4, 34521,
  "Amazon's Choice",
  "9W = 75W equivalent, B22 base — warm white 3000K, 800 lumens, 2-year warranty",
  "Replace fused or broken bulb at home", "Repair essential", 14,
  [
    sub("hh_007_s1", "Philips LED Bulb 9W B22", "Philips India",
      99, 110, "trusted", "Most Trusted", "Industry benchmark for LED quality",
      14, IMG.bulb, "B07XKHQM4Q", 4.5, 56782),
    sub("hh_007_s2", "Syska LED Bulb 9W", "Syska Group",
      69, 79, "cheapest", "Best Value", "₹20 cheaper, same energy saving",
      12, IMG.bulb, "B07PQV7T4L", 4.2, 23456),
  ]
);

export const SCOTCH_TAPE = item(
  "hh_008", "3M Scotch Magic Tape", "3M India",
  "Adhesives & Tapes",
  55, 65, 1, "19mm × 33m",
  IMG.tape,
  "B07XKHQT2Q", 4.4, 18923,
  "Amazon's Choice",
  "Invisible matte finish tape — bonds instantly to paper and cardboard, clean tear",
  "Quick repair or craft taping need", "Repair tape", 12,
  [
    sub("hh_008_s1", "Tesa Universal Tape", "Tesa India",
      45, 55, "cheapest", "Best Value", "₹10 cheaper, same adhesive strength",
      10, IMG.tape, "B07PQV5T9L", 4.3, 12345),
  ]
);

// ─── Cleaning Supplies ────────────────────────────────────────────

export const VIM_DISHWASH = item(
  "hh_009", "Vim Dishwash Liquid", "Hindustan Unilever",
  "Cleaning & Household",
  79, 89, 1, "500 ml",
  IMG.dishSoap,
  "B07WDHKQ7L", 4.4, 45672,
  "Best Seller",
  "Active salt formula that cuts through tough grease — leaves no residue",
  "Essential for washing dishes after hosting", "Cleaning essential", 12,
  [
    sub("hh_009_s1", "Pril Lemon Dishwash Liquid", "Henkel India",
      65, 75, "cheapest", "Best Value", "₹14 cheaper, fresh lemon fragrance",
      10, IMG.dishSoap, "B07PQV6T7L", 4.3, 28934),
  ]
);
