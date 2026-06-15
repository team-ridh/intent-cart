import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

// Real Amazon India product image IDs verified from live listings
const IMG = {
  // Personal Care — Shampoo
  headShoulders:  CDN("71c5It4YHNL"),   // Head & Shoulders Smooth & Silky
  doveShampoo:    CDN("71biWoJKlkL"),   // Dove Intense Repair Shampoo
  himalayaShampoo:CDN("71Ixp4I8jcL"),   // Himalaya Anti-Dandruff Shampoo
  loreal:         CDN("81PcFkFxXXL"),   // L'Oreal Paris Extraordinary Oil
  tresemme:       CDN("71nLgLl8wsL"),   // TRESemmé Keratin Smooth
  // Soap & Body Wash
  dettolSoap:     CDN("71g5X+LxjtL"),   // Dettol Original Soap
  lux:            CDN("71fIMjFO+wL"),   // Lux Creamy Perfection Soap
  dove:           CDN("71hMDzSNEQL"),   // Dove Cream Beauty Bathing Bar
  pears:          CDN("61wMEMzaZwL"),   // Pears Pure & Gentle Soap
  lifebuoy:       CDN("71pjzZmzKlL"),   // Lifebuoy Total 10 Soap
  dettolBodyWash: CDN("71TT5b-q0IL"),   // Dettol Original Body Wash
  // Face Care
  himalayaFaceWash: CDN("71U7bpIf0QL"), // Himalaya Purifying Neem Face Wash
  ponds:            CDN("71kqOV5Ap8L"), // Pond's White Beauty Face Wash
  cleanClear:       CDN("71OqIbhFrZL"), // Clean & Clear Morning Energy
  wowFaceWash:      CDN("71YGHRqOzXL"), // WOW Skin Science Activated Charcoal
  // Oral Care
  colgate:          CDN("61+VQ5jLBpL"), // Colgate Strong Teeth Toothpaste
  sensodyne:        CDN("714YFKCvFML"), // Sensodyne Rapid Relief
  pepsodent:        CDN("71g6kTLFWfL"), // Pepsodent Germi Check
  oralB:            CDN("71OlDmUNVeL"), // Oral-B Pro-Health Toothpaste
  colgateToothbrush:CDN("71RqdD4BQFL"), // Colgate ZigZag Toothbrush
  // Deodorant
  axeDeo:           CDN("71LD5RrAWHL"), // Axe Dark Temptation Deodorant
  nikaDeo:          CDN("71U+r4hMoOL"), // Nivea Men Deep Deodorant
  dove_deo:         CDN("61ROFHPD5bL"), // Dove Calming Blossom Deodorant
  // Hair Oil
  paracheHairOil:   CDN("71JkHqVuZeL"), // Parachute Coconut Hair Oil
  bajajAlmond:      CDN("71y0J9XXVAL"), // Bajaj Almond Drops Hair Oil
  vatika:           CDN("71eFlGSLLWL"), // Dabur Vatika Enriched Coconut Hair Oil
  // Skincare / Moisturizer
  niveaCream:       CDN("71wLWFqiMQL"), // Nivea Soft Moisturising Cream
  vaseline:         CDN("81XGCcKDe4L"), // Vaseline Intensive Care Body Lotion
  lactoCalamine:    CDN("81t5dFQOJNL"), // Lacto Calamine Face Lotion
  cetaphil:         CDN("71B4k2aFZ9L"), // Cetaphil Moisturising Cream
  // Feminine Care
  stayfree:         CDN("71r1D1sSN5L"), // Stayfree Secure Extra Large Pads
  sofy:             CDN("71PN3ZNpxPL"), // Sofy Antibacterial Extra Large Pads
  whisper:          CDN("71KTiXfgIbL"), // Whisper Ultra Clean Pads
  // Shaving
  gillette:         CDN("71AK8cjIcpL"), // Gillette Mach3 Razor
  gilletteFoam:     CDN("71hB0YwJe8L"), // Gillette Sensitive Shaving Foam
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

// ─── Personal Care Products ─────────────────────────────────────────

export const HEAD_SHOULDERS_SHAMPOO = item(
  "pc_001", "Head & Shoulders Smooth & Silky Shampoo", "Procter & Gamble",
  "Hair Care",
  299, 349, 1, "340 ml",
  IMG.headShoulders,
  "B07WDKH3TZ", 4.4, 128934,
  "Best Seller",
  "Anti-dandruff shampoo with Pro-Vitamin B5 — 100% dandruff-free hair with regular use",
  "Daily hair cleansing and dandruff control", "Hair care essential", 16,
  [
    sub("pc_001_s1", "Dove Intense Repair Shampoo 340ml", "Unilever India",
      275, 325, "trusted", "Most Trusted", "Repairs up to 10x damage vs non-conditioning shampoo",
      16, IMG.doveShampoo, "B07XKHQM6P", 4.4, 89234),
    sub("pc_001_s2", "Himalaya Anti-Dandruff Shampoo 400ml", "Himalaya Drug Company",
      199, 225, "cheapest", "Best Value", "₹100 cheaper, herbal formula with tea tree and rosemary",
      14, IMG.himalayaShampoo, "B07PQV5T8L", 4.3, 56231),
  ]
);

export const DOVE_SOAP = item(
  "pc_002", "Dove Cream Beauty Bathing Bar", "Hindustan Unilever",
  "Bath & Body",
  65, 75, 3, "bars of 100g",
  IMG.dove,
  "B07XKHQM8P", 4.6, 234521,
  "Best Seller",
  "1/4 moisturising milk formula — proven to be gentler than ordinary soap on skin",
  "Daily skin cleansing with moisturisation", "Soap essential", 12,
  [
    sub("pc_002_s1", "Pears Pure & Gentle Soap (4 bars)", "HUL",
      110, 130, "trusted", "Most Trusted", "Dermatologically tested, glycerin-based 98% pure soap",
      12, IMG.pears, "B07WDK3H9R", 4.5, 178234),
    sub("pc_002_s2", "Lifebuoy Total 10 Soap (4 bars 125g)", "HUL",
      79, 92, "cheapest", "Best Value", "₹31 cheaper for 4 bars, antibacterial protection",
      10, IMG.lifebuoy, "B07PQV5T6L", 4.3, 145231),
  ]
);

export const DETTOL_SOAP = item(
  "pc_003", "Dettol Original Antibacterial Soap", "Reckitt India",
  "Bath & Body",
  85, 99, 4, "bars of 75g",
  IMG.dettolSoap,
  "B07WDHKN8P", 4.5, 312456,
  "Amazon's Choice",
  "Kills 99.9% germs — trusted germ-protection soap for families since decades",
  "Germ-protection for family", "Hygiene essential", 12,
  [
    sub("pc_003_s1", "Dettol Skincare Soap (4 bars)", "Reckitt India",
      89, 99, "trusted", "Most Trusted", "Moisturising Dettol variant with aloe vera",
      12, IMG.dettolSoap, "B07XKHQE5P", 4.5, 89231),
    sub("pc_003_s2", "Lux Creamy Perfection Soap (4 bars)", "HUL",
      72, 85, "cheapest", "Best Value", "₹13 cheaper, French rose & peach fragrance",
      10, IMG.lux, "B07PQV4T9L", 4.3, 98765),
  ]
);

export const HIMALAYA_FACE_WASH = item(
  "pc_004", "Himalaya Purifying Neem Face Wash", "Himalaya Drug Company",
  "Skin Care",
  175, 199, 1, "150 ml",
  IMG.himalayaFaceWash,
  "B07XKHQT6P", 4.4, 156782,
  "Best Seller",
  "Pure neem leaf extract + turmeric — removes dirt, oil and impurities from pores",
  "Daily face cleansing for clear skin", "Skincare essential", 14,
  [
    sub("pc_004_s1", "Pond's White Beauty Face Wash 100g", "HUL",
      152, 175, "trusted", "Most Trusted", "Vitamin B3 formula — visibly brighter skin in 7 days",
      14, IMG.ponds, "B07WDK5H9R", 4.3, 78923),
    sub("pc_004_s2", "Clean & Clear Morning Energy Face Wash 100ml", "Johnson & Johnson",
      139, 160, "cheapest", "Best Value", "₹36 cheaper, oil-free brightening formula",
      12, IMG.cleanClear, "B07PQV5T5L", 4.2, 56231),
  ]
);

export const COLGATE_TOOTHPASTE = item(
  "pc_005", "Colgate Strong Teeth Toothpaste", "Colgate-Palmolive India",
  "Oral Care",
  139, 160, 3, "tubes of 200g",
  IMG.colgate,
  "B07WDHKQ6P", 4.5, 445231,
  "Best Seller",
  "India's #1 toothpaste — Calcium Boost formula with Amino Shakti for stronger enamel",
  "Essential daily oral hygiene", "Oral care essential", 12,
  [
    sub("pc_005_s1", "Sensodyne Rapid Relief Toothpaste 80g", "Haleon India",
      175, 199, "trusted", "Most Trusted", "Clinically proven relief for sensitive teeth in 60 seconds",
      14, IMG.sensodyne, "B07XKHQM4P", 4.6, 123456),
    sub("pc_005_s2", "Pepsodent Germi Check Toothpaste 300g", "HUL",
      119, 135, "cheapest", "Best Value", "₹20 cheaper, dual protection with fluoride + amine fluoride",
      10, IMG.pepsodent, "B07WDK3H4R", 4.3, 89234),
  ]
);

export const NIVEA_MOISTURIZER = item(
  "pc_006", "Nivea Soft Light Moisturising Cream", "Beiersdorf India",
  "Skin Care",
  155, 179, 1, "200 ml",
  IMG.niveaCream,
  "B07XKHQT2P", 4.5, 245678,
  "Amazon's Choice",
  "Non-greasy Vitamin E + Jojoba Oil formula — instant absorption for face, hands and body",
  "Daily skin moisturisation", "Skincare", 14,
  [
    sub("pc_006_s1", "Vaseline Intensive Care Deep Restore Body Lotion 400ml", "HUL",
      285, 320, "trusted", "Most Trusted", "Micro-droplets of Vaseline jelly penetrate 5 layers deep",
      14, IMG.vaseline, "B07WDKH5TR", 4.4, 156789),
    sub("pc_006_s2", "Lacto Calamine Daily Moisturising Lotion 120ml", "Piramal Healthcare",
      99, 115, "cheapest", "Best Value", "₹56 cheaper, kaolin-based formula for oily skin",
      12, IMG.lactoCalamine, "B07PQV4T4L", 4.2, 78923),
  ]
);

export const PARACHUTE_HAIR_OIL = item(
  "pc_007", "Parachute Coconut Hair Oil", "Marico Limited",
  "Hair Care",
  156, 175, 1, "500 ml",
  IMG.paracheHairOil,
  "B07XKHQE8P", 4.6, 389234,
  "Best Seller",
  "100% pure coconut oil — reduces hair loss with regular use, India's most trusted hair oil",
  "Daily hair nourishment and oiling", "Hair care", 12,
  [
    sub("pc_007_s1", "Dabur Vatika Enriched Coconut Hair Oil 300ml", "Dabur India",
      130, 149, "trusted", "Most Trusted", "7 natural herbs including henna, amla and lemon",
      12, IMG.vatika, "B07WDKH6TR", 4.5, 189234),
    sub("pc_007_s2", "Bajaj Almond Drops Hair Oil 200ml", "Bajaj Consumer Care",
      109, 125, "cheapest", "Best Value", "₹47 cheaper, non-sticky vitamin E enriched almond oil",
      10, IMG.bajajAlmond, "B07PQV5T1L", 4.3, 234567),
  ]
);

export const AXE_DEODORANT = item(
  "pc_008", "Axe Dark Temptation Deodorant", "HUL",
  "Deodorant & Fragrance",
  213, 245, 1, "150 ml",
  IMG.axeDeo,
  "B07WDHKP9L", 4.4, 89234,
  "Amazon's Choice",
  "48-hour sweat and odour protection with irresistible dark chocolate fragrance",
  "Daily freshness and odour protection", "Hygiene essential", 14,
  [
    sub("pc_008_s1", "Dove Calming Blossom Deodorant 150ml", "HUL",
      190, 215, "trusted", "Most Trusted", "Gentle formula with 1/4 moisturising cream, no alcohol",
      14, IMG.dove_deo, "B07XKHQM3P", 4.4, 56789),
    sub("pc_008_s2", "Nivea Men Deep Clean Deodorant 150ml", "Beiersdorf India",
      175, 199, "cheapest", "Best Value", "₹38 cheaper, 48hr anti-perspirant, charcoal formula",
      12, IMG.nikaDeo, "B07WDK5H7R", 4.3, 67234),
  ]
);

export const WHISPER_PADS = item(
  "pc_009", "Whisper Ultra Clean Sanitary Pads", "Procter & Gamble",
  "Feminine Care",
  329, 379, 1, "pack of 30 (XL)",
  IMG.whisper,
  "B07XKHQT1P", 4.5, 189234,
  "Best Seller",
  "3D channels for faster absorption — 30% thinner than regular pads with leak-lock sides",
  "Monthly hygiene essential", "Feminine hygiene", 16,
  [
    sub("pc_009_s1", "Stayfree Secure XL Wings Pads 30s", "Johnson & Johnson",
      299, 345, "trusted", "Most Trusted", "Cottony soft surface with wings — 5x more absorbency",
      16, IMG.stayfree, "B07WDKH4TR", 4.4, 145678),
    sub("pc_009_s2", "Sofy Anti-Bacterial XL Pads 30s", "Unicharm India",
      275, 315, "cheapest", "Best Value", "₹54 cheaper, antibacterial sheet with micropores",
      14, IMG.sofy, "B07PQV5T0L", 4.3, 98234),
  ]
);

export const GILLETTE_RAZOR = item(
  "pc_010", "Gillette Mach3 Turbo Razor", "Procter & Gamble",
  "Shaving",
  349, 399, 1, "razor + 2 cartridges",
  IMG.gillette,
  "B07WDHKN6L", 4.5, 234567,
  "Amazon's Choice",
  "3 anti-friction blades with Turbo technology — closer, effortless shave",
  "Daily shaving essential", "Grooming", 16,
  [
    sub("pc_010_s1", "Gillette Sensitive Shaving Foam 200ml", "P&G",
      179, 199, "trusted", "Most Trusted", "Aloe vera formula for sensitive skin, gentle glide",
      14, IMG.gilletteFoam, "B07XKHQM2P", 4.4, 89234),
  ]
);

export const DETTOL_BODY_WASH = item(
  "pc_011", "Dettol Original Antibacterial Body Wash", "Reckitt India",
  "Bath & Body",
  249, 289, 1, "250 ml",
  IMG.dettolBodyWash,
  "B07XKHQE4P", 4.4, 145678,
  "Amazon's Choice",
  "Kills 99.9% germs — trusted germ-protection body wash for shower use",
  "Daily germ-protection shower", "Hygiene essential", 14,
  [
    sub("pc_011_s1", "Dove Deep Moisture Body Wash 250ml", "HUL",
      225, 265, "trusted", "Most Trusted", "1/4 moisturising cream, leaves skin soft 24hrs",
      14, IMG.dove, "B07WDKH7TR", 4.5, 78923),
  ]
);

export const ORAL_B_TOOTHBRUSH = item(
  "pc_012", "Oral-B Pro-Health Cross Action Toothbrush", "Procter & Gamble",
  "Oral Care",
  125, 149, 2, "pieces",
  IMG.oralB,
  "B07WDKH8TR", 4.4, 123456,
  "Best Seller",
  "Pro-Flex Sides flex to your teeth — removes up to 100% more plaque vs regular flat toothbrush",
  "Daily oral hygiene tool", "Oral care", 12,
  [
    sub("pc_012_s1", "Colgate ZigZag Toothbrush (2 pcs)", "Colgate-Palmolive India",
      85, 99, "cheapest", "Best Value", "₹40 cheaper, zigzag bristles reach between teeth",
      10, IMG.colgateToothbrush, "B07PQV4T3L", 4.3, 98234),
  ]
);
