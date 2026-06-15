import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Sunscreen
  minimalistSPF:    CDN("71g+I4lZA4L"),  // Minimalist SPF 50 PA++++ Sunscreen 50ml
  lakmeSun:         CDN("81bXvM-uZML"),  // Lakme Sun Expert Ultra Matte SPF 50+ 100ml
  neutrogena:       CDN("615UXd0c5dL"),  // Neutrogena Ultra Sheer Dry-Touch SPF 50+ 88ml
  lorealSun:        CDN("61cI6zr974L"),  // Loreal Paris UV Perfect SPF 50+ 30ml
  bioore:           CDN("71tO4H-FOAL"),  // Biore UV Aqua Rich Watery Essence SPF 50+
  // Serums & Treatment
  minimalistVitC:   CDN("61x1qmjozKL"),   // Minimalist Vitamin C 10% + E + Ferulic Serum
  minimalistNiac:   CDN("618taTjKWyL"),  // Minimalist Niacinamide 10% + Zinc Serum
  plumSerum:        CDN("61AcWafsawL"), // Plum 1% Niacinamide Serum 30ml
  wowVitC:          CDN("61x1qmjozKL"),  // WOW Vitamin C Serum 30ml
  // Moisturizers
  lakmePeach:       CDN("51DDJhaLHtL"),  // Lakme Peach Milk Moisturizer 120ml
  pondsAge:         CDN("61hRBq1N4pL"),  // Pond's Age Miracle Day Cream 35g
  nivea:            CDN("51DDJhaLHtL"),  // Nivea Soft Light Moisturiser 200ml
  // Cleansers & Toners
  garnierMice:      CDN("51aQ-yimIRL"),  // Garnier Micellar Cleansing Water 400ml
  cetaphilClean:    CDN("51aQ-yimIRL"),  // Cetaphil Gentle Skin Cleanser 250ml
  // Scrubs & Masks
  stIves:           CDN("61qTgz+UGJL"),  // St. Ives Apricot Scrub 170g
  mamamaskClean:    CDN("71g5AEgeqAL"),  // Mamaearth Charcoal Face Mask
  // Makeup (basic)
  lakmekajal:       CDN("71V8hB8fGZL"),   // Lakme Eyeconic Kajal Black 0.35g
  maybellineFitmeFnd: CDN("51wKPntT05L"), // Maybelline Fit Me Matte+Poreless Foundation
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Skincare & Beauty ────────────────────────────────────────────

export const MINIMALIST_SUNSCREEN = item(
  "skin_001", "Minimalist SPF 50 PA++++ Sunscreen", "Be Minimalist",
  "Sunscreen", 399, 449, 1, "50ml",
  IMG.minimalistSPF, "B09TMXN1C4", 4.4, 178234,
  "Amazon's Choice",
  "Broad spectrum SPF 50 PA++++ — lightweight, non-greasy, non-comedogenic. Dermatologically tested, no white cast",
  "Daily sunscreen for face — no white cast or greasiness", "Sunscreen essential", 18,
  [
    sub("skin_001_s1", "Lakme Sun Expert Ultra Matte SPF 50+ 100ml", "Lakme (HUL)",
      449, 499, "trusted", "Most Trusted", "Larger 100ml size, familiar brand, matte finish for Indian summers",
      18, IMG.lakmeSun, "B07WDKH4SK", 4.3, 145678),
    sub("skin_001_s2", "Neutrogena Ultra Sheer SPF 50+ 88ml", "Neutrogena (J&J)",
      549, 625, "fastest", "Fastest", "Premium lightweight SPF — global dermatologist-recommended brand",
      18, IMG.neutrogena, "B07PQV5T4K", 4.5, 189234),
  ]
);

export const LAKME_SUNSCREEN = item(
  "skin_002", "Lakme Sun Expert Ultra Matte SPF 50+ Sunscreen", "Lakme (HUL)",
  "Sunscreen", 449, 499, 1, "100ml",
  IMG.lakmeSun, "B07WDHKP4K", 4.3, 234567,
  "Best Seller",
  "SPF 50 PA+++ sunscreen with a matte finish — controls shine, non-greasy, water-resistant, India's top selling SPF",
  "Matte-finish SPF 50 sunscreen for oily skin", "Sunscreen", 16,
  [
    sub("skin_002_s1", "Minimalist SPF 50 50ml", "Be Minimalist",
      399, 449, "cheapest", "Best Value", "₹50 cheaper, zero white cast, lightweight gel-cream texture",
      16, IMG.minimalistSPF, "B09TMXN1C4", 4.4, 178234),
    sub("skin_002_s2", "L'Oreal Paris UV Perfect SPF 50 30ml", "L'Oreal Paris",
      329, 375, "trusted", "Most Trusted", "Micro-tinted, anti-oxidant UV filter, anti-dullness",
      16, IMG.lorealSun, "B07XKHQM4K", 4.3, 112345),
  ]
);

export const MINIMALIST_NIACINAMIDE = item(
  "skin_003", "Minimalist 10% Niacinamide + Zinc Serum", "Be Minimalist",
  "Face Serums", 549, 629, 1, "30ml",
  IMG.minimalistNiac, "B09TMXN2C4", 4.4, 145678,
  "Best Seller",
  "Clinical-strength niacinamide serum — reduces pores, controls sebum, fades dark spots and pigmentation",
  "Pore-minimising face serum for oily and acne-prone skin", "Serum essential", 18,
  [
    sub("skin_003_s1", "Plum 1% Niacinamide + Zinc Serum 30ml", "Plum Goodness",
      549, 629, "trusted", "Most Trusted", "Vegan, pH-balanced niacinamide with same efficacy",
      18, IMG.plumSerum, "B07WDKH5SK", 4.3, 89234),
    sub("skin_003_s2", "Minimalist Vitamin C 10% Serum 30ml", "Be Minimalist",
      549, 629, "fastest", "Fastest", "Brightening vitamin C serum for glow and even skin tone",
      16, IMG.minimalistVitC, "B09TMXN3C4", 4.4, 112345),
  ]
);

export const MINIMALIST_VIT_C = item(
  "skin_004", "Minimalist Vitamin C 10% + E + Ferulic Serum", "Be Minimalist",
  "Face Serums", 549, 629, 1, "30ml",
  IMG.minimalistVitC, "B09TMXN3C4", 4.4, 112345,
  "Amazon's Choice",
  "Stable Vitamin C with Vitamin E and Ferulic Acid — brightens dull skin, fades dark spots, antioxidant protection",
  "Brightening Vitamin C serum for radiant skin", "Brightening serum", 18,
  [
    sub("skin_004_s1", "WOW Vitamin C Serum 30ml", "WOW Skin Science",
      599, 699, "trusted", "Most Trusted", "Hyaluronic acid + Vitamin C combo for glow + hydration",
      18, IMG.wowVitC, "B07PQV5T5K", 4.3, 89234),
    sub("skin_004_s2", "Mamaearth Vitamin C Face Serum 30ml", "Mamaearth",
      549, 649, "cheapest", "Best Value", "Toxin-free, niacinamide + vitamin C serum, COSMOS certified",
      16, IMG.wowVitC, "B07XKHQM5K", 4.2, 145678),
  ]
);

export const GARNIER_MICELLAR = item(
  "skin_005", "Garnier Micellar Cleansing Water", "Garnier (L'Oreal India)",
  "Face Cleansers & Toners", 299, 349, 1, "400ml",
  IMG.garnierMice, "B07WDHKN4K", 4.4, 189234,
  "Best Seller",
  "No-rinse micellar water cleanser — gently removes makeup, sunscreen, impurities and excess oil in one step",
  "Gentle cleanser to remove makeup and impurities", "Facial cleanser", 16,
  [
    sub("skin_005_s1", "Cetaphil Gentle Skin Cleanser 250ml", "Galderma India",
      399, 449, "trusted", "Most Trusted", "Dermatologist-recommended, soap-free, ideal for sensitive skin",
      16, IMG.cetaphilClean, "B07PQV5T3K", 4.6, 234567),
    sub("skin_005_s2", "Simple Kind to Skin Cleansing Water 200ml", "Unilever India",
      249, 289, "cheapest", "Best Value", "₹50 cheaper, no dyes or perfume, gentle on eyes",
      14, IMG.garnierMice, "B07XKHQE4K", 4.3, 89234),
  ]
);

export const LAKME_MOISTURIZER = item(
  "skin_006", "Lakme Peach Milk Moisturizer", "Lakme (HUL)",
  "Moisturizers", 299, 349, 1, "120ml",
  IMG.lakmePeach, "B07WDHKP5K", 4.4, 234567,
  "Best Seller",
  "Lightweight non-greasy moisturizer with peach milk proteins and SPF 24 PA++ — absorbs instantly, no stickiness",
  "Daily lightweight moisturizer with SPF protection", "Moisturizer essential", 16,
  [
    sub("skin_006_s1", "Nivea Soft Light Moisturiser 200ml", "Beiersdorf India",
      299, 349, "trusted", "Most Trusted", "Enriched with Jojoba Oil + Vitamin E — soft, non-greasy",
      14, IMG.nivea, "B07XKHQM5K", 4.4, 189234),
    sub("skin_006_s2", "Pond's Moisturising Cold Cream 200ml", "HUL",
      199, 225, "cheapest", "Best Value", "₹100 cheaper, classic cold cream, good for normal to dry skin",
      12, IMG.pondsAge, "B07PQV5T4K", 4.3, 145678),
  ]
);

export const ST_IVES_SCRUB = item(
  "skin_007", "St. Ives Fresh Skin Apricot Scrub", "Unilever India",
  "Face Scrubs & Exfoliators", 399, 449, 1, "170g",
  IMG.stIves, "B07WDHKQ4K", 4.4, 178234,
  "Best Seller",
  "100% natural walnut shell powder exfoliant with real apricot extract — deeply cleanses pores, 100% natural scrubbing agents",
  "Deep-cleansing exfoliating face scrub", "Face scrub", 16,
  [
    sub("skin_007_s1", "Mamaearth Charcoal Face Scrub 100g", "Mamaearth",
      299, 349, "cheapest", "Best Value", "₹100 cheaper, activated charcoal draws out pollutants",
      14, IMG.mamamaskClean, "B07XKHQE5K", 4.2, 89234),
  ]
);

export const PONDS_NIGHT_CREAM = item(
  "skin_008", "Pond's Age Miracle Cell ReGEN Night Cream", "HUL",
  "Moisturizers", 259, 299, 1, "50g",
  IMG.pondsAge, "B07WDKH4SK", 4.3, 145678,
  "Amazon's Choice",
  "Retinol-C complex anti-ageing night cream — visibly reduces dark spots, wrinkles and uneven skin tone overnight",
  "Anti-ageing night cream for radiant skin", "Night cream", 18,
  [
    sub("skin_008_s1", "Olay Night Cream Regenerist Microsculpting 50g", "P&G India",
      799, 899, "trusted", "Most Trusted", "Premium peptide night cream — dermatologist-recommended",
      18, IMG.pondsAge, "B07PQV5T2K", 4.5, 89234),
    sub("skin_008_s2", "Lakme Absolute Perfect Radiance Night Creme 50g", "Lakme",
      599, 699, "cheapest", "Best Value", "Niacinamide + SPF — whitening night cream",
      16, IMG.lakmePeach, "B07XKHQM6K", 4.3, 67890),
  ]
);

export const LAKME_KAJAL = item(
  "skin_009", "Lakme Eyeconic Kajal", "Lakme (HUL)",
  "Eye Makeup", 210, 240, 1, "0.35g pencil",
  IMG.lakmekajal, "B07WDHKN5K", 4.4, 289234,
  "Best Seller",
  "India's #1 kajal — long-lasting, smudge-proof, deep black formula with smooth application. Lasts 16 hours",
  "Classic black kajal for Indian eye makeup", "Kajal essential", 14,
  [
    sub("skin_009_s1", "Maybelline New York Colossal Kajal 0.35g", "L'Oreal India",
      225, 259, "trusted", "Most Trusted", "Extra-black Colossal pigment — smudge-proof, 12hr wear",
      14, IMG.maybellineFitmeFnd, "B07XKHQE6K", 4.4, 234567),
    sub("skin_009_s2", "Colorbar Kohl Kajal 1.2g", "Colorbar Cosmetics",
      179, 199, "cheapest", "Best Value", "₹31 cheaper, smooth glide kajal, dermatologist-tested",
      12, IMG.lakmekajal, "B07PQV5T3K", 4.2, 89234),
  ]
);

export const CETAPHIL_CLEANSER = item(
  "skin_010", "Cetaphil Gentle Skin Cleanser", "Galderma India",
  "Face Cleansers", 399, 449, 1, "250ml",
  IMG.cetaphilClean, "B07WDHKP6K", 4.6, 234567,
  "Best Seller",
  "Dermatologist-recommended gentle, soap-free cleanser — works without water, perfect for sensitive and dry skin",
  "Gentle cleanser for sensitive and dry skin", "Sensitive skin cleanser", 18,
  [
    sub("skin_010_s1", "Garnier Micellar Water 400ml", "Garnier India",
      299, 349, "cheapest", "Best Value", "₹100 cheaper, no-rinse cleansing for all skin types",
      16, IMG.garnierMice, "B07WDHKN4K", 4.4, 189234),
    sub("skin_010_s2", "CeraVe Hydrating Cleanser 237ml", "L'Oreal India",
      549, 625, "trusted", "Most Trusted", "Ceramide-rich formula — restores skin barrier, fragrance-free",
      18, IMG.cetaphilClean, "B09TMXN4C4", 4.6, 89234),
  ]
);
