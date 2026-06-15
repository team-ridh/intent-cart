import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Frozen Snacks
  mccainFries:      CDN("71g+I1lZA4L"),  // McCain French Fries Classic Salted 420g
  mccainSmiles:     CDN("81bXvM-uWML"),  // McCain Smiles Potato 415g
  mccainTikki:      CDN("81MHpBXjkkL"),  // McCain Aloo Tikki 400g
  sumruMomos:       CDN("71DajhNIOPL"),  // Sumeru Veg Momos 450g
  itcNuggets:       CDN("71tO4H-FNXL"),  // ITC Master Chef Veg Nuggets 250g
  itcChicken:       CDN("71VoH3oHmL"),   // ITC Master Chef Chicken Nuggets 250g
  haldiramSamosa:   CDN("71bfBxdxZmL"),  // Haldiram's Frozen Samosa 400g
  vadilalPeas:      CDN("71iCnP9BZMGL"), // Vadilal Frozen Green Peas 500g
  nandiniParatha:   CDN("71dY5xC9xCL"),  // Frozen Lachha Paratha
  safaSpinach:      CDN("71lI5i1oDnL"),  // Safal Frozen Spinach 500g
  frozenCorn:       CDN("71y4cnjoBwL"),  // Sumeru Sweet Corn 500g
  mccainBites:      CDN("71XpbNhxMML"),  // McCain Chilli Garlic Bites 400g
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Frozen Food ──────────────────────────────────────────────────

export const MCCAIN_FRENCH_FRIES = item(
  "frz_001", "McCain French Fries Classic Salted", "McCain Foods India",
  "Frozen Snacks", 145, 169, 1, "420g",
  IMG.mccainFries, "B07WDHKP4Z", 4.3, 156782,
  "Best Seller",
  "Crispy golden French fries made from 100% real potatoes — no artificial colours or preservatives",
  "Ready-to-fry crispy golden fries in 15 minutes", "Frozen snack", 20,
  [
    sub("frz_001_s1", "McCain Smiles Potato Snacks 415g", "McCain Foods India",
      155, 175, "trusted", "Most Trusted", "Smiley-shaped potato bites — loved by kids, crispy outside soft inside",
      20, IMG.mccainSmiles, "B07XKHQM4Z", 4.4, 112345),
    sub("frz_001_s2", "McCain Chilli Garlic Bites 400g", "McCain Foods India",
      165, 189, "fastest", "Fastest", "Spiced potato bites with chilli & garlic — great party snack",
      20, IMG.mccainBites, "B07WDK5H4Z", 4.3, 89234),
  ]
);

export const MCCAIN_SMILES = item(
  "frz_002", "McCain Smiles Potato Snacks", "McCain Foods India",
  "Frozen Snacks", 155, 175, 1, "415g",
  IMG.mccainSmiles, "B07WDHKP5Z", 4.4, 189234,
  "Best Seller",
  "Smiley-face shaped potato snacks — 100% real potatoes, no artificial colours, crispy in air fryer or oven",
  "Fun potato snacks for kids and families", "Kids frozen snack", 20,
  [
    sub("frz_002_s1", "McCain French Fries 420g", "McCain Foods India",
      145, 169, "cheapest", "Best Value", "₹10 cheaper, classic fries format",
      20, IMG.mccainFries, "B07WDHKP4Z", 4.3, 156782),
    sub("frz_002_s2", "Haldiram's Frozen Samosa 400g", "Haldiram's",
      185, 215, "trusted", "Most Trusted", "Authentic potato & pea samosas — Indian snack classic",
      22, IMG.haldiramSamosa, "B07PQV5T4Z", 4.4, 67890),
  ]
);

export const SUMERU_VEG_MOMOS = item(
  "frz_003", "Sumeru Veg Momos", "Innovative Foods (Sumeru)",
  "Frozen Snacks", 155, 175, 1, "450g (~20 pieces)",
  IMG.sumruMomos, "B07WDHKQ2Z", 4.2, 89234,
  "Amazon's Choice",
  "Steamed veg momos with cabbage, carrots & spices — authentic Tibetan-style dumplings, ready in 10 minutes",
  "Quick-steam veg momos for a snack or meal", "Frozen snack", 20,
  [
    sub("frz_003_s1", "ITC Master Chef Veg Nuggets 250g", "ITC Foods",
      175, 199, "trusted", "Most Trusted", "Crispy breaded veg nuggets — dip-ready, oven or deep-fry",
      20, IMG.itcNuggets, "B07XKHQE4Z", 4.2, 56789),
    sub("frz_003_s2", "McCain French Fries 420g", "McCain Foods India",
      145, 169, "cheapest", "Best Value", "₹10 cheaper per snack serving, simpler to prepare",
      18, IMG.mccainFries, "B07WDHKP4Z", 4.3, 156782),
  ]
);

export const ITC_CHICKEN_NUGGETS = item(
  "frz_004", "ITC Master Chef Chicken Nuggets", "ITC Foods",
  "Frozen Non-Veg", 275, 319, 1, "250g",
  IMG.itcChicken, "B07WDHKN5Z", 4.2, 67890,
  "Amazon's Choice",
  "Juicy chicken minced nuggets in crispy breading — quality ITC brand, ready in 10 minutes in an air fryer",
  "Crispy chicken nuggets for quick meals", "Non-veg frozen snack", 22,
  [
    sub("frz_004_s1", "ITC Master Chef Veg Nuggets 250g", "ITC Foods",
      175, 199, "cheapest", "Best Value", "₹100 cheaper, veg alternative with same crispy coating",
      20, IMG.itcNuggets, "B07XKHQE4Z", 4.2, 56789),
  ]
);

export const HALDIRAMS_FROZEN_SAMOSA = item(
  "frz_005", "Haldiram's Frozen Samosa", "Haldiram's",
  "Frozen Snacks", 185, 215, 1, "400g (~12 pieces)",
  IMG.haldiramSamosa, "B07WDHKP6Z", 4.4, 112345,
  "Best Seller",
  "Classic aloo-matar samosas — authentic Haldiram's spice blend, crispy shell, just deep-fry or air-fry",
  "Authentic samosas for snack time or chai", "Indian frozen snack", 22,
  [
    sub("frz_005_s1", "McCain Aloo Tikki 400g", "McCain Foods India",
      145, 169, "cheapest", "Best Value", "₹40 cheaper, potato tikki for chaat or burgers",
      20, IMG.mccainTikki, "B07XKHQM5Z", 4.3, 89234),
    sub("frz_005_s2", "Sumeru Veg Momos 450g", "Sumeru",
      155, 175, "trusted", "Most Trusted", "Steamed momos — lighter and healthier alternative",
      20, IMG.sumruMomos, "B07WDHKQ2Z", 4.2, 89234),
  ]
);

export const VADILAL_FROZEN_PEAS = item(
  "frz_006", "Vadilal Frozen Green Peas", "Vadilal Industries",
  "Frozen Vegetables", 75, 89, 1, "500g",
  IMG.vadilalPeas, "B07XKHQT4Z", 4.2, 78234,
  "Amazon's Choice",
  "IQF (Individually Quick Frozen) green peas — snap-frozen to preserve nutrition, no blanching needed",
  "Quick frozen peas for pav bhaji, mutter paneer, rice", "Frozen vegetable", 18,
  [
    sub("frz_006_s1", "Sumeru Sweet Corn Kernels 500g", "Sumeru",
      89, 99, "trusted", "Most Trusted", "IQF sweet corn, great for soups, salads and stir-fries",
      18, IMG.frozenCorn, "B07WDKH5TZ", 4.2, 56789),
    sub("frz_006_s2", "Safal Frozen Spinach 500g", "Safal Foods",
      79, 89, "cheapest", "Best Value", "₹4 cheaper, blanched spinach for palak dishes",
      16, IMG.safaSpinach, "B07PQV5T3Z", 4.1, 45678),
  ]
);

export const FROZEN_PARATHA = item(
  "frz_007", "Frozen Lachha Paratha — Ready to Cook", "Kawan Food / Vadilal",
  "Frozen Breads", 129, 149, 1, "pack of 5",
  IMG.nandiniParatha, "B07XKHQE5Z", 4.1, 67890,
  "Amazon's Choice",
  "Layered Lachha parathas — pre-cooked, just heat on tawa for 3 minutes, no rolling needed",
  "Instant flaky parathas for quick meals", "Frozen bread", 18,
  [
    sub("frz_007_s1", "Kawan Paratha Onion 5s", "Kawan Food",
      135, 155, "trusted", "Most Trusted", "Onion stuffed parathas — restaurant quality at home",
      18, IMG.nandiniParatha, "B07WDKH6TZ", 4.2, 56789),
  ]
);

export const MCCAIN_ALOO_TIKKI = item(
  "frz_008", "McCain Aloo Tikki", "McCain Foods India",
  "Frozen Snacks", 145, 165, 1, "400g (~8 pieces)",
  IMG.mccainTikki, "B07WDHKQ3Z", 4.3, 89234,
  "Amazon's Choice",
  "Crispy spiced potato patties — perfect for burger, chaat or as a standalone snack with chutney",
  "Classic Indian potato tikki in minutes", "Frozen snack", 20,
  [
    sub("frz_008_s1", "Haldiram's Frozen Samosa 400g", "Haldiram's",
      185, 215, "trusted", "Most Trusted", "Indian samosa alternative — authentic masala flavour",
      22, IMG.haldiramSamosa, "B07WDHKP6Z", 4.4, 112345),
  ]
);

export const SAFAL_FROZEN_SPINACH = item(
  "frz_009", "Safal Frozen Spinach Chopped", "Safal Foods",
  "Frozen Vegetables", 79, 89, 1, "500g",
  IMG.safaSpinach, "B07WDKH7TZ", 4.1, 56789,
  "",
  "Blanched and snap-frozen spinach — no washing or chopping, retains 95% of nutrients. Perfect for palak paneer",
  "Instant spinach for palak dishes and smoothies", "Frozen vegetable", 16,
  [], false, false
);

export const SUMERU_SWEET_CORN = item(
  "frz_010", "Sumeru Sweet Corn Kernels", "Innovative Foods (Sumeru)",
  "Frozen Vegetables", 89, 99, 1, "500g",
  IMG.frozenCorn, "B07WDHKP7Z", 4.2, 67890,
  "",
  "IQF sweet corn — golden, naturally sweet, perfect for soups, salads, pasta and Mexican dishes",
  "Frozen corn for quick cooking", "Frozen vegetable", 16,
  [], false, true
);
