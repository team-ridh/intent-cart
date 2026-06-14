import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  cycle:         CDN("71T2pMFX2vL"),   // Cycle 3-in-1 Agarbatti
  hem:           CDN("71LMFhH+uXL"),   // HEM Lavender Agarbatti
  moksh:         CDN("81yQcFk1LzL"),   // Moksh Premium Agarbatti
  mangaldeep:    CDN("71SKKjH0WRL"),   // Mangaldeep Camphor
  camphor:       CDN("61qKanBQdXL"),   // Shudh Plus Camphor Tablets
  marigold:      CDN("71vOHiWqiL"),    // Fresh Marigold Flowers
  rose:          CDN("71EFjHq6xGL"),   // Rose Petals Garland
  coconut:       CDN("81H5xEYFpjL"),   // Coconut Pooja Pack
  amulGhee:      CDN("61UML6VPiTL"),   // Amul Pure Ghee
  patanjali:     CDN("71I3X0KNABL"),   // Patanjali Cow Ghee
  indiaGate:     CDN("71MBrKFmEZL"),   // India Gate Basmati Rice
  everest:       CDN("71VpOHiVqjL"),   // Everest Haldi Powder
  kumkum:        CDN("71qLan9PbXL"),   // Sindoor / Kumkum
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

// ─── Pooja Essentials ─────────────────────────────────────────────

export const CYCLE_AGARBATTI = item(
  "pja_001", "Cycle Pure Agarbatti 3-in-1 Special", "Cycle Pure Agarbattis",
  "Puja Needs",
  39, 45, 2, "packs of 120 sticks",
  IMG.cycle,
  "B07WDHKN4L", 4.4, 45231,
  "Best Seller",
  "3-in-1 blend of Sandal, Rose & Jasmine — 4-hour long lasting fragrance",
  "Essential incense for pooja ceremony", "Pooja essential", 14,
  [
    sub("pja_001_s1", "HEM Lavender Premium Agarbatti", "HEM Corporation",
      29, 35, "cheapest", "Best Value", "₹10 cheaper, pleasant floral fragrance",
      14, IMG.hem, "B07VPHK7QR", 4.3, 34521),
    sub("pja_001_s2", "Moksh Chandan Masala Agarbatti", "Moksh Agarbatti",
      65, 75, "trusted", "Most Trusted", "Hand-rolled premium chandan fragrance",
      16, IMG.moksh, "B08JKQ3D2P", 4.6, 18923),
  ]
);

export const MANGALDEEP_CAMPHOR = item(
  "pja_002", "Mangaldeep Camphor Tablets", "ITC Limited",
  "Puja Needs",
  28, 30, 1, "box of 50 tablets",
  IMG.mangaldeep,
  "B07XKHQT5P", 4.5, 34521,
  "Amazon's Choice",
  "Pure camphor tablets for aarti and purification — burns cleanly with no residue",
  "Required for aarti ritual", "Aarti ritual", 14,
  [
    sub("pja_002_s1", "Shudh Plus Camphor Cubes", "Shudh Plus",
      22, 25, "cheapest", "Best Value", "₹6 cheaper, identical purity",
      14, IMG.camphor, "B07PQV2T5L", 4.3, 12456),
  ]
);

export const POOJA_FLOWERS = item(
  "pja_003", "Fresh Marigold & Rose Pooja Flowers", "Amazon Fresh",
  "Fresh Flowers & Plants",
  95, 110, 1, "mixed bunch",
  IMG.marigold,
  "B07XKHQE8P", 4.0, 5234,
  "Amazon Fresh",
  "Fresh marigold garlands and loose rose petals for deity offerings — sourced same-day",
  "Fresh marigold and rose offerings for deity", "Deity offering", 20,
  [
    sub("pja_003_s1", "Artificial Silk Flower Garlands", "Craft Villa",
      75, 90, "fastest", "Fastest", "Always in stock, reusable artificial flowers",
      14, IMG.rose, "B07WDK9H5R", 4.1, 9823),
  ]
);

export const COCONUT_POOJA = item(
  "pja_004", "Fresh Pooja Coconut", "Amazon Fresh",
  "Fresh Fruits & Vegetables",
  35, 40, 2, "pieces",
  IMG.coconut,
  "B07XKHQP9E", 4.1, 6782,
  "Amazon Fresh",
  "Fresh, husk-trimmed coconuts for ritual offerings — selected for proper size and weight",
  "Auspicious offering for pooja ritual", "Sacred offering", 18,
  [
    sub("pja_004_s1", "Coconut Pooja Pack (Husk-free)", "Amazon Fresh",
      55, 65, "fastest", "Fastest", "Pre-husked, ready to use — no preparation needed",
      14, IMG.coconut, "B07XKHQP7E", 4.2, 3456),
    sub("pja_004_s2", "Dry Coconut (Khopar) for Pooja", "Amazon Fresh",
      45, 50, "trusted", "Most Trusted", "Traditionally preferred for longer rituals, better shelf life",
      18, IMG.coconut, "B08JKQ4D2P", 4.4, 8923),
  ]
);

export const AMUL_GHEE = item(
  "pja_005", "Amul Pure Ghee", "Amul (GCMMF)",
  "Ghee, Oils & Masalas",
  295, 325, 1, "500 ml",
  IMG.amulGhee,
  "B07XKHQT2P", 4.5, 67234,
  "Best Seller",
  "Pure desi ghee made from fresh cream — ideal for diyas, prasad and cooking",
  "Pure ghee for diyas and prasad preparation", "Diya fuel & prasad", 14,
  [
    sub("pja_005_s1", "Patanjali Cow Ghee", "Patanjali Ayurved",
      265, 299, "cheapest", "Best Value", "₹30 cheaper, cow milk ghee",
      16, IMG.patanjali, "B07PQV8T3L", 4.3, 45231),
  ]
);

export const INDIA_GATE_RICE = item(
  "pja_006", "India Gate Classic Basmati Rice", "KRBL Limited",
  "Rice, Flours & Grains",
  75, 85, 1, "1 kg",
  IMG.indiaGate,
  "B07WDHKP6L", 4.4, 89234,
  "Best Seller",
  "Extra-long aged Basmati rice — perfect as akshat (raw rice) for ritual offerings",
  "Akshat (raw rice) for ritual offering", "Ritual offering", 14,
  [
    sub("pja_006_s1", "Daawat Rozana Basmati Rice 1kg", "LT Foods",
      65, 72, "cheapest", "Best Value", "₹10 cheaper, long-grain basmati, widely available",
      12, IMG.indiaGate, "B07PQV3T4L", 4.3, 45231),
    sub("pja_006_s2", "India Gate Feast Rozzana Rice", "KRBL Limited",
      59, 65, "fastest", "Fastest", "Same brand, smaller pack, fastest dark store availability",
      10, IMG.indiaGate, "B07WDHKP7L", 4.3, 34521),
    sub("pja_006_s3", "Kohinoor Super Value Basmati Rice", "McCormick India",
      89, 99, "trusted", "Most Trusted", "Premium aged basmati, preferred for ceremonial use",
      14, IMG.indiaGate, "B07XKHQM2P", 4.5, 67234),
  ]
);

export const EVEREST_TURMERIC = item(
  "pja_007", "Everest Haldi (Turmeric) Powder", "Everest Food Products",
  "Ghee, Oils & Masalas",
  39, 42, 1, "100 g",
  IMG.everest,
  "B07XKHQM4P", 4.5, 34521,
  "Amazon's Choice",
  "Pure turmeric powder with 3.5% curcumin content — for tilak and pooja rituals",
  "Haldi for tilak and purification ritual", "Purification ritual", 14,
  [], false, true
);

export const DIYA_CLAY = item(
  "pja_008", "Clay Diyas for Puja", "Amazon Local",
  "Puja Needs",
  35, 40, 1, "pack of 10 diyas",
  CDN("71VpPHiWqjL"),
  "B07WDHKN6L", 4.2, 8923,
  "",
  "Handmade unglazed terracotta diyas — traditional oil lamps for puja and festivals",
  "Traditional oil lamps for aarti and puja ritual", "Diya lamp", 16,
  [
    sub("pja_008_s1", "Wax Tea Light Candles (24 pack)", "Generic",
      65, 75, "fastest", "Fastest", "No oil needed, instant light, widely stocked",
      12, CDN("71vPHiWqiL"), "B07WDKH6TR", 4.3, 15678),
  ]
);

export const KUMKUM = item(
  "pja_009", "Mangalya Kumkum Powder", "Mangalya",
  "Puja Needs",
  25, 30, 1, "50 g",
  CDN("71qMdn9PbXL"),
  "B07XKHQM1P", 4.4, 12345,
  "Amazon's Choice",
  "Pure vermilion kumkum for tilak and puja rituals — bright red, finely ground",
  "Tilak and ritual kumkum application", "Ritual essential", 14,
  [], false, true
);
