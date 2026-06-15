import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Namkeen & Bhujia
  haldiramBhujia:   CDN("71yRxsNpL6L"),  // Haldiram's Aloo Bhujia 1kg
  haldiramNavratan: CDN("81bXvM-uYML"),  // Haldiram's Navrattan Mixture 400g
  bikajiBlack:      CDN("71POi2z2mhL"),  // Bikaji Bikaneri Bhujia 400g
  leharMixture:     CDN("71Vyn4VPg-L"),  // Lehar Namkeen Mixture
  // Biscuits & Cookies
  parleG:           CDN("71tO4H-FNZL"),  // Parle-G Original Glucose Biscuits
  oreo:             CDN("61XPqdX0AjL"),   // Oreo Original Cream Biscuits 300g
  britanniaMarie:   CDN("71kOonbY70L"),  // Britannia Marie Gold 250g
  goodDay:          CDN("81bzlTP62UL"), // Britannia Good Day Cashew 600g
  // Chips
  laysClassic:      CDN("91-oWEIaz8L"),  // Lay's Classic Salted
  bingo:            CDN("71lI5i3oDnL"),  // Bingo Mad Angles
  // Chocolates
  dairyMilkSilk:    CDN("61LojzJ+PuL"),  // Cadbury Dairy Milk Silk 143g
  kitkat:           CDN("61yA+W2uCiL"),  // KitKat 4-Finger 41.5g×3
  fiveStarSoft:     CDN("71dkNF0IX8L"),  // Cadbury 5 Star Soft 22g×12
  // Healthy Snacks
  makhana:          CDN("71dJkPQSHBL"),  // Phogat Roasted Makhana 100g
  trueElementsMix:  CDN("71uoadMXYJL"),  // True Elements Healthy Trail Mix
  // Popcorn
  boppop:           CDN("71ep98Zhk9L"),  // Boppop Microwave Popcorn
  aactiv:           CDN("71ep98Zhk9L"),   // ACT II Instant Popcorn
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Snacks & Munchies ────────────────────────────────────────────

export const HALDIRAMS_ALOO_BHUJIA = item(
  "snack_001", "Haldiram's Aloo Bhujia", "Haldiram's",
  "Namkeen & Bhujia", 249, 285, 1, "1 kg",
  IMG.haldiramBhujia, "B012S2KIGS", 4.4, 4992,
  "Best Seller",
  "Crispy, golden potato bhujia with authentic spices — India's most popular namkeen snack, perfect with chai",
  "Crunchy namkeen for snacking or chai time", "Snack essential", 14,
  [
    sub("snack_001_s1", "Bikaji Bikaneri Bhujia 400g", "Bikaji Foods",
      149, 169, "trusted", "Most Trusted", "Authentic Rajasthani bhujia — finer, crispier texture from Bikaner",
      12, IMG.bikajiBlack, "B07XKHQM4S", 4.4, 145678),
    sub("snack_001_s2", "Haldiram's Navrattan Mixture 400g", "Haldiram's",
      99, 115, "cheapest", "Best Value", "₹150 cheaper, mixed namkeen with peanuts, sev and fried dals",
      12, IMG.haldiramNavratan, "B07WDK5H4S", 4.4, 112345),
  ]
);

export const HALDIRAMS_MIXTURE = item(
  "snack_002", "Haldiram's Navrattan Mixture", "Haldiram's",
  "Namkeen & Bhujia", 99, 115, 1, "400g",
  IMG.haldiramNavratan, "B012S2KIGS", 4.4, 4992,
  "Best Seller",
  "Classic savoury mix of sev, fried peanuts, cornflakes, dal moth and cashews — a celebration in every bite",
  "Mixed namkeen snack for evenings", "Namkeen essential", 12,
  [
    sub("snack_002_s1", "Haldiram's Aloo Bhujia 200g", "Haldiram's",
      65, 75, "trusted", "Most Trusted", "Pure potato bhujia — simpler, classic snack",
      12, IMG.haldiramBhujia, "B07XKHQE4S", 4.5, 234567),
    sub("snack_002_s2", "Lehar Kurkure Mix 80g×6", "PepsiCo India",
      120, 138, "cheapest", "Best Value", "₹21 cheaper, crunchy corn puffs namkeen — variety pack",
      10, IMG.leharMixture, "B07PQV5T4S", 4.2, 89234),
  ]
);

export const PARLE_G_ORIGINAL = item(
  "snack_003", "Parle-G Original Glucose Biscuits", "Parle Products",
  "Biscuits & Cookies", 80, 80, 1, "828g (value pack)",
  IMG.parleG, "B00C4X841S", 4.4, 3938,
  "Best Seller",
  "World's largest-selling biscuit — glucose biscuits with mild sweetness, eaten with chai across all of India",
  "Classic tea biscuit staple", "Biscuit essential", 10,
  [
    sub("snack_003_s1", "Britannia Marie Gold 250g", "Britannia Industries",
      35, 40, "trusted", "Most Trusted", "Light, crispy Marie biscuit — great with morning tea",
      10, IMG.britanniaMarie, "B07XKHQM3S", 4.4, 234567),
    sub("snack_003_s2", "Britannia Good Day Cashew 600g", "Britannia Industries",
      125, 145, "cheapest", "Best Value", "Premium cashew-flavoured cookies — also great with chai",
      12, IMG.goodDay, "B07WDK5H5S", 4.4, 189234),
  ]
);

export const OREO_ORIGINAL = item(
  "snack_004", "Oreo Original Cream Biscuits", "Mondelez India",
  "Biscuits & Cookies", 105, 120, 1, "300g",
  IMG.oreo, "B07XKHQT4S", 4.5, 389234,
  "Best Seller",
  "The world's favourite sandwich cookie — chocolate wafer with sweet cream filling, twist, lick and dunk tradition",
  "Premium chocolate cream biscuit for snacking", "Biscuit snack", 12,
  [
    sub("snack_004_s1", "Oreo Strawberry Flavour 300g", "Mondelez India",
      105, 120, "trusted", "Most Trusted", "Strawberry cream flavour Oreo — kids' favourite variant",
      12, IMG.oreo, "B07WDKH4TS", 4.4, 156782),
    sub("snack_004_s2", "Parle-G Original 828g", "Parle Products",
      80, 80, "cheapest", "Best Value", "₹25 cheaper, classic Indian tea biscuit",
      10, IMG.parleG, "B07WDHKQ3S", 4.6, 567891),
  ]
);

export const BIKAJI_BHUJIA = item(
  "snack_005", "Bikaji Bikaneri Bhujia", "Bikaji Foods International",
  "Namkeen & Bhujia", 149, 169, 1, "400g",
  IMG.bikajiBlack, "B07WDHKP4S", 4.4, 178234,
  "Amazon's Choice",
  "Authentic Rajasthani bikaneri bhujia from Bikaner — fine, crinkly and spiced with black pepper and cardamom",
  "Authentic Rajasthani bhujia for chai time", "Snack essential", 12,
  [
    sub("snack_005_s1", "Haldiram's Aloo Bhujia 1kg", "Haldiram's",
      249, 285, "trusted", "Most Trusted", "Potato bhujia, larger pack, thicker texture",
      12, IMG.haldiramBhujia, "B07WDHKN3S", 4.5, 289234),
  ]
);

export const CADBURY_DAIRY_MILK = item(
  "snack_006", "Cadbury Dairy Milk Silk Chocolate Bar", "Mondelez India",
  "Chocolates", 185, 215, 1, "245g",
  IMG.dairyMilkSilk, "B0721MLS73", 4.4, 6935,
  "Best Seller",
  "Smooth, velvety milk chocolate — thick, premium bar that melts in your mouth. India's most loved chocolate",
  "Premium milk chocolate for gifting or indulging", "Chocolate treat", 14,
  [
    sub("snack_006_s1", "Cadbury 5 Star Soft 22g×12", "Mondelez India",
      99, 115, "cheapest", "Best Value", "₹86 cheaper, caramel nougat bars — softer chew",
      12, IMG.fiveStarSoft, "B07XKHQM5S", 4.4, 189234),
    sub("snack_006_s2", "KitKat 4-Finger Chocolate (3 bars)", "Nestle India",
      75, 90, "trusted", "Most Trusted", "Crispy wafer with milk chocolate — iconic break bar",
      12, IMG.kitkat, "B07WDK5H6S", 4.5, 234567),
  ]
);

export const ROASTED_MAKHANA = item(
  "snack_007", "Farmley Roasted Makhana (Lotus Seeds) — Classic Salted", "Farmley",
  "Healthy Snacks", 125, 149, 1, "100g",
  IMG.makhana, "B07XKHQE5S", 4.3, 89234,
  "Amazon's Choice",
  "Roasted fox nuts (makhana) with light salt — low calorie, high protein, crunchy Ayurvedic superfood snack",
  "Light, healthy makhana snack for any time", "Healthy snack", 14,
  [
    sub("snack_007_s1", "True Elements Healthy Trail Mix 150g", "True Elements",
      179, 215, "trusted", "Most Trusted", "Almonds, cashews, raisins — balanced energy mix",
      14, IMG.trueElementsMix, "B07WDKH5TS", 4.3, 67890),
    sub("snack_007_s2", "Lay's Classic Salted Chips 52g×6", "PepsiCo India",
      150, 174, "cheapest", "Best Value", "₹25 cheaper, crunchy chips variety snack",
      10, IMG.laysClassic, "B07PQV5T5S", 4.4, 345678),
  ]
);

export const ACT2_POPCORN = item(
  "snack_008", "ACT II Instant Popcorn — Butter Flavour", "Agro Tech Foods",
  "Popcorn & Puffed Snacks", 75, 89, 1, "3-bag microwave pack",
  IMG.aactiv, "B07WDHKP5S", 4.2, 112345,
  "Best Seller",
  "Ready in 2 minutes in a microwave — light, fluffy popcorn with real butter flavour. Movie snack favourite",
  "Quick microwave popcorn for movie nights", "Movie snack", 12,
  [
    sub("snack_008_s1", "Boppop Butter Popcorn Bags 3-pack", "Boppop",
      99, 119, "trusted", "Most Trusted", "Smaller batch, more gourmet butter flavour",
      12, IMG.boppop, "B07XKHQM6S", 4.3, 67890),
  ]
);

export const LAYS_CHIPS = item(
  "snack_009", "Lay's Classic Salted Potato Chips", "PepsiCo India",
  "Chips & Crisps", 150, 174, 1, "6 pack × 26g",
  IMG.laysClassic, "B07WDHKQ4S", 4.4, 345678,
  "Best Seller",
  "Thin, crispy potato chips with perfect salted flavour — the world's #1 potato chip brand",
  "Classic party chips for any occasion", "Chips snack", 12,
  [
    sub("snack_009_s1", "Bingo Mad Angles Achaari Masti 6 pack", "ITC India",
      130, 150, "cheapest", "Best Value", "₹20 cheaper, triangular corn crisps with tangy achaar masala",
      10, IMG.bingo, "B07XKHQE6S", 4.3, 189234),
    sub("snack_009_s2", "Haldiram's Aloo Bhujia 200g", "Haldiram's",
      69, 79, "trusted", "Most Trusted", "Traditional Indian namkeen alternative",
      12, IMG.haldiramBhujia, "B07XKHQE4S", 4.5, 234567),
  ]
);

export const KITKAT_BARS = item(
  "snack_010", "KitKat 4-Finger Chocolate Bar", "Nestle India",
  "Chocolates", 75, 90, 3, "41.5g bars",
  IMG.kitkat, "B09JP88HNR", 4.5, 160,
  "Best Seller",
  "Crispy wafer layers coated in smooth milk chocolate — 'Have a break, have a KitKat'. A global icon",
  "Crispy chocolate wafer bar for a quick treat", "Chocolate snack", 12,
  [
    sub("snack_010_s1", "Cadbury 5 Star Soft 22g×12", "Mondelez India",
      99, 115, "trusted", "Most Trusted", "Caramel-nougat bars — softer, chewier chocolate treat",
      12, IMG.fiveStarSoft, "B07XKHQM5S", 4.4, 189234),
    sub("snack_010_s2", "Cadbury Dairy Milk 30g×8", "Mondelez India",
      149, 170, "cheapest", "Best Value", "Classic milk chocolate bites — pure chocolate indulgence",
      12, IMG.dairyMilkSilk, "B07PQV5T6S", 4.5, 345678),
  ]
);
