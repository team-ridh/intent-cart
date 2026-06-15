import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  mariGold:      CDN("61EP5COKj4L"),   // Britannia Marie Gold
  parleG:        CDN("61kZskdmJzL"),   // Parle-G Glucose Biscuits
  goodDay:       CDN("61EP5COKj4L"),   // Britannia Good Day
  monaco:        CDN("61kZskdmJzL"),   // Parle Monaco
  khari:         CDN("41Ye7PBGgzL"),   // Parle Khari Biscuit
  maggi:         CDN("71SKKjG1WRL"),   // Maggi Noodles 2-Min

  yippee:        CDN("71Uf5n8KPNL"),   // Sunfeast YiPPee Noodles
  knorrSoupy:    CDN("71VqOHiVqkL"),   // Knorr Soupy Noodles
  maggiNutri:    CDN("71SKKjG2WRL"),   // Maggi Nutri-licious Oats
  britanniaBread:CDN("81Uh3KpVDmL"),   // Britannia White Bread
  modernBread:   CDN("71hG5xkQWRL"),   // Modern Bread
  harvestGold:   CDN("71vN6xKCP4L"),   // Harvest Gold Bread
  amulButter:    CDN("61UMK6VPiTL"),   // Amul Butter 100g
  britanniaButter:CDN("71SKKjG3WRL"),  // Britannia Winkin' Cow Butter
  amulGoldButter: CDN("71WH8yMq6LL"),  // Amul Gold Butter
  eggs:          CDN("61emkv50hvL"),   // Farm Fresh Eggs
  haldirams:     CDN("81yPcFk1LzL"),   // Haldirams Bhujia
  bikajiMix:     CDN("91lxOzQhSgL"),   // Bikaji Namkeen Mix
  tooyumm:       CDN("71NIHBImUsL"),   // Too Yumm Multigrain Chips
  snickers:      CDN("71LMFhG+uXL"),   // Snickers Bar
  yogabar:       CDN("81H5xDYFpjL"),   // Yoga Bar Oats & Berries
  knorrSoup:     CDN("71VqOHiVqjL"),   // Knorr Chicken Soup
  chingsSoup:    CDN("71EFjHq5xGL"),   // Ching's Manchow Soup
  dabur:         CDN("81B7LUtg1ZL"),   // Dabur Honey
  lemon:         CDN("61UMK8VQiTL"),   // Fresh Lemons
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

// ─── Biscuits & Snacks ─────────────────────────────────────────────

export const BRITANNIA_MARIE_GOLD = item(
  "food_001", "Britannia Marie Gold Biscuits", "Britannia Industries",
  "Biscuits, Cookies & Cakes",
  38, 40, 2, "250 g each",
  IMG.mariGold,
  "B07WDHKP5L", 4.5, 89234,
  "Best Seller",
  "Light, crispy biscuit with a subtle sweetness — ideal for tea dunking",
  "Classic accompaniment for tea service", "Tea pairing", 12,
  [
    sub("food_001_s1", "Britannia Good Day Cashew", "Britannia Industries",
      45, 48, "trusted", "Most Trusted", "Rich cashew cookies, premium tea pairing",
      12, IMG.goodDay, "B07WDHKQ6L", 4.4, 67823),
    sub("food_001_s2", "Parle-G Original Glucose Biscuits", "Parle Products",
      20, 20, "cheapest", "Best Value", "₹18 cheaper — India's favourite biscuit",
      8, IMG.parleG, "B07PQ9T5RL", 4.6, 145234),
  ]
);

export const PARLE_G = item(
  "food_002", "Parle-G Original Glucose Biscuits", "Parle Products",
  "Biscuits, Cookies & Cakes",
  10, 10, 2, "100 g each",
  IMG.parleG,
  "B07PQ9T5RL", 4.6, 145234,
  "Best Seller",
  "World's largest-selling biscuit brand — the original glucose biscuit since 1939",
  "Classic biscuit for tea time dunking", "Tea companion", 10,
  [
    sub("food_002_s1", "Parle Monaco Classic Crackers", "Parle Products",
      20, 20, "trusted", "Most Trusted", "Premium light salty cracker option",
      10, IMG.monaco, "B07WDKH9TR", 4.3, 34521),
  ]
);

export const PARLE_KHARI = item(
  "food_003", "Parle Khari Biscuits", "Parle Products",
  "Biscuits, Cookies & Cakes",
  30, 35, 1, "250 g",
  IMG.khari,
  "B07WDKH5QL", 4.2, 19834,
  "",
  "Flaky, puff pastry-style savoury biscuits — classic with chai",
  "Savoury option for varied guest preferences", "Savory option", 14,
  [], false, true
);

export const HALDIRAMS_BHUJIA = item(
  "food_004", "Haldiram's Aloo Bhujia", "Haldiram's",
  "Namkeen & Snacks",
  55, 60, 1, "150 g",
  IMG.haldirams,
  "B07VPH3KQR", 4.5, 52341,
  "Amazon's Choice",
  "Crispy potato sev seasoned with spices — India's most beloved namkeen",
  "Savoury snack for tea break", "Savoury option", 12,
  [
    sub("food_004_s1", "Bikaji Bhujia Sev", "Bikaji Foods",
      48, 55, "cheapest", "Best Value", "₹7 cheaper, equally crispy Bikaner bhujia",
      12, IMG.bikajiMix, "B08JKQD2P1", 4.3, 28934),
    sub("food_004_s2", "Too Yumm! Multigrain Crisps", "RP-Sanjiv Goenka",
      30, 35, "fastest", "Fastest", "Baked, not fried — healthier snack option",
      10, IMG.tooyumm, "B07PQV3T5L", 4.1, 18234),
  ]
);

// ─── Instant Food ──────────────────────────────────────────────────

export const MAGGI_NOODLES = item(
  "food_005", "Maggi 2-Minute Masala Noodles", "Nestlé India",
  "Pasta, Noodles & Sauces",
  57, 64, 4, "70 g each",
  IMG.maggi,
  "B07WDHKP4L", 4.5, 234521,
  "Best Seller",
  "India's most iconic instant noodles — ready in just 2 minutes",
  "Classic comfort food for rainy evenings", "Comfort food", 12,
  [
    sub("food_005_s1", "Sunfeast YiPPee! Magic Masala Noodles", "ITC Limited",
      48, 56, "cheapest", "Best Value", "₹9 cheaper for 4 packs, thicker noodles",
      10, IMG.yippee, "B08JKQ9D2P", 4.3, 98234),
    sub("food_005_s2", "Knorr Soupy Noodles", "Hindustan Unilever",
      62, 70, "trusted", "Most Trusted", "Soup + noodles in one, higher protein & nutrition",
      12, IMG.knorrSoupy, "B07WDHKQ7L", 4.4, 56782),
  ]
);

export const KNORR_SOUP = item(
  "food_006", "Knorr Classic Chicken Noodle Soup", "Hindustan Unilever",
  "Soups & Broths",
  69, 75, 2, "44 g each",
  IMG.knorrSoup,
  "B07XKHQT4P", 4.3, 28934,
  "Amazon's Choice",
  "Warm, comforting chicken soup with tender noodles — made in minutes",
  "Comforting warm meal during illness", "Recovery nutrition", 12,
  [
    sub("food_006_s1", "Ching's Secret Hot & Sour Soup", "Capital Foods",
      45, 52, "cheapest", "Best Value", "₹24 cheaper per pack, spicy Indo-Chinese",
      10, IMG.chingsSoup, "B07VPH8KQR", 4.2, 18234),
    sub("food_006_s2", "Maggi Nutri-licious Masala Oats", "Nestlé India",
      62, 70, "fastest", "Fastest", "8 min ETA, widely stocked across all dark stores",
      8, IMG.maggiNutri, "B07WDHKP5L", 4.3, 34521),
    sub("food_006_s3", "Knorr Tomato Ketchup Soup", "Hindustan Unilever",
      79, 85, "trusted", "Most Trusted", "Most reviewed HUL soup — rich tomato base",
      12, IMG.knorrSoup, "B07XKHQT3P", 4.5, 52341),
  ]
);

// ─── Bread & Dairy ────────────────────────────────────────────────

export const BRITANNIA_BREAD = item(
  "food_007", "Britannia Premium Bakery Bread", "Britannia Industries",
  "Bread & Bakery",
  44, 48, 1, "400 g",
  IMG.britanniaBread,
  "B07WDHKQ5L", 4.3, 34521,
  "Amazon's Choice",
  "Soft, fresh white bread made with enriched flour — stays fresh for 5 days",
  "Staple for indoor cooking on a rainy day", "Indoor meal", 12,
  [
    sub("food_007_s1", "Modern Bread Classic Sliced", "Hindustan Unilever",
      38, 40, "cheapest", "Best Value", "₹6 cheaper, same soft freshness",
      10, IMG.modernBread, "B07WDKH7TR", 4.2, 18923),
    sub("food_007_s2", "Harvest Gold Sandwich Bread", "Harvest Gold",
      39, 42, "fastest", "Fastest", "8 min ETA, widely available in most dark stores",
      8, IMG.harvestGold, "B07PQV6T5L", 4.2, 14567),
  ]
);

export const AMUL_BUTTER = item(
  "food_008", "Amul Pasteurised Butter", "Amul (GCMMF)",
  "Dairy, Chilled & Eggs",
  58, 62, 1, "100 g",
  IMG.amulButter,
  "B07XKHQT7P", 4.5, 45234,
  "Best Seller",
  "The original Amul butter — made from fresh pasteurised cream, no preservatives",
  "Pairs with bread for a quick warm snack", "Snack pairing", 12,
  [
    sub("food_008_s1", "Britannia Winkin' Cow Butter", "Britannia Industries",
      52, 56, "cheapest", "Best Value", "₹6 cheaper, same quality pasteurised butter",
      10, IMG.britanniaButter, "B07WDHKQ8L", 4.3, 23456),
    sub("food_008_s2", "Mother Dairy Butter 100g", "Mother Dairy",
      55, 58, "fastest", "Fastest", "8 min ETA, widely available at nearby dark stores",
      8, IMG.amulButter, "B07XKHQP8E", 4.3, 18234),
    sub("food_008_s3", "Amul Gold Butter 100g", "Amul (GCMMF)",
      68, 72, "trusted", "Most Trusted", "Premium Amul Gold — richer, creamier texture",
      12, IMG.amulGoldButter, "B07XKHQT8P", 4.6, 62341),
  ]
);

export const FARM_EGGS_6PCS = item(
  "food_009", "Country Chicken Farm Fresh Eggs", "Suguna Poultry",
  "Dairy, Chilled & Eggs",
  79, 85, 6, "pieces",
  IMG.eggs,
  "B07XKHQE9P", 4.2, 9823,
  "Amazon Fresh",
  "Farm-fresh eggs with natural golden yolk — checked for freshness and quality",
  "Quick protein-rich meal option", "Rainy day meal", 15,
  [
    sub("food_009_s1", "Akshayakalpa Organic Eggs", "Akshayakalpa",
      95, 100, "trusted", "Most Trusted", "Certified organic free-range eggs",
      15, IMG.eggs, "B08TQRK9PL", 4.5, 7234),
  ]
);

// ─── Health Foods ─────────────────────────────────────────────────

export const DABUR_HONEY = item(
  "food_010", "Dabur Honey 100% Pure", "Dabur India",
  "Honey, Jams & Sweet Spreads",
  145, 165, 1, "250 g",
  IMG.dabur,
  "B07QPVK5NT", 4.4, 78234,
  "Amazon's Choice",
  "Pure, natural honey with no added sugar — NMR tested for authenticity",
  "Natural sore throat remedy", "Natural remedy", 12,
  [], false, true
);

export const YOGA_BAR_ENERGY = item(
  "food_011", "Yoga Bar Oats & Berries Energy Bar", "ITC Limited",
  "Health Foods & Diet",
  55, 65, 3, "38 g each",
  IMG.yogabar,
  "B07XKHQM9P", 4.3, 34521,
  "Amazon's Choice",
  "Real oats, nuts and dried berries — high protein, no artificial flavours",
  "Quick energy boost during long journeys", "Energy boost", 12,
  [
    sub("food_011_s1", "Snickers Original Chocolate Bar", "Mars India",
      50, 55, "cheapest", "Best Value", "₹5 cheaper, quick energy from chocolate",
      10, IMG.snickers, "B07PQ9V5RL", 4.4, 67234),
  ]
);

export const PAPER_CUPS = item(
  "food_012", "Disposable Paper Cups", "Solo India",
  "Disposables & Packaging",
  65, 75, 1, "pack of 50",
  CDN("71SKKjG4WRL"),
  "B07WDHKQ9L", 4.2, 28934,
  "Amazon's Choice",
  "Food-grade single-use 150ml paper cups — ideal for serving hot and cold beverages",
  "Essential for serving guests without washing up", "Serving essential", 10,
  [
    sub("food_012_s1", "Chuk Compostable Paper Cups", "Chuk",
      89, 99, "trusted", "Most Trusted", "100% compostable, eco-friendly alternative",
      12, CDN("71vOHiVMhRL"), "B08JKQD3P1", 4.4, 12456),
    sub("food_012_s2", "Plastic Shot Glasses (50ml)", "Generic",
      45, 50, "cheapest", "Best Value", "₹20 cheaper, reusable for future gatherings",
      10, CDN("71EFjHq7xGL"), "B07PQV5T8L", 4.0, 8923),
  ]
);

export const PAPER_NAPKINS = item(
  "food_013", "Scotts 2-Ply Paper Napkins", "Kimberly-Clark",
  "Disposables & Packaging",
  55, 62, 1, "pack of 50",
  CDN("81yPcGk2LzL"),
  "B07XKHQM7P", 4.3, 19234,
  "",
  "2-ply white napkins — soft and absorbent, great for serving snacks and meals",
  "Convenience item for guest hosting", "Hosting convenience", 10,
  [], false, true
);

export const SUGAR_500G = item(
  "food_014", "Uttam Sugar", "Uttam Sugar Mills",
  "Sugar, Salt & Jaggery",
  32, 35, 1, "500 g",
  CDN("71I4Y1KNABL"),
  "B07WDHKQ2L", 4.3, 34521,
  "Best Seller",
  "Refined white crystal sugar — essential for tea, coffee and sweet preparations",
  "Required for sweetened beverages", "Tea essential", 10,
  [
    sub("food_014_s1", "Patanjali Mishri Crystal Sugar", "Patanjali Ayurved",
      35, 40, "trusted", "Most Trusted", "Rock candy sugar preferred for traditional chai",
      12, CDN("71I4Y2KNABL"), "B07PQV5T7L", 4.4, 18923),
  ]
);
