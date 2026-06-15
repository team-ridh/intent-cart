import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // MTR Ready-to-Eat
  mtrPBM:           CDN("71g+I6lZA4L"),  // MTR Paneer Butter Masala 300g
  mtrDal:           CDN("81bXvM-uBML"),  // MTR Dal Makhani 300g
  mtrRajma:         CDN("81MHpBXjppL"),  // MTR Rajma Masala 300g
  // Haldiram's Minute Khana
  haldiramPBhaji:   CDN("71DajhNITPL"),  // Haldiram's Pav Bhaji Minute Khana 300g
  haldiramChicken:  CDN("71tO4H-FOCL"),  // Haldiram's Chicken Biryani 250g
  // ITC Aashirvaad RTE
  itcChole:         CDN("71VoH7oImL"),   // ITC Aashirvaad Chole Masala 285g
  // Cup Noodles
  maggiCuppa:       CDN("71bfBxdCZmL"),  // Maggi Cuppa Mania Masala 70g
  yippeeCup:        CDN("71iCnP9BZNML"), // Yippee Cup Noodles Magic Masala
  // Noodles
  maggiMasala:      CDN("71dY5xCEXCL"),  // Maggi 2-Minute Noodles Masala 280g (4 packs)
  yippeeNoodles:    CDN("71lI5i6oDnL"),  // Yippee Magic Masala Noodles 280g
  waiWai:           CDN("71y4cnjsFwL"),  // Wai Wai Chicken Flavour Noodles 75g×6
  // Soups
  knorrTomato:      CDN("71XpbNiBMML"),  // Knorr Classic Cream of Tomato Soup 48g
  maggiVeg:         CDN("71dkNF0KX8L"),  // Maggi Vegetable Atta Noodles 4 pack
  // Dessert Mixes
  gitsGulab:        CDN("71dJkPQUHBL"),  // Gits Gulab Jamun Mix 200g
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Instant & Ready-to-Eat Food ──────────────────────────────────

export const MTR_PANEER_BUTTER_MASALA = item(
  "inst_001", "MTR Paneer Butter Masala — Ready to Eat", "MTR Foods (Orkla)",
  "Ready-to-Eat Meals", 115, 135, 1, "300g (2 servings)",
  IMG.mtrPBM, "B07WDHKN4I", 4.3, 145678,
  "Best Seller",
  "Restaurant-quality Paneer Butter Masala — heat and serve in 3 minutes. No preservatives, authentic North Indian recipe",
  "Quick restaurant-style Paneer Butter Masala for busy days", "RTE meal", 16,
  [
    sub("inst_001_s1", "MTR Dal Makhani 300g", "MTR Foods",
      115, 135, "trusted", "Most Trusted", "Slow-cooked black lentils in creamy tomato gravy — rich comfort meal",
      16, IMG.mtrDal, "B07XKHQM4I", 4.3, 123456),
    sub("inst_001_s2", "Haldiram's Pav Bhaji Minute Khana 300g", "Haldiram's",
      119, 139, "fastest", "Fastest", "Ready in 2 minutes — authentic Mumbai street food taste",
      14, IMG.haldiramPBhaji, "B07WDK5H4I", 4.2, 89234),
  ]
);

export const MTR_DAL_MAKHANI = item(
  "inst_002", "MTR Dal Makhani — Ready to Eat", "MTR Foods (Orkla)",
  "Ready-to-Eat Meals", 115, 135, 1, "300g (2 servings)",
  IMG.mtrDal, "B07WDHKQ4I", 4.3, 123456,
  "Amazon's Choice",
  "Slow-cooked black lentils (whole urad) in rich creamy tomato gravy — iconic Punjabi dal, ready in 3 minutes",
  "Creamy restaurant-style dal makhani in minutes", "RTE meal", 16,
  [
    sub("inst_002_s1", "MTR Rajma Masala 300g", "MTR Foods",
      115, 135, "trusted", "Most Trusted", "Kidney beans in spicy tomato curry — North Indian comfort food",
      16, IMG.mtrRajma, "B07XKHQE4I", 4.2, 89234),
    sub("inst_002_s2", "ITC Aashirvaad RTE Chole 285g", "ITC Foods",
      110, 129, "cheapest", "Best Value", "₹5 cheaper, authentic chana masala ready in 3 minutes",
      14, IMG.itcChole, "B07PQV5T4I", 4.2, 67890),
  ]
);

export const HALDIRAMS_PAV_BHAJI = item(
  "inst_003", "Haldiram's Pav Bhaji — Minute Khana", "Haldiram's",
  "Ready-to-Eat Meals", 119, 139, 1, "300g",
  IMG.haldiramPBhaji, "B07WDHKP4I", 4.2, 112345,
  "Amazon's Choice",
  "Mumbai-style pav bhaji — thick vegetable mash in buttery tomato gravy, ready in 2 minutes. Just heat and serve with pav",
  "Authentic Mumbai pav bhaji — quick street food at home", "RTE meal", 14,
  [
    sub("inst_003_s1", "MTR Paneer Butter Masala 300g", "MTR Foods",
      115, 135, "trusted", "Most Trusted", "Restaurant-quality PBM — richer, creamier alternative",
      16, IMG.mtrPBM, "B07WDHKN4I", 4.3, 145678),
    sub("inst_003_s2", "Gits Pav Bhaji Mix 100g", "Gits Food Products",
      79, 89, "cheapest", "Best Value", "₹40 cheaper, make-it-yourself pav bhaji masala mix",
      12, IMG.haldiramPBhaji, "B07XKHQM5I", 4.2, 67890),
  ]
);

export const MAGGI_CUPPA_MANIA = item(
  "inst_004", "Maggi Cuppa Mania Masala Noodles", "Nestle India",
  "Cup Noodles", 52, 60, 1, "70g cup",
  IMG.maggiCuppa, "B07XKHQT4I", 4.3, 189234,
  "Best Seller",
  "India's favourite 2-minute noodles in cup format — just add boiling water, ready in 2 minutes. Hot snack on the go",
  "Instant Maggi masala noodles in a ready-to-go cup", "Instant snack", 12,
  [
    sub("inst_004_s1", "Yippee Cup Noodles Magic Masala 70g", "ITC Foods",
      49, 56, "cheapest", "Best Value", "₹3 cheaper, smoky magic masala cup noodle",
      10, IMG.yippeeCup, "B07WDKH4TI", 4.2, 89234),
    sub("inst_004_s2", "Maggi Masala Noodles 4-pack 280g", "Nestle India",
      52, 60, "trusted", "Most Trusted", "Classic Maggi masala noodles — 4 servings, same iconic taste",
      12, IMG.maggiMasala, "B07XKHQM4I", 4.5, 456789),
  ]
);

export const MAGGI_INSTANT_4PK = item(
  "inst_005", "Maggi 2-Minute Masala Noodles", "Nestle India",
  "Instant Noodles", 52, 60, 1, "4 × 70g packs (280g)",
  IMG.maggiMasala, "B07WDHKN4I", 4.5, 567890,
  "Best Seller",
  "India's most iconic instant noodle — Masala tastemaker, ready in 2 minutes. Available in 70g×4 value pack",
  "Classic 2-minute Maggi masala noodles", "Instant noodles", 12,
  [
    sub("inst_005_s1", "Yippee Magic Masala Noodles 280g (4 packs)", "ITC Foods",
      52, 60, "trusted", "Most Trusted", "Longer noodles, smoky magic masala — ITC's Maggi rival",
      12, IMG.yippeeNoodles, "B07XKHQE5I", 4.4, 234567),
    sub("inst_005_s2", "Wai Wai Chicken Noodles 75g × 6", "CG Foods India",
      140, 159, "fastest", "Fastest", "Nepalese-origin crispy noodle — eat as is or cook, chicken flavour",
      12, IMG.waiWai, "B07WDK5H5I", 4.2, 89234),
  ]
);

export const YIPPEE_NOODLES = item(
  "inst_006", "Yippee Magic Masala Noodles", "ITC Foods",
  "Instant Noodles", 52, 60, 1, "4 × 70g packs (280g)",
  IMG.yippeeNoodles, "B07WDHKP4I", 4.4, 234567,
  "Amazon's Choice",
  "Longer noodles that don't clump — smoky Magic Masala tastemaker, ready in 2 minutes. Second most popular instant noodle in India",
  "Maggi rival with longer non-clumpy noodles", "Instant noodles", 12,
  [
    sub("inst_006_s1", "Maggi 2-Minute Masala 4-pack 280g", "Nestle India",
      52, 60, "trusted", "Most Trusted", "India's iconic original 2-minute masala noodles",
      12, IMG.maggiMasala, "B07WDHKN4I", 4.5, 567890),
  ]
);

export const KNORR_TOMATO_SOUP = item(
  "inst_007", "Knorr Classic Cream of Tomato Soup", "HUL",
  "Soups & Broths", 45, 52, 1, "48g (makes 2 cups)",
  IMG.knorrTomato, "B07WDHKQ4I", 4.2, 89234,
  "Best Seller",
  "Ready in 3 minutes — real tomato goodness, creamy and smooth, ideal as a starter or quick warm snack",
  "Instant creamy tomato soup for a quick meal", "Instant soup", 10,
  [
    sub("inst_007_s1", "Knorr Classic Mixed Vegetable Soup 44g", "HUL",
      45, 52, "trusted", "Most Trusted", "Hearty vegetable broth with 9 vegetables",
      10, IMG.knorrTomato, "B07XKHQM6I", 4.2, 67890),
    sub("inst_007_s2", "Maggi Masala Sauce Thick Soup 100g", "Nestle India",
      55, 65, "cheapest", "Best Value", "Thicker, heartier Maggi masala tomato-based soup",
      10, IMG.maggiMasala, "B07PQV5T3I", 4.1, 56789),
  ]
);

export const ITC_RTE_CHOLE = item(
  "inst_008", "ITC Aashirvaad Ready to Eat Chole Masala", "ITC Foods",
  "Ready-to-Eat Meals", 110, 129, 1, "285g (2 servings)",
  IMG.itcChole, "B07WDKH4TI", 4.2, 89234,
  "Amazon's Choice",
  "Authentic Punjabi-style chole — slow-cooked chickpeas in tangy masala gravy. Just heat and serve with rice, roti or bhatura",
  "Ready-to-eat Punjabi chole for quick meals", "RTE meal", 14,
  [
    sub("inst_008_s1", "MTR Chana Masala 300g", "MTR Foods",
      115, 135, "trusted", "Most Trusted", "Richer, spicier chana masala from MTR's authentic recipe",
      14, IMG.mtrPBM, "B07XKHQE6I", 4.3, 78234),
    sub("inst_008_s2", "Haldiram's Pav Bhaji Minute Khana 300g", "Haldiram's",
      119, 139, "fastest", "Fastest", "Mumbai street food — a change from chole",
      12, IMG.haldiramPBhaji, "B07WDHKP4I", 4.2, 112345),
  ]
);

export const GITS_GULAB_JAMUN = item(
  "inst_009", "Gits Gulab Jamun Mix", "Gits Food Products",
  "Dessert Mixes", 95, 109, 1, "200g (makes ~20 pieces)",
  IMG.gitsGulab, "B07WDHKN5I", 4.3, 89234,
  "Amazon's Choice",
  "Easy instant mix for authentic soft gulab jamuns — no kneading experience needed, just mix and fry. Restaurant-quality results",
  "Instant gulab jamun mix for quick Indian dessert", "Dessert mix", 14,
  [
    sub("inst_009_s1", "Gits Jalebi Mix 200g", "Gits Food Products",
      89, 99, "cheapest", "Best Value", "₹6 cheaper, crispy jalebi instant mix",
      12, IMG.gitsGulab, "B07XKHQM7I", 4.2, 56789),
    sub("inst_009_s2", "MTR Gulab Jamun Mix 200g", "MTR Foods",
      99, 115, "trusted", "Most Trusted", "MTR's well-known gulab jamun mix — soft and syrupy results",
      14, IMG.mtrPBM, "B07WDK5H6I", 4.3, 67890),
  ]
);

export const WAI_WAI_NOODLES = item(
  "inst_010", "Wai Wai Chicken Flavour Instant Noodles", "CG Foods India",
  "Instant Noodles", 140, 159, 1, "75g × 6 pack",
  IMG.waiWai, "B07WDKH5TI", 4.2, 78234,
  "Amazon's Choice",
  "Crispy, light Nepalese-origin noodles — eat straight from the pack or cook with the soup sachet. Unique chicken flavour",
  "Crispy chicken-flavour instant noodles — eat raw or cook", "Instant noodles", 10,
  [
    sub("inst_010_s1", "Maggi 2-Minute Masala Noodles 4-pack", "Nestle India",
      52, 60, "cheapest", "Best Value", "India's classic — hot masala noodles in 2 minutes",
      10, IMG.maggiMasala, "B07WDHKN4I", 4.5, 567890),
  ]
);
