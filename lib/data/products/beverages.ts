import type { CartItem, Substitute } from "../../types";

// ─── Amazon CDN image base ─────────────────────────────────────────
const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

// ─── Verified Amazon India image IDs (sourced from amazon.in product pages) ───
const IMG = {
  tataTea:        CDN("51QF8woKr5S"),   // Tata Tea Gold 500g
  brookeBond:     CDN("71LMFhF-uUL"),   // Brooke Bond Red Label
  liptonBags:     CDN("61U9SDWMAnL"),   // Lipton Tea Bags
  tetleyBags:     CDN("81Uz9yNSVLL"),   // Tetley Green Tea Bags
  wagh:           CDN("61OO040R0yL"),   // Wagh Bakri Tea
  amulMilk:       CDN("41hheOaj6bL"),   // Amul Taaza Milk 1L
  motherDairy:    CDN("71-3N0G89IL"),   // Mother Dairy Full Cream
  bru:            CDN("61AB3TEhpkL"),   // Bru Instant Coffee
  nescafe:        CDN("51eDlORG3xL"),   // Nescafe Classic
  cadburyDrinking:CDN("71V5xDnEtxL"),   // Cadbury Drinking Chocolate
  starbucks:      CDN("71LcEbhNv3L"),   // Starbucks VIA Instant
  bisleri:        CDN("61LMoY3EYQL"),   // Bisleri Water 1L
  kinley:         CDN("71I2X0KNCBL"),   // Kinley Water
  evian:          CDN("61abGGyVCKL"),   // Evian Natural Mineral Water
  tropicana:      CDN("71MBrJFnEZL"),   // Tropicana Orange Juice
  realJuice:      CDN("71GUVJRm+kL"),   // Real Juice Mixed Fruit
};

// ─── Helper functions ──────────────────────────────────────────────
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

// ─── Products ─────────────────────────────────────────────────────

export const TATA_TEA_GOLD = item(
  "bev_001", "Tata Tea Gold", "Tata Consumer Products",
  "Tea, Coffee & Beverages",
  219, 259, 1, "500 g",
  IMG.tataTea,
  "B08H654828", 4.4, 36945,
  "Best Seller",
  "Rich Assam blend with GaiGai leaves for an invigorating taste",
  "Core hosting essential for serving guests", "Hosting essential", 12,
  [
    sub("bev_001_s1", "Brooke Bond Red Label", "Hindustan Unilever",
      189, 230, "fastest", "Fastest", "Ready at nearest dark store in 8 min",
      8, IMG.brookeBond, "B07WDKH5PR", 4.3, 42156),
    sub("bev_001_s2", "Wagh Bakri Premium Leaf Tea", "Wagh Bakri",
      175, 210, "cheapest", "Best Value", "₹44 cheaper, strong Gujarati blend",
      12, IMG.wagh, "B07PQV9T5R", 4.3, 29847),
    sub("bev_001_s3", "Brooke Bond Taj Mahal Tea", "Hindustan Unilever",
      299, 330, "trusted", "Most Trusted", "Premium Darjeeling blend for special guests",
      14, IMG.brookeBond, "B08JKQDM3P", 4.5, 67823),
  ]
);

export const LIPTON_TEA_BAGS = item(
  "bev_002", "Lipton Yellow Label Tea Bags", "Lipton",
  "Tea, Coffee & Beverages",
  99, 130, 1, "25 bags",
  IMG.liptonBags,
  "B07H6CNKTQ", 4.2, 34521,
  "Amazon's Choice",
  "Quick-brew bags for a refreshing cup without boiling milk",
  "Quick-brew tea without boiling milk", "Quick tea", 10,
  [
    sub("bev_002_s1", "Tata Tea Premium Bags", "Tata Consumer Products",
      89, 115, "fastest", "Fastest", "8 min ETA, classic Assam taste",
      8, IMG.tataTea, "B07GN8KQPR", 4.3, 28934),
    sub("bev_002_s2", "Tetley Green Tea Bags", "Tetley",
      110, 145, "trusted", "Most Trusted", "Smooth, antioxidant-rich green tea",
      12, IMG.tetleyBags, "B07JKPL9QR", 4.4, 45672),
  ]
);

export const AMUL_TAAZA_MILK = item(
  "bev_003", "Amul Taaza Toned Milk", "Amul (GCMMF)",
  "Dairy, Chilled & Eggs",
  68, 72, 2, "1 L each",
  IMG.amulMilk,
  "B07XKHQT3P", 4.3, 12456,
  "Best Seller",
  "UHT processed toned milk, 3% fat — no refrigeration before opening",
  "Required to prepare tea for multiple guests", "Required for serving", 12,
  [
    sub("bev_003_s1", "Mother Dairy Full Cream Milk", "Mother Dairy",
      65, 70, "fastest", "Fastest", "Available at nearest dark store, 8 min",
      8, IMG.motherDairy, "B07XKPQ4TL", 4.2, 9823),
    sub("bev_003_s2", "Amul Gold Full Cream Milk", "Amul (GCMMF)",
      75, 80, "trusted", "Most Trusted", "Full cream 6% fat, richer tea taste",
      12, IMG.amulMilk, "B07XKHQR2P", 4.4, 15672),
  ]
);

export const CADBURY_DRINKING_CHOCOLATE = item(
  "bev_004", "Cadbury Drinking Chocolate", "Mondelez India",
  "Tea, Coffee & Beverages",
  149, 175, 1, "200 g",
  IMG.cadburyDrinking,
  "B07QP5KNTL", 4.4, 28934,
  "Amazon's Choice",
  "Classic hot chocolate mix with rich cocoa — perfect rainy day comfort drink",
  "Perfect warm drink for a rainy day indoors", "Rainy day comfort", 14,
  [
    sub("bev_004_s1", "Bru Cappuccino Instant Coffee", "Hindustan Unilever",
      95, 110, "cheapest", "Best Value", "₹54 cheaper, satisfying warm drink",
      14, IMG.bru, "B07VPHK9QR", 4.1, 18234),
    sub("bev_004_s2", "Nescafe Classic Instant Coffee", "Nestlé India",
      179, 210, "trusted", "Most Trusted", "World's #1 coffee brand, rich aroma",
      16, IMG.nescafe, "B07WDK4P9R", 4.3, 52341),
    sub("bev_004_s3", "Starbucks VIA Instant Coffee", "Starbucks",
      350, 390, "trusted", "Premium Pick", "Café-quality instant coffee sachets",
      16, IMG.starbucks, "B08TK9QR2L", 4.5, 34567),
  ]
);

export const BISLERI_WATER_1L = item(
  "bev_005", "Bisleri Mineral Water", "Bisleri International",
  "Water & Juices",
  22, 22, 2, "1 L each",
  IMG.bisleri,
  "B07XKHQT9P", 4.4, 45231,
  "Best Seller",
  "Purified and mineralised drinking water with 7-stage filtration",
  "Essential hydration for journey", "Travel essential", 10,
  [
    sub("bev_005_s1", "Kinley Mineral Water", "Coca-Cola India",
      20, 20, "fastest", "Fastest", "8 min ETA, widely available",
      8, IMG.kinley, "B07WDKH8TR", 4.3, 29456),
    sub("bev_005_s2", "Evian Natural Spring Water", "Evian",
      120, 130, "trusted", "Premium Pick", "Natural Alpine spring water, France",
      14, IMG.evian, "B08PQV9T4L", 4.6, 12341),
  ]
);

export const BRU_INSTANT_COFFEE = item(
  "bev_006", "Bru Instant Coffee", "Hindustan Unilever",
  "Tea, Coffee & Beverages",
  95, 110, 1, "100 g",
  IMG.bru,
  "B07VPHK3QR", 4.1, 23456,
  "#1 in Instant Coffee",
  "South Indian filter coffee taste in an instant — bold, full-bodied flavour",
  "Quick energy boost during tea break", "Instant coffee", 10,
  [
    sub("bev_006_s1", "Nescafe Classic", "Nestlé India",
      179, 210, "trusted", "Most Trusted", "World's most loved instant coffee",
      10, IMG.nescafe, "B07WDK4P9R", 4.3, 52341),
  ]
);
