import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Wheat flour (Atta)
  aashirvaad:       CDN("71+ZAUgr8vL"),  // Aashirvaad Select Sharbati Atta 5kg
  pillsbury:        CDN("71+ZAUgr8vL"),  // Pillsbury Chakki Fresh Atta 5kg
  // Rice
  indiaGate:        CDN("71W1XCVDlML"),  // India Gate Basmati Rice Classic 5kg
  daawat:           CDN("61hI83GWpzL"),  // Daawat Rozana Basmati 5kg
  // Dal (Pulses)
  tataSampannChana: CDN("71kTgq5+tQL"),  // Tata Sampann Chana Dal 1kg
  tataSampannMoong: CDN("61KkFKuWV4L"),  // Tata Sampann Moong Dal 1kg
  tataSampannToor:  CDN("61KkFKuWV4L"),  // Tata Sampann Toor Dal 1kg
  // Cooking Oil
  fortuneSunflower: CDN("612ivkXZObL"),  // Fortune Sunflower Refined Oil 1L
  fortuneMustard:   CDN("71WI8yNq6LL"),  // Fortune Kachi Ghani Mustard Oil 1L
  dharaMustard:     CDN("518+dxn1xZL"),  // Dhara Mustard Oil 1L Pouch
  // Salt & Sugar
  tataSalt:         CDN("71oR1PnMqgL"),  // Tata Salt Iodised 1kg
  tataSugar:        CDN("71-VrxTZj7L"),  // Tata Sugar 5kg
  // Spices & Masala
  everestGaram:     CDN("81uv9-YZ+bL"),  // Everest Garam Masala 100g
  catchTurmeric:    CDN("71g3a5tPj0L"),  // Catch Turmeric Powder 200g
  mdhChana:         CDN("81rq2ma2OmL"),  // MDH Chana Masala 100g
  tataSampannSpice: CDN("611f8vOFr3L"),  // Tata Sampann Spices Combo
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Grocery Staples — Atta, Rice, Dal, Oil, Salt, Masala ────────

export const AASHIRVAAD_ATTA = item(
  "stpl_001", "Aashirvaad Select Sharbati Atta", "ITC Limited",
  "Atta & Flour", 285, 320, 1, "5 kg",
  IMG.aashirvaad, "B01M5DMNPQ", 4.5, 456789,
  "Best Seller",
  "Made from 100% Sharbati wheat from Sehore — finest grains selected for softer, tastier rotis that stay soft longer",
  "Daily wheat flour for rotis and chapatis", "Atta essential", 22,
  [
    sub("stpl_001_s1", "Pillsbury Chakki Fresh Atta 5kg", "General Mills India",
      265, 299, "trusted", "Most Trusted", "Stone-ground chakki atta — natural bran and germ retained",
      20, IMG.pillsbury, "B07WDKH4TA", 4.4, 234567),
    sub("stpl_001_s2", "Fortune Chakki Fresh Atta 5kg", "Adani Wilmar",
      255, 285, "cheapest", "Best Value", "₹30 cheaper, good quality chakki ground atta",
      20, IMG.pillsbury, "B07PQV5T8A", 4.3, 189234),
  ]
);

export const INDIA_GATE_BASMATI = item(
  "stpl_002", "India Gate Basmati Rice — Classic", "KRBL Limited",
  "Rice & Grains", 555, 625, 1, "5 kg",
  IMG.indiaGate, "B0BBF1FT93", 3.7, 711,
  "Best Seller",
  "Long-grain aged basmati rice with naturally aromatic flavour — stays fluffy and separate after cooking",
  "Premium aged basmati rice for daily meals", "Rice essential", 22,
  [
    sub("stpl_002_s1", "Daawat Rozana Basmati Rice 5kg", "LT Foods",
      499, 565, "trusted", "Most Trusted", "Everyday basmati, quick-cook, good for pressure cooker use",
      22, IMG.daawat, "B07XKHQM4A", 4.4, 234567),
    sub("stpl_002_s2", "Fortune Sona Masoori Rice 5kg", "Adani Wilmar",
      389, 445, "cheapest", "Best Value", "₹166 cheaper, South Indian variety — ideal for rice dishes & biryani",
      20, IMG.daawat, "B07PQV5T6A", 4.3, 178234),
  ]
);

export const TATA_SAMPANN_CHANA_DAL = item(
  "stpl_003", "Tata Sampann Chana Dal", "Tata Consumer Products",
  "Pulses & Dal", 135, 155, 1, "1 kg",
  IMG.tataSampannChana, "B07WDHKN4A", 4.4, 189234,
  "Best Seller",
  "Unpolished chana dal — retains natural proteins and fibre, no added colours, sourced from best farms",
  "High-protein chana dal for dal fry and curries", "Dal essential", 20,
  [
    sub("stpl_003_s1", "Tata Sampann Moong Dal 1kg", "Tata Consumer Products",
      145, 169, "trusted", "Most Trusted", "Unpolished split moong — easy to digest, ideal for soups and khichdi",
      18, IMG.tataSampannMoong, "B07XKHQE4A", 4.4, 145678),
    sub("stpl_003_s2", "Tata Sampann Toor Dal 1kg", "Tata Consumer Products",
      149, 172, "fastest", "Fastest", "Best for sambar and everyday South Indian dal",
      18, IMG.tataSampannToor, "B07WDK5H4A", 4.4, 167234),
  ]
);

export const TATA_SAMPANN_MOONG_DAL = item(
  "stpl_004", "Tata Sampann Moong Dal", "Tata Consumer Products",
  "Pulses & Dal", 145, 169, 1, "1 kg",
  IMG.tataSampannMoong, "B07WDHKQ4A", 4.4, 156782,
  "Amazon's Choice",
  "Unpolished split moong dal — natural colour, high protein, easy to digest, ideal for dals, soups and khichdi",
  "Light, easily digestible moong dal", "Dal essential", 20,
  [
    sub("stpl_004_s1", "Tata Sampann Chana Dal 1kg", "Tata Consumer Products",
      135, 155, "cheapest", "Best Value", "₹10 cheaper, protein-rich chana dal",
      18, IMG.tataSampannChana, "B07WDHKN4A", 4.4, 189234),
  ]
);

export const STAPLES_FORTUNE_OIL = item(
  "stpl_005", "Fortune Sunflower Refined Oil", "Adani Wilmar",
  "Cooking Oils", 165, 189, 1, "1 L",
  IMG.fortuneSunflower, "B07WDHKP4A", 4.3, 234567,
  "Best Seller",
  "Light, refined sunflower oil — rich in Vitamin E, high smoke point, ideal for frying and everyday cooking",
  "Healthy refined cooking oil for daily use", "Cooking oil essential", 18,
  [
    sub("stpl_005_s1", "Dhara Sunflower Refined Oil 1L", "Mother Dairy / Dhara",
      155, 179, "cheapest", "Best Value", "₹10 cheaper, same quality refined sunflower oil",
      16, IMG.dharaMustard, "B07XKHQM4A", 4.2, 145678),
    sub("stpl_005_s2", "Fortune Kachi Ghani Mustard Oil 1L", "Adani Wilmar",
      175, 199, "trusted", "Most Trusted", "Cold-pressed mustard oil — pungent aroma, ideal for North Indian cooking",
      18, IMG.fortuneMustard, "B07WDK5H5A", 4.4, 112345),
  ]
);

export const FORTUNE_MUSTARD_OIL = item(
  "stpl_006", "Fortune Kachi Ghani Mustard Oil", "Adani Wilmar",
  "Cooking Oils", 175, 199, 1, "1 L",
  IMG.fortuneMustard, "B07WDHKN5A", 4.4, 178234,
  "Amazon's Choice",
  "Cold-pressed kachi ghani mustard oil — pungent natural aroma, ideal for pickles, Bengali and North Indian cooking",
  "Traditional mustard oil for authentic Indian cooking", "Cooking oil", 18,
  [
    sub("stpl_006_s1", "Dhara Kachi Ghani Mustard Oil 1L", "Mother Dairy / Dhara",
      165, 189, "cheapest", "Best Value", "₹10 cheaper, equally pungent cold-pressed mustard oil",
      16, IMG.dharaMustard, "B07PQV5T5A", 4.3, 123456),
  ]
);

export const STAPLES_TATA_SALT = item(
  "stpl_007", "Tata Salt Iodised", "Tata Consumer Products",
  "Salt, Sugar & Jaggery", 28, 30, 1, "1 kg",
  IMG.tataSalt, "B07WDKH3TA", 4.6, 567890,
  "Best Seller",
  "India's most trusted iodised salt since 1983 — vacuum evaporated, free-flowing, consistent iodine levels",
  "Essential iodised salt for all cooking", "Salt essential", 14,
  [
    sub("stpl_007_s1", "Tata Salt Plus Iodised 1kg", "Tata Consumer Products",
      30, 33, "trusted", "Most Trusted", "Double-fortified with Iron + Iodine — helps prevent anaemia",
      14, IMG.tataSalt, "B07XKHQE5A", 4.5, 234567),
    sub("stpl_007_s2", "Captain Cook Free Flow Salt 1kg", "DCW Limited",
      25, 28, "cheapest", "Best Value", "₹3 cheaper, anti-caking agent, free-flowing iodised salt",
      12, IMG.tataSalt, "B07PQV5T3A", 4.2, 145678),
  ]
);

export const EVEREST_GARAM_MASALA = item(
  "stpl_008", "Everest Garam Masala", "Everest Food Products",
  "Spices & Masala", 115, 135, 1, "100g",
  IMG.everestGaram, "B07WDHKP5A", 4.4, 234567,
  "Best Seller",
  "Authentic whole spice blend — 22 natural spices ground fresh for rich, aromatic garam masala flavour",
  "Essential garam masala for Indian cooking", "Spice essential", 14,
  [
    sub("stpl_008_s1", "MDH Garam Masala 100g", "MDH Masala",
      109, 125, "trusted", "Most Trusted", "Traditional MDH family recipe — aromatic and rich",
      14, IMG.mdhChana, "B07XKHQM5A", 4.4, 189234),
    sub("stpl_008_s2", "Tata Sampann Garam Masala 80g", "Tata Consumer Products",
      99, 115, "cheapest", "Best Value", "₹16 cheaper, freshly ground blend in resealable pack",
      12, IMG.tataSampannSpice, "B07WDK5H6A", 4.3, 145678),
  ]
);

export const CATCH_TURMERIC = item(
  "stpl_009", "Catch Turmeric Powder", "DS Group",
  "Spices & Masala", 89, 99, 1, "200g",
  IMG.catchTurmeric, "B07WDHKQ5A", 4.3, 178234,
  "Amazon's Choice",
  "Pure haldi powder with bright natural yellow colour — high curcumin content for authentic flavour and colour",
  "Essential turmeric powder for daily cooking", "Spice essential", 12,
  [
    sub("stpl_009_s1", "Everest Turmeric Powder 200g", "Everest Food Products",
      95, 109, "trusted", "Most Trusted", "Rich yellow colour, high purity, aromatic",
      12, IMG.everestGaram, "B07XKHQE6A", 4.4, 145678),
    sub("stpl_009_s2", "Tata Sampann Turmeric Powder 200g", "Tata Consumer Products",
      79, 89, "cheapest", "Best Value", "₹10 cheaper, resealable pack, fresh aroma",
      10, IMG.tataSampannSpice, "B07PQV5T4A", 4.3, 112345),
  ]
);

export const MDH_CHANA_MASALA = item(
  "stpl_010", "MDH Chana Masala", "MDH Masala",
  "Spices & Masala", 89, 99, 1, "100g",
  IMG.mdhChana, "B07WDKH4TA", 4.4, 145678,
  "Best Seller",
  "Authentic MDH spice blend for chana masala — 20+ whole spices, gives restaurant-quality chole at home",
  "Chana masala spice blend for chole", "Masala essential", 12,
  [
    sub("stpl_010_s1", "Everest Pav Bhaji Masala 100g", "Everest Food Products",
      89, 99, "trusted", "Most Trusted", "Essential masala for Mumbai-style pav bhaji",
      12, IMG.everestGaram, "B07XKHQM6A", 4.4, 112345),
    sub("stpl_010_s2", "Catch Rajma Masala 100g", "DS Group",
      79, 89, "cheapest", "Best Value", "₹10 cheaper, kidney bean curry masala",
      10, IMG.catchTurmeric, "B07PQV5T2A", 4.2, 89234),
  ]
);
