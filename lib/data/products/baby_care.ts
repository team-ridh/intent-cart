import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Baby Diapers
  pampers:        CDN("81sBr7mOC9L"),   // Pampers Premium Care Pants
  mammyPoko:      CDN("61CtRCJBd+L"),   // MamyPoko Extra Absorb Pants
  huggies:        CDN("81k2+QlCCsL"),   // Huggies Wonder Pants
  kiddies:        CDN("61w+ov8-TjL"),   // Pampers All Round Protection
  // Baby Wipes
  pamperWipes:    CDN("71kTgp5+tPL"),   // Pampers Fresh Clean Baby Wipes
  meeWipes:       CDN("71TKGCyU4ZL"),   // Mee Mee Gentle Baby Wipes
  johnsons:       CDN("71Z5YNRK3PL"),   // Johnson's Baby Wipes
  // Baby Food / Formula
  aptamil:        CDN("71Bm9t3MKPL"),   // Aptamil Follow-Up Formula Stage 2
  nestleNan:      CDN("71iUNVArnyL"),   // Nestle NAN PRO Stage 1
  cerelac:        CDN("71vkQIPz7LL"),   // Nestle CERELAC Wheat Apple
  gerber:         CDN("71oQ1PmMqeL"),   // Gerber Rice Cereal
  // Baby Bath & Skincare
  johnsonsShampoo:CDN("71-UrxTYj5L"),   // Johnson's Baby Shampoo
  johnsonsOil:    CDN("71dsTXQDEHL"),   // Johnson's Baby Oil
  johnsonsLotion: CDN("71Xwpe7Y7lL"),   // Johnson's Baby Lotion
  himalayaBaby:   CDN("51uU0AFPIsL"),   // Himalaya Baby Cream
  // Baby Accessories
  nuk:            CDN("71HCknSYqdL"),   // NUK Soother/Pacifier
  pigeon:         CDN("71LJpCqFWRL"),   // Pigeon Wide-Neck Feeding Bottle
  mothercare:     CDN("71WibH2cSmL"),   // Mothercare Baby Cotton Balls
  // Feeding
  figonTeether:   CDN("71JkZ5nGDML"),   // Pigeon Silicone Teether
  chicco:         CDN("71TNkQ7Z5eL"),   // Chicco Feeding Bottle
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

// ─── Baby Care Products ──────────────────────────────────────────────

export const PAMPERS_DIAPERS_M = item(
  "baby_001", "Pampers Premium Care Pants — Medium", "Procter & Gamble",
  "Baby Diapers",
  699, 799, 1, "pack of 54",
  IMG.pampers,
  "B07WDHKP3L", 4.5, 234567,
  "Best Seller",
  "Wetness indicator + cotton-like softness — our softest diaper for newborn comfort",
  "Diaper protection for baby", "Diaper essential", 20,
  [
    sub("baby_001_s1", "Huggies Wonder Pants Medium 54s", "Kimberly-Clark India",
      649, 749, "trusted", "Most Trusted", "DryXtra technology absorbs 3x more — leak-free protection",
      20, IMG.huggies, "B07XKHQM7P", 4.4, 145678),
    sub("baby_001_s2", "MamyPoko Extra Absorb Pants Medium 54s", "Unicharm India",
      549, 649, "cheapest", "Best Value", "₹150 cheaper, Magic Absorb core for long-hour protection",
      18, IMG.mammyPoko, "B07PQV5T9L", 4.3, 189234),
  ]
);

export const PAMPERS_DIAPERS_L = item(
  "baby_002", "Pampers All Round Protection Pants — Large", "Procter & Gamble",
  "Baby Diapers",
  799, 899, 1, "pack of 44",
  IMG.kiddies,
  "B081QVFQLD", 4.3, 234745,
  "Best Seller",
  "360° protection with stretchable sides — designed for active babies who are learning to walk",
  "Large size diaper for active older baby", "Diaper essential", 20,
  [
    sub("baby_002_s1", "Huggies Wonder Pants Large 36s", "Kimberly-Clark India",
      699, 799, "trusted", "Most Trusted", "Soft, cottony outer cover with bubble bed technology",
      20, IMG.huggies, "B07XKHQM9P", 4.4, 112345),
    sub("baby_002_s2", "MamyPoko Extra Absorb Pants Large 36s", "Unicharm India",
      599, 699, "cheapest", "Best Value", "₹200 cheaper for 36 pcs — great for overnight use",
      18, IMG.mammyPoko, "B07PQV5S9L", 4.3, 143456),
  ]
);

export const PAMPERS_BABY_WIPES = item(
  "baby_003", "Pampers Fresh Clean Baby Wipes", "Procter & Gamble",
  "Baby Wipes",
  299, 349, 3, "packs of 72 wipes",
  IMG.pamperWipes,
  "B07XKHQE3P", 4.5, 189234,
  "Best Seller",
  "Hypoallergenic, water-based wipes — pH-balanced and dermatologically tested, alcohol-free",
  "Gentle cleansing after every diaper change", "Baby hygiene", 18,
  [
    sub("baby_003_s1", "Johnson's Baby Wipes 80s (3 pack)", "Johnson & Johnson",
      279, 320, "trusted", "Most Trusted", "Softest-ever formula with gentle baby fragrance",
      18, IMG.johnsons, "B07WDKH9TL", 4.4, 145678),
    sub("baby_003_s2", "Mee Mee Gentle Baby Wipes 80s (3 pack)", "Mee Mee",
      239, 275, "cheapest", "Best Value", "₹60 cheaper, aloe vera infused, extra-large wipe",
      16, IMG.meeWipes, "B07PQV4T2L", 4.2, 89234),
  ]
);

export const JOHNSONS_BABY_SHAMPOO = item(
  "baby_004", "Johnson's Baby Shampoo", "Johnson & Johnson India",
  "Baby Bath & Body",
  249, 289, 1, "500 ml",
  IMG.johnsonsShampoo,
  "B07WDHKQ7L", 4.7, 345678,
  "Best Seller",
  "No More Tears formula — as gentle to baby's eyes as pure water, clinically proven",
  "Gentle hair washing for baby", "Baby bath essential", 16,
  [
    sub("baby_004_s1", "Himalaya Gentle Baby Shampoo 400ml", "Himalaya Drug Company",
      199, 229, "trusted", "Most Trusted", "Chickpea and muskmelon extract — tear-free herbal formula",
      16, IMG.himalayaBaby, "B07XKHQM1P", 4.4, 123456),
    sub("baby_004_s2", "Mee Mee Mild Baby Shampoo 500ml", "Mee Mee",
      175, 199, "cheapest", "Best Value", "₹74 cheaper, pH-balanced, gentle on scalp",
      14, IMG.johnsons, "B07PQV5T2L", 4.2, 67890),
  ]
);

export const JOHNSONS_BABY_OIL = item(
  "baby_005", "Johnson's Baby Oil", "Johnson & Johnson India",
  "Baby Bath & Body",
  229, 265, 1, "500 ml",
  IMG.johnsonsOil,
  "B07XKHQT7P", 4.6, 234567,
  "Best Seller",
  "Mineral oil formula — locks in up to 10x more moisture to keep baby's skin soft",
  "Post-bath baby massage oil", "Baby massage", 16,
  [
    sub("baby_005_s1", "Himalaya Baby Massage Oil 200ml", "Himalaya Drug Company",
      149, 175, "trusted", "Most Trusted", "Winter cherry and olive oil blend for growing bones",
      14, IMG.himalayaBaby, "B07WDKH5TL", 4.4, 98765),
  ]
);

export const JOHNSONS_BABY_LOTION = item(
  "baby_006", "Johnson's Baby Lotion", "Johnson & Johnson India",
  "Baby Bath & Body",
  249, 289, 1, "400 ml",
  IMG.johnsonsLotion,
  "B00QGEN6C8", 4.4, 34460,
  "Best Seller",
  "24-hour moisturisation with NaturalCalm technology — gentle enough for newborns",
  "Daily baby skin moisturisation", "Baby skincare", 16,
  [
    sub("baby_006_s1", "Himalaya Baby Cream 200ml", "Himalaya Drug Company",
      175, 199, "trusted", "Most Trusted", "Winter cherry & olive oil — gentle Ayurvedic formula",
      14, IMG.himalayaBaby, "B07PQV4T1L", 4.4, 112345),
  ]
);

export const CERELAC_WHEAT = item(
  "baby_007", "Nestle CERELAC Wheat-Apple Infant Cereal", "Nestle India",
  "Baby Food",
  299, 340, 1, "300g (Stage 2, 6+ months)",
  IMG.cerelac,
  "B07WDHKP5L", 4.4, 145678,
  "Best Seller",
  "23 nutrients including iron and Vitamin C — easy to prepare, no preservatives or colours",
  "Nutritious solid food for infants", "Baby nutrition", 18,
  [
    sub("baby_007_s1", "Gerber Rice Cereal 227g", "Gerber India",
      275, 315, "trusted", "Most Trusted", "Single grain rice cereal, gentle first food for 4+ months",
      18, IMG.gerber, "B07XKHQE9P", 4.3, 56789),
  ]
);

export const PIGEON_BOTTLE = item(
  "baby_008", "Pigeon Wide-Neck Peristaltic Plus Feeding Bottle", "Pigeon India",
  "Baby Feeding",
  549, 649, 1, "240 ml",
  IMG.pigeon,
  "B07XKHQT5P", 4.5, 89234,
  "Amazon's Choice",
  "Peristaltic nipple mimics breast — prevents nipple confusion, BPA-free PP material",
  "Safe bottle for feeding formula or expressed milk", "Feeding essential", 20,
  [
    sub("baby_008_s1", "Chicco Well-Being Feeding Bottle 250ml", "Artsana India",
      499, 599, "trusted", "Most Trusted", "Anti-colic valve, soft silicone teat, BPA-free",
      20, IMG.chicco, "B07WDKH4TL", 4.4, 67234),
  ]
);

export const APTAMIL_FORMULA = item(
  "baby_009", "Aptamil Follow-Up Infant Formula Stage 2", "Danone India",
  "Baby Formula",
  799, 895, 1, "400g (6-12 months)",
  IMG.aptamil,
  "B07GB45YNZ", 4.5, 5710,
  "Best Seller",
  "GOS/FOS prebiotic blend with DHA/ARA — supports immunity and brain development",
  "Nutritional formula supplement for baby", "Baby formula", 22,
  [
    sub("baby_009_s1", "Nestle NAN PRO 2 Follow-Up Formula 400g", "Nestle India",
      749, 849, "trusted", "Most Trusted", "Probiotic (L. reuteri) + DHA for digestive health",
      22, IMG.nestleNan, "B07XKHQM0P", 4.3, 67890),
  ]
);
