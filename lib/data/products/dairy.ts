import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Milk
  amulTaaza:        CDN("71w5K+q2Y3L"),  // Amul Taaza Full Cream Milk 1L Tetra
  amulGold:         CDN("41hheOaj6bL"),  // Amul Gold Full Cream Milk 1L
  // Butter & Ghee
  amulButter:       CDN("71JKMaCNV5L"),  // Amul Pasteurised Butter 500g
  amulGhee:         CDN("71o3YHe9UML"),  // Amul Pure Ghee 500ml Tin
  motherGhee:       CDN("61ZYYrmeHuL"),  // Mother Dairy Pure Ghee 500ml
  // Cheese
  amulCheese:       CDN("41tHt+3R4RL"),  // Amul Processed Cheese Block 400g
  britanniaCheese:  CDN("71mFIV+pVhL"),  // Britannia Cheese Slices 10s
  goCheeseSlice:    CDN("715mUo0JKLL"),  // Go Cheese Singles 10s
  amulSpread:       CDN("71JKGP9K7LL"),  // Amul Cheese Spread Garlic 200g
  // Paneer
  amulPaneer:       CDN("71TKGCyU5AL"),  // Amul Fresh Paneer 200g
  motherPaneer:     CDN("71Z5YNRK5PL"),  // Mother Dairy Paneer 200g
  // Curd / Yogurt
  amulCurd:         CDN("71Bm9t4MKQL"),  // Amul Masti Curd 400g
  epigamia:         CDN("71WH8yMq6LL"),  // Epigamia Greek Yogurt Plain
  motherCurd:       CDN("71vkQIPz9LL"),  // Mother Dairy Curd 400g
  // Eggs
  keggFarm:         CDN("71oQ1PmMqgL"),  // Kegg Farm White Eggs
  nationalEggs:     CDN("71-UrxTYj7L"),  // National Eggs Brown Country Eggs
  // Flavoured Milk
  amulKool:         CDN("51Py8ECXrUL"),  // Amul Kool Chocolate Milk 200ml
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Dairy & Eggs ────────────────────────────────────────────────

export const DAIRY_MILK_AMUL_TAAZA = item(
  "dairy_001", "Amul Taaza Homogenised Toned Milk", "Amul (GCMMF)",
  "Milk", 68, 68, 2, "1L Tetra packs",
  IMG.amulTaaza, "B07WDHKN2D", 4.4, 189234,
  "Best Seller",
  "UHT processed, no preservatives — shelf-stable, consistent quality from India's most trusted dairy co-op",
  "Essential daily milk for tea, coffee and cooking", "Milk essential", 14,
  [
    sub("dairy_001_s1", "Amul Gold Full Cream Milk 1L (2 packs)", "Amul (GCMMF)",
      78, 78, "trusted", "Most Trusted", "Richer, creamier full-fat UHT milk — ideal for chai and desserts",
      14, IMG.amulGold, "B07XKHQM4D", 4.5, 145678),
    sub("dairy_001_s2", "Mother Dairy Toned Milk 1L Tetra (2 packs)", "Mother Dairy India",
      65, 65, "cheapest", "Best Value", "₹6 cheaper per pack, same toned milk quality",
      12, IMG.amulTaaza, "B07PQV5T8D", 4.3, 98765),
  ]
);

export const DAIRY_BUTTER_AMUL = item(
  "dairy_002", "Amul Pasteurised Butter", "Amul (GCMMF)",
  "Butter & Margarine", 265, 290, 1, "500g",
  IMG.amulButter, "B07WDHKP2D", 4.6, 345678,
  "Best Seller",
  "India's most beloved butter — churned from pasteurised cream, slight salt, perfect for toast and baking",
  "Daily butter for toast, cooking and baking", "Butter essential", 16,
  [
    sub("dairy_002_s1", "Amul Butter 100g", "Amul (GCMMF)",
      55, 60, "cheapest", "Best Value", "₹210 cheaper (100g portion) — trial size",
      14, IMG.amulButter, "B07XKHQE4D", 4.6, 289234),
    sub("dairy_002_s2", "Britannia Butter 500g", "Britannia Industries",
      275, 300, "trusted", "Most Trusted", "Creamier texture, slightly higher fat content",
      14, IMG.amulButter, "B07WDK5H4D", 4.4, 145678),
  ]
);

export const DAIRY_GHEE_AMUL = item(
  "dairy_003", "Amul Pure Ghee", "Amul (GCMMF)",
  "Ghee & Oils", 340, 395, 1, "500ml Tin",
  IMG.amulGhee, "B07WDHKQ4D", 4.6, 456789,
  "Best Seller",
  "Made from milk fat of pasteurised cream — granular texture, rich taste, BIS certified purity",
  "Pure cow ghee for cooking and tempering", "Ghee essential", 16,
  [
    sub("dairy_003_s1", "Mother Dairy Pure Ghee 500ml", "Mother Dairy India",
      329, 379, "trusted", "Most Trusted", "Desi cow ghee, rich aroma, granular crystallisation",
      16, IMG.motherGhee, "B07XKHQM2D", 4.5, 234567),
    sub("dairy_003_s2", "Patanjali Cow Ghee 500ml", "Patanjali Ayurved",
      295, 345, "cheapest", "Best Value", "₹45 cheaper, 100% pure cow ghee, Ayurvedic certified",
      14, IMG.amulGhee, "B07PQV5T6D", 4.3, 123456),
  ]
);

export const BRITANNIA_CHEESE_SLICES = item(
  "dairy_004", "Britannia Cheese Slices", "Britannia Industries",
  "Cheese", 159, 179, 1, "pack of 10 slices",
  IMG.britanniaCheese, "B07WDHKN6D", 4.4, 234567,
  "Best Seller",
  "Processed cheddar cheese slices — perfect for sandwiches, burgers and wraps, individually wrapped",
  "Cheese slices for sandwiches and toasted bread", "Cheese essential", 14,
  [
    sub("dairy_004_s1", "Amul Processed Cheese Block 400g", "Amul (GCMMF)",
      349, 399, "trusted", "Most Trusted", "Block cheese to grate/slice yourself, richer flavour",
      16, IMG.amulCheese, "B07XKHQT4D", 4.5, 178234),
    sub("dairy_004_s2", "Go Cheese Singles 10s", "Parag Milk Foods",
      149, 169, "cheapest", "Best Value", "₹10 cheaper, same size, gouda-processed singles",
      12, IMG.goCheeseSlice, "B07WDK5H5D", 4.3, 98765),
  ]
);

export const AMUL_PANEER = item(
  "dairy_005", "Amul Fresh Paneer", "Amul (GCMMF)",
  "Paneer & Tofu", 95, 110, 1, "200g",
  IMG.amulPaneer, "B07XKHQE5D", 4.3, 145678,
  "Amazon's Choice",
  "Fresh cottage cheese made from full cream milk — soft, crumbly texture ideal for curries and tikkas",
  "Essential paneer for Indian cooking", "Paneer essential", 16,
  [
    sub("dairy_005_s1", "Mother Dairy Paneer 200g", "Mother Dairy India",
      89, 99, "trusted", "Most Trusted", "Slightly firmer texture, good for grilling and tikka",
      16, IMG.motherPaneer, "B07WDKH3TD", 4.3, 112345),
    sub("dairy_005_s2", "Amul Malai Paneer 200g", "Amul (GCMMF)",
      99, 115, "cheapest", "Best Value", "Softer malai (cream) paneer, dissolves in mouth",
      14, IMG.amulPaneer, "B07PQV5T4D", 4.4, 89234),
  ]
);

export const MOTHER_DAIRY_CURD = item(
  "dairy_006", "Mother Dairy Mishti Doi / Set Dahi Curd", "Mother Dairy India",
  "Curd & Yogurt", 65, 72, 1, "400g",
  IMG.motherCurd, "B07WDHKP5D", 4.4, 123456,
  "Best Seller",
  "Thick, creamy set curd — no stabilisers, live cultures for digestion, ideal for raita and lassi",
  "Fresh curd for raita, curd rice and daily consumption", "Curd essential", 12,
  [
    sub("dairy_006_s1", "Amul Masti Curd 400g", "Amul (GCMMF)",
      62, 70, "trusted", "Most Trusted", "Thick set curd, slightly tangier, popular in Gujarat and Maharashtra",
      12, IMG.amulCurd, "B07XKHQM5D", 4.4, 189234),
    sub("dairy_006_s2", "Epigamia Greek Yogurt Plain 200g", "Drums Food International",
      65, 72, "trusted", "Most Trusted", "Strained Greek yogurt — high protein, thick, probiotic-rich",
      14, IMG.epigamia, "B07WDKH5TD", 4.4, 78923),
  ]
);

export const EPIGAMIA_GREEK_YOGURT = item(
  "dairy_007", "Epigamia Greek Yogurt — Plain", "Drums Food International",
  "Greek Yogurt", 65, 75, 2, "200g tubs",
  IMG.epigamia, "B07XKHQT5D", 4.4, 89234,
  "Amazon's Choice",
  "High-protein strained yogurt with live probiotic cultures — no added sugar, thick creamy texture",
  "Premium probiotic yogurt for healthy snacking", "Healthy dairy", 14,
  [
    sub("dairy_007_s1", "Epigamia Vanilla Honey Greek Yogurt 200g", "Drums Food International",
      75, 85, "trusted", "Most Trusted", "Lightly sweetened with honey, good breakfast yogurt",
      14, IMG.epigamia, "B07PQV4T4D", 4.3, 56789),
  ]
);

export const EGGS_12 = item(
  "dairy_008", "Kegg Farm Table Eggs (White)", "Kegg Farms India",
  "Eggs", 108, 120, 1, "pack of 12",
  IMG.keggFarm, "B07WDHKP6D", 4.3, 89234,
  "Amazon's Choice",
  "Farm-fresh white eggs — grade A, vaccinated hens, consistent size, ideal for cooking and baking",
  "Fresh eggs for daily cooking, baking and breakfast", "Egg essential", 14,
  [
    sub("dairy_008_s1", "Country Chicken Brown Eggs 12s", "Local Farm Produce",
      129, 145, "trusted", "Most Trusted", "Free-range country chicken eggs — richer yolk, desi flavour",
      16, IMG.nationalEggs, "B07XKHQE6D", 4.2, 45678),
  ]
);

export const AMUL_CHEESE_SPREAD = item(
  "dairy_009", "Amul Cheese Spread — Garlic & Herbs", "Amul (GCMMF)",
  "Cheese", 89, 99, 1, "200g",
  IMG.amulSpread, "B07XKHQM6D", 4.3, 78234,
  "Amazon's Choice",
  "Spreadable processed cheese with garlic & herbs — perfect on toast, roti, pasta or as a dip",
  "Flavoured cheese spread for toast and snacks", "Cheese spread", 12,
  [
    sub("dairy_009_s1", "Amul Cheese Spread Plain 200g", "Amul (GCMMF)",
      79, 89, "cheapest", "Best Value", "₹10 cheaper, plain flavour for versatile use",
      10, IMG.amulSpread, "B07PQV5T2D", 4.3, 67234),
  ]
);

export const AMUL_KOOL = item(
  "dairy_010", "Amul Kool Chocolate Milk", "Amul (GCMMF)",
  "Flavoured Milk", 30, 35, 6, "200ml cartons",
  IMG.amulKool, "B07WDKH4TD", 4.3, 112345,
  "Best Seller",
  "Chilled chocolate-flavoured milk — pasteurised, ready to drink, no artificial colours",
  "Ready-to-drink chocolate milk", "Flavoured milk", 12,
  [
    sub("dairy_010_s1", "Amul Kool Rose Flavoured Milk 6×200ml", "Amul (GCMMF)",
      180, 210, "trusted", "Most Trusted", "Rose-cardamom flavoured chilled milk — refreshing",
      10, IMG.amulKool, "B07XKHQM7D", 4.2, 67890),
  ]
);
