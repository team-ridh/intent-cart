import type { CartItem, Substitute } from "../../types";

// Amazon India product image CDN helper
const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Cereals
  kelloggsCornFlakes:   CDN("71qFiSjGTRL"),  // Kellogg's Corn Flakes Original 875g
  kellChoco:            CDN("71ZxO0cqDNL"),  // Kellogg's Chocos 700g
  kellMuesli:           CDN("71wUHSZLzpL"),  // Kellogg's Muesli Fruit Nut & Seeds
  quakerOats:           CDN("817rQf5AGPL"),  // Quaker Rolled Oats 2kg
  saffolaOats:          CDN("71VFLWmNxmL"),  // Saffola Oats 1kg
  bagrrys:              CDN("71UT9xHrFQL"),  // Bagrry's Muesli Crunchy
  // Hot Malts / Mixes
  horlicks:             CDN("71hQ4h+MNML"),  // Horlicks Classic Malt 500g
  bournvita:            CDN("71Y8IFBgxGL"),  // Cadbury Bournvita 750g
  milo:                 CDN("71mT+N5MCFL"),  // Nestle Milo Refill 400g
  complan:              CDN("71kM5ZvAGIL"),  // Complan Royale Chocolate 500g
  // Breakfast Mixes (Indian)
  mtrUpma:              CDN("81GRF4NZGKL"),  // MTR Breakfast Mix Upma 500g
  mtrPoha:              CDN("71PnGNE7GJL"),  // MTR Poha Breakfast Mix 500g
  // Bread / Spreads
  britanniaBrown:       CDN("71kZGvs1U0L"),  // Britannia 100% Whole Wheat Bread 400g
  kissamJam:            CDN("71mVE9yJK6L"),  // Kissan Mixed Fruit Jam 500g
  britanniaBread:       CDN("71JtGIJJBL"),   // Britannia Milk Bread 400g
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
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Breakfast & Cereals ──────────────────────────────────────────

export const KELLOGGS_CORN_FLAKES = item(
  "bfast_001", "Kellogg's Corn Flakes Original", "Kellogg India",
  "Breakfast Cereals", 299, 355, 1, "875g",
  IMG.kelloggsCornFlakes, "B07GN3NLTN", 4.3, 189234,
  "Best Seller",
  "Light, crispy corn flakes with 6 vitamins & iron — India's favourite breakfast cereal since 1994",
  "Classic breakfast cereal with milk", "Breakfast staple", 18,
  [
    sub("bfast_001_s1", "Saffola Oats 1kg", "Marico",
      225, 265, "cheapest", "Best Value", "₹74 cheaper, rich in beta-glucan fibre, lower GI than corn flakes",
      16, IMG.saffolaOats, "B07WDKH3TF", 4.3, 145678),
    sub("bfast_001_s2", "Quaker Rolled Oats 1kg", "PepsiCo India",
      275, 320, "trusted", "Most Trusted", "Whole grain oats, heart-healthy, no added sugar",
      18, IMG.quakerOats, "B07WDKH4TF", 4.5, 234567),
  ]
);

export const QUAKER_OATS = item(
  "bfast_002", "Quaker Rolled Oats", "PepsiCo India",
  "Breakfast Cereals", 359, 420, 1, "2 kg",
  IMG.quakerOats, "B01N5MNHNO", 4.5, 345678,
  "Best Seller",
  "100% wholegrain, high in beta-glucan fibre — helps reduce cholesterol and keeps you full longer",
  "Nutritious high-fibre breakfast oats", "Breakfast essential", 16,
  [
    sub("bfast_002_s1", "Saffola Oats 1kg", "Marico",
      225, 265, "cheapest", "Best Value", "₹134 cheaper for 1kg, added vitamins, tasty masala variant available",
      14, IMG.saffolaOats, "B07WDKH3TF", 4.3, 145678),
    sub("bfast_002_s2", "Kellogg's Muesli Fruit Nut & Seeds 750g", "Kellogg India",
      375, 440, "trusted", "Most Trusted", "Multigrain muesli with real fruit pieces and seeds",
      16, IMG.kellMuesli, "B07WDK5HTF", 4.3, 89234),
  ]
);

export const KELLOGGS_CHOCOS = item(
  "bfast_003", "Kellogg's Chocos", "Kellogg India",
  "Breakfast Cereals", 349, 410, 1, "700g",
  IMG.kellChoco, "B07WDHKN3F", 4.4, 156782,
  "Best Seller",
  "Wheat puffs coated in chocolatey flavour — fortified with 6 vitamins and iron, loved by children",
  "Chocolate-flavoured cereal for kids", "Kids breakfast", 16,
  [
    sub("bfast_003_s1", "Kellogg's Corn Flakes Original 875g", "Kellogg India",
      299, 355, "cheapest", "Best Value", "₹50 cheaper, classic original flavour",
      16, IMG.kelloggsCornFlakes, "B07GN3NLTN", 4.3, 189234),
  ]
);

export const BAGGRRYS_MUESLI = item(
  "bfast_004", "Bagrry's Muesli Crunchy with Almonds & Raisins", "Bagrry's India",
  "Breakfast Cereals", 499, 579, 1, "750g",
  IMG.bagrrys, "B07XKHQT7F", 4.3, 89234,
  "Amazon's Choice",
  "Low-fat toasted oats with whole almonds, raisins and cranberries — no artificial colours or preservatives",
  "Premium granola muesli for health-conscious breakfast", "Healthy breakfast", 18,
  [
    sub("bfast_004_s1", "Kellogg's Muesli Fruit Nut & Seeds 500g", "Kellogg India",
      349, 410, "trusted", "Most Trusted", "Real fruit pieces, wheat flakes, corn flakes blend",
      16, IMG.kellMuesli, "B07WDK5HTG", 4.3, 67890),
  ]
);

export const HORLICKS_MALT = item(
  "bfast_005", "Horlicks Classic Malt Drink", "Hindustan Unilever",
  "Health Drinks & Malts", 325, 385, 1, "500g",
  IMG.horlicks, "B07WDHKQ3F", 4.5, 234567,
  "Best Seller",
  "23 essential nutrients including Vitamin D, Calcium and protein — scientifically proven to increase height, strength and immunity",
  "Nutritious hot malt drink for breakfast", "Health malt", 16,
  [
    sub("bfast_005_s1", "Cadbury Bournvita Chocolate Health Drink 750g", "Mondelez India",
      349, 410, "trusted", "Most Trusted", "Vitamins, minerals + chocolate taste kids love",
      16, IMG.bournvita, "B07WDKH5TF", 4.5, 345678),
    sub("bfast_005_s2", "Nestle Milo Refill 400g", "Nestle India",
      275, 325, "cheapest", "Best Value", "₹50 cheaper, malt + cocoa energy drink",
      14, IMG.milo, "B07PQV5T8F", 4.3, 89234),
  ]
);

export const CADBURY_BOURNVITA = item(
  "bfast_006", "Cadbury Bournvita Chocolate Health Drink", "Mondelez India",
  "Health Drinks & Malts", 399, 459, 1, "750g",
  IMG.bournvita, "B07XKHQM5F", 4.5, 456789,
  "Best Seller",
  "Proven 2X more immunity nutrients — Vitamin C + D + B2 + B12, loved by children across India",
  "Popular chocolate health malt for breakfast", "Health drink", 16,
  [
    sub("bfast_006_s1", "Horlicks Classic Malt 500g", "HUL",
      325, 385, "trusted", "Most Trusted", "Protein + 23 nutrients scientifically proven for growth",
      16, IMG.horlicks, "B07WDHKQ3F", 4.5, 234567),
    sub("bfast_006_s2", "Complan Royale Chocolate 500g", "Kraft Heinz India",
      299, 349, "cheapest", "Best Value", "₹100 cheaper, 34 vital nutrients, growth formula",
      14, IMG.complan, "B07PQV5T5F", 4.2, 67890),
  ]
);

export const MTR_UPMA_MIX = item(
  "bfast_007", "MTR Breakfast Mix — Upma", "MTR Foods",
  "Indian Breakfast Mixes", 75, 85, 1, "500g (makes ~8 servings)",
  IMG.mtrUpma, "B07WDHKP3F", 4.3, 89234,
  "Amazon's Choice",
  "Ready-to-cook semolina upma mix with authentic South Indian spices — just add water, ready in 5 minutes",
  "Quick traditional Indian breakfast", "Indian breakfast", 14,
  [
    sub("bfast_007_s1", "MTR Poha Breakfast Mix 500g", "MTR Foods",
      65, 75, "cheapest", "Best Value", "₹10 cheaper, flattened rice mix with turmeric and mustard",
      12, IMG.mtrPoha, "B07XKHQM3F", 4.2, 67234),
  ]
);

export const MTR_POHA_MIX = item(
  "bfast_008", "MTR Breakfast Mix — Poha", "MTR Foods",
  "Indian Breakfast Mixes", 65, 75, 1, "500g (makes ~8 servings)",
  IMG.mtrPoha, "B07XKHQE3F", 4.2, 78234,
  "",
  "Ready-to-cook poha mix with turmeric, mustard and curry leaves — authentic Maharashtra-style breakfast in minutes",
  "Traditional beaten rice breakfast", "Indian breakfast", 14,
  [], false, false
);

export const KISSAN_JAM = item(
  "bfast_009", "Kissan Mixed Fruit Jam", "Hindustan Unilever",
  "Jams & Spreads", 145, 165, 1, "500g",
  IMG.kissamJam, "B07WDKH4TF", 4.4, 145678,
  "Best Seller",
  "Made with real fruit — rich mixed fruit flavour perfect on bread, toast, chapatis and pancakes",
  "Fruit jam for breakfast toast or bread", "Breakfast spread", 12,
  [
    sub("bfast_009_s1", "Kissan Strawberry Jam 500g", "HUL",
      149, 169, "trusted", "Most Trusted", "Real strawberry fruit, classic favourite spread",
      12, IMG.kissamJam, "B07XKHQM1F", 4.3, 98765),
  ]
);

export const BRITANNIA_WHOLE_WHEAT_BREAD = item(
  "bfast_010", "Britannia 100% Whole Wheat Bread", "Britannia Industries",
  "Bread & Bakery", 55, 60, 1, "400g loaf",
  IMG.britanniaBrown, "B07WDHKQ1F", 4.4, 189234,
  "Best Seller",
  "100% atta — no maida, rich in fibre, perfect for sandwiches and toast",
  "Healthy whole wheat bread for breakfast", "Bread essential", 12,
  [
    sub("bfast_010_s1", "Britannia Classic Milk Bread 400g", "Britannia Industries",
      45, 50, "cheapest", "Best Value", "₹10 cheaper, soft milk bread classic for toast",
      10, IMG.britanniaBread, "B07PQV5T3F", 4.3, 145678),
  ]
);
