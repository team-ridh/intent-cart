import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  dolo650:       CDN("61qKanBPdXL"),   // Dolo 650 Paracetamol strip
  crocin:        CDN("71T2pMFW2vL"),   // Crocin Advance 500mg
  calpol:        CDN("71vOHiVqiL"),    // Calpol 500 Paracetamol
  vicks:         CDN("71SKKjG0WRL"),   // Vicks VapoRub 25g
  kleenex:       CDN("81lniJyDSjL"),   // Kleenex Tissues
  puffs:         CDN("71UMK6VPjTL"),   // P&G Puffs Tissues
  electral:      CDN("71I2X0KNABL"),   // Electral ORS Sachets
  glucose:       CDN("71MBrJFmEZL"),   // Glucon-D Glucose Powder
  knorrChicken:  CDN("71VqOHiVqjL"),   // Knorr Chicken Soup
  chingsSoup:    CDN("71EFjHq5xGL"),   // Ching's Manchow Soup
  dabur:         CDN("71qKan9PbXL"),   // Dabur Honey
  vitamin:       CDN("71h5xDYFpjL"),   // Limcee Vitamin C
  betadine:      CDN("61UMK8VRiTL"),   // Betadine Antiseptic
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

// ─── Medicines & Health ────────────────────────────────────────────

export const DOLO_650 = item(
  "med_001", "Dolo 650 Paracetamol Tablets", "Micro Labs",
  "Health & Personal Care",
  34, 34, 2, "strip of 15",
  IMG.dolo650,
  "B08JKQD2P1", 4.6, 78234,
  "Amazon's Choice",
  "Paracetamol 650mg — trusted fever and pain relief, NPPA price-controlled",
  "Primary fever and pain relief medication", "Fever relief", 10,
  [
    sub("med_001_s1", "Calpol 500 Tablet", "GlaxoSmithKline",
      26, 26, "fastest", "Fastest", "Readily available at nearest pharmacy store",
      8, IMG.calpol, "B07WDHKP3L", 4.4, 45231),
    sub("med_001_s2", "Crocin Advance 500mg", "GlaxoSmithKline",
      19, 19, "trusted", "Most Trusted", "Doctor's most recommended paracetamol brand",
      10, IMG.crocin, "B07PQ9T3RL", 4.5, 89234),
  ]
);

export const VICKS_VAPORUB = item(
  "med_002", "Vicks VapoRub Cough Suppressant", "Procter & Gamble",
  "Health & Personal Care",
  94, 100, 1, "25 g",
  IMG.vicks,
  "B07QPVK3NT", 4.6, 123456,
  "Best Seller",
  "Medicated chest, throat & back rub for symptomatic relief of cold & cough",
  "Chest rub for cold and congestion relief", "Congestion relief", 10,
  []
);

export const KLEENEX_TISSUES = item(
  "med_003", "Kleenex Ultra Soft Facial Tissues", "Kimberly-Clark",
  "Tissues & Paper Products",
  55, 65, 2, "100 sheets each",
  IMG.kleenex,
  "B07XKHQT6P", 4.4, 34521,
  "Amazon's Choice",
  "3-ply ultra-soft tissues gentle enough for sensitive skin — moisturising lotion infused",
  "Hygienic option for frequent nose blowing", "Hygiene essential", 10,
  [
    sub("med_003_s1", "Puffs Plus Lotion Tissues", "Procter & Gamble",
      62, 70, "trusted", "Most Trusted", "Extra soft with lotion, gentler on skin",
      12, IMG.puffs, "B08TQR9KPL", 4.5, 28934),
  ]
);

export const ELECTRAL_ORS = item(
  "med_004", "Electral ORS Powder Sachets", "Franco-Indian Pharmaceuticals",
  "Health & Personal Care",
  52, 55, 5, "21 g sachets",
  IMG.electral,
  "B07VPHK9QR", 4.5, 45672,
  "Best Seller",
  "WHO-approved oral rehydration salts — replaces electrolytes lost during fever & diarrhoea",
  "Electrolyte replacement to prevent dehydration", "Hydration", 10,
  [
    sub("med_004_s1", "Glucon-D Orange Glucose Powder", "Heinz India",
      65, 72, "trusted", "Most Trusted", "Instant glucose energy + Vitamin C",
      12, IMG.glucose, "B07WDK4Q9R", 4.3, 28923),
  ]
);

export const DABUR_HONEY_MED = item(
  "med_005", "Dabur Honey 100% Pure", "Dabur India",
  "Honey, Jams & Sweet Spreads",
  145, 165, 1, "250 g",
  IMG.dabur,
  "B07QPVK5NT", 4.4, 78234,
  "Amazon's Choice",
  "NMR-tested pure honey — proven antibacterial properties for sore throat relief",
  "Natural sore throat remedy", "Natural remedy", 12,
  [], false, true
);

export const LIMCEE_VITAMIN_C = item(
  "med_006", "Limcee Vitamin C 500mg Chewable Tablets", "Abbott India",
  "Health & Personal Care",
  55, 60, 1, "strip of 15",
  IMG.vitamin,
  "B07XKH4T9P", 4.4, 34521,
  "Amazon's Choice",
  "Chewable Vitamin C tablets for immunity support — orange flavoured",
  "Vitamin C boost and natural immunity support", "Immunity boost", 15,
  [], false, true
);
