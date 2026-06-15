import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Dry Fruits / Gift Boxes
  haldiramsDryFruit: CDN("71EI56ULsdL"),  // Haldiram's Mixed Dry Fruit Box
  sattvikMix: CDN("71dJDlJR3mL"),   // Happilo Premium Dry Fruit Mix
  happilo: CDN("81uc8TdNZSL"),   // Happilo Almonds + Cashews Combo
  dryfruit500: CDN("71kLZ7rVQoL"),   // Nutraj Mixed Dry Fruits 500g
  // Sweets / Mithai
  haldiramGulab: CDN("71yEVu3l3vL"),   // Haldiram's Gulab Jamun Ready Mix
  haldiramSoan: CDN("71E0GvXfUnL"),   // Haldiram's Soan Papdi 250g
  haldiramLadoo: CDN("71LRFBWMwEL"),   // Haldiram's Motichoor Ladoo
  // Chocolates
  cadburyChoc: CDN("71mj8VgXedL"),   // Cadbury Celebrations Gift Pack
  cadburySilk: CDN("61HJz3UilGL"),   // Cadbury Dairy Milk Silk
  ferreroRocher: CDN("71H4m0UJPTL"),   // Ferrero Rocher T-16
  lindtChoc: CDN("71XnVK9k1QL"),   // Lindt Excellence Dark 70%
  kitkat: CDN("71PnEgrdFCL"),   // KitKat Gift Box
  // Gift Wrapping
  giftBox: CDN("71kZGvs1S0L"),   // Decorative Gift Box with Lid
  giftWrap: CDN("71mVE9yJI6L"),   // Premium Gift Wrapping Paper Sheets
  ribbons: CDN("71JtGIJHOBL"),   // Satin Gift Ribbons Combo
  giftBag: CDN("71OqaBk7CHL"),   // Kraft Paper Gift Bags set
  // Diyas / Candles (Indian gifting)
  scented: CDN("71WqJF7PBPL"),   // Iris Scented Candle
  waxCandle: CDN("71VpPHiVqjL"),   // Scented Pillar Candle
  diyas: CDN("71T3pNFX2vL"),   // Decorative Diya Set
  // Cards / Stationery
  giftCard: CDN("81I6xEYFpjL"),   // Premium Greeting Cards Pack
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

// ─── Gifting Products ────────────────────────────────────────────────

export const HALDIRAMS_DRY_FRUIT_BOX = item(
  "gift_001", "Haldiram's Premium Mixed Dry Fruit Gift Box", "Haldiram's",
  "Dry Fruits & Gift Boxes",
  699, 799, 1, "500g assorted",
  IMG.haldiramsDryFruit,
  "B07WDHKP7P", 4.5, 34521,
  "Amazon's Choice",
  "Premium mix of cashews, almonds, raisins, pistachios in a premium gift-ready tin box",
  "Traditional Indian dry fruit gift for all occasions", "Premium gift", 22,
  [
    sub("gift_001_s1", "Happilo Premium Dry Fruit & Nut Mix 500g", "Happilo",
      649, 749, "trusted", "Most Trusted", "100% natural, no oil / salt, Ayurvedic certified",
      22, IMG.happilo, "B07XKHQM5S", 4.4, 56789),
    sub("gift_001_s2", "Nutraj Premium Mixed Dry Fruits 500g", "Nutraj Foods",
      549, 649, "cheapest", "Best Value", "₹150 cheaper, resealable pack with almonds, figs & dates",
      20, IMG.dryfruit500, "B07PQV5T7P", 4.2, 34521),
  ]
);

export const CADBURY_CELEBRATIONS = item(
  "gift_002", "Cadbury Celebrations Premium Assorted Chocolate Gift Pack", "Mondelez India",
  "Chocolate Gift Boxes",
  499, 599, 1, "286.3g pack",
  IMG.cadburyChoc,
  "B07XKHQM6S", 4.4, 89234,
  "Best Seller",
  "Assorted premium chocolates — Bournville, Silk, 5 Star and Dairy Milk in festive packaging",
  "Premium chocolate gift for family or colleagues", "Chocolate gift", 18,
  [
    sub("gift_002_s1", "Ferrero Rocher T-16 Gift Box", "Ferrero India",
      549, 649, "trusted", "Most Trusted", "16 Ferrero Rocher chocolates in elegant gold box — globally loved",
      20, IMG.ferreroRocher, "B07WDKH5TP", 4.6, 67234),
    sub("gift_002_s2", "KitKat Friendship Gift Box", "Nestle India",
      399, 479, "cheapest", "Best Value", "₹100 cheaper, multiple KitKat bars in festive packaging",
      16, IMG.kitkat, "B07PQV5T6P", 4.3, 45678),
  ]
);

export const CADBURY_SILK = item(
  "gift_003", "Cadbury Dairy Milk Silk Chocolate Bar", "Mondelez India",
  "Premium Chocolates",
  185, 220, 1, "245g bar",
  IMG.cadburySilk,
  "B07WDHKQ8P", 4.5, 145678,
  "Best Seller",
  "Smooth, premium milk chocolate — perfect gifting bar for any occasion or celebration",
  "Premium chocolate bar for gifting", "Chocolate gift", 14,
  [
    sub("gift_003_s1", "Lindt Excellence Dark 70% Cacao 100g", "Lindt India",
      275, 325, "trusted", "Most Trusted", "Premium Swiss dark chocolate, minimally processed",
      16, IMG.lindtChoc, "B07XKHQT8S", 4.5, 56789),
  ]
);

export const HALDIRAMS_SOAN_PAPDI = item(
  "gift_004", "Haldiram's Soan Papdi", "Haldiram's",
  "Indian Sweets & Mithai",
  179, 199, 1, "250g",
  IMG.haldiramSoan,
  "B07XKHQE7S", 4.3, 67890,
  "Amazon's Choice",
  "Classic flaky, melt-in-mouth Indian sweet — a beloved festive gift across generations",
  "Traditional Indian festive sweet for gifting", "Indian mithai", 14,
  [
    sub("gift_004_s1", "Haldiram's Motichoor Ladoo 250g", "Haldiram's",
      189, 210, "trusted", "Most Trusted", "Freshly made round ladoos in attractive gift box",
      14, IMG.haldiramLadoo, "B07WDKH6TP", 4.4, 56789),
    sub("gift_004_s2", "Haldiram's Gulab Jamun 1kg Tin", "Haldiram's",
      249, 289, "cheapest", "Best Value", "1kg ready-to-serve gulab jamun, great for gatherings",
      12, IMG.haldiramGulab, "B07PQV4T8P", 4.3, 45678),
  ]
);

export const PREMIUM_GIFT_BOX = item(
  "gift_005", "Premium Decorative Gift Box with Magnetic Lid", "Unforgettable",
  "Gift Packaging",
  349, 399, 1, "medium — 25 × 20 × 10 cm",
  IMG.giftBox,
  "B09GIFTBOX1", 4.3, 23456,
  "Amazon's Choice",
  "Rigid gift box with magnetic closure + tissue paper + satin ribbon — premium unboxing experience",
  "Elegant packaging for the gift", "Gift packaging", 16,
  [
    sub("gift_005_s1", "Kraft Paper Gift Bags (Set of 6)", "Mr Crimps",
      199, 249, "cheapest", "Best Value", "₹150 cheaper, eco-friendly bags with handles + tissue paper",
      14, IMG.giftBag, "B09GIFTBAG1", 4.2, 34567),
  ]
);

export const SATIN_RIBBON_ROLL = item(
  "gift_006", "Premium Satin Gift Ribbon & Bow Set", "EBL",
  "Gift Packaging",
  149, 179, 1, "set of 20 ribbons + 10 bows",
  IMG.ribbons,
  "B09RIBBON01", 4.2, 12345,
  "",
  "10 vibrant colour satin ribbons + 10 pre-tied bows — ideal for wrapping gift boxes beautifully",
  "Beautiful finishing touch for gift wrapping", "Gift accessory", 14,
  [], false, true
);

export const GIFT_WRAPPING_PAPER = item(
  "gift_007", "Premium Gift Wrapping Paper Sheets (10 sheets)", "Indigifts",
  "Gift Packaging",
  199, 249, 1, "10 A2 sheets + 2 ribbons",
  IMG.giftWrap,
  "B09WRAP0001", 4.3, 19234,
  "",
  "Assorted floral & geometric prints, thick 120 GSM — clean crisp fold, no bleed-through",
  "Beautiful gift wrapping sheets", "Gift packaging", 14,
  [], false, true
);

export const GREETING_CARDS = item(
  "gift_008", "Premium Greeting Cards Pack (6 designs)", "Archies",
  "Stationery & Gifting",
  199, 249, 1, "pack of 6 with envelopes",
  IMG.giftCard,
  "B09CARDS001", 4.3, 23456,
  "",
  "6 unique hand-illustrated greeting card designs — suitable for birthdays, anniversaries, festivals",
  "Personalised message card for the gift", "Gift card", 12,
  [], false, true
);

export const IRIS_SCENTED_CANDLE = item(
  "gift_009", "Iris Scented Candle — Jasmine & Sandalwood", "SPA Iris",
  "Home Fragrance",
  349, 399, 1, "200g, 40hr burn",
  IMG.scented,
  "B07WDKH7TP", 4.4, 45678,
  "Amazon's Choice",
  "Natural soy wax + essential oils — relaxing jasmine + sandalwood blend, gift-ready packaging",
  "Luxurious scented candle for gifting or home ambiance", "Decor gift", 18,
  [
    sub("gift_009_s1", "Yogi & Yogini Natural Soy Candle", "Yogi & Yogini",
      299, 349, "cheapest", "Best Value", "₹50 cheaper, hand-poured natural soy wax with cotton wick",
      16, IMG.waxCandle, "B09CANDLE01", 4.2, 23456),
  ]
);

export const HALDIRAMS_GIFT_HAMPER = item(
  "gift_010", "Haldiram's Festive Snack Gift Hamper", "Haldiram's",
  "Gift Hampers",
  849, 999, 1, "assorted snack box",
  IMG.haldiramsDryFruit,
  "B07WDHKQ3P", 4.5, 34521,
  "Best Seller",
  "Premium assortment of Haldiram's namkeens, sweets and dry fruits — perfect Diwali / Festive gift",
  "Complete Indian snack hamper for festive gifting", "Festive hamper", 22,
  [
    sub("gift_010_s1", "Happilo Premium Trail Mix Gift Box 750g", "Happilo",
      749, 899, "trusted", "Most Trusted", "Gourmet nut & seed mix with cranberries, premium tin",
      20, IMG.happilo, "B07XKHQM3S", 4.4, 23456),
  ]
);
