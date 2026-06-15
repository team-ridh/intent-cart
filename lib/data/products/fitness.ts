import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Protein / Supplements
  onGoldStandard: CDN("71g+I0lZA5L"),   // Optimum Nutrition Gold Standard Whey 1lb
  muscleBlaze:    CDN("81bXvM-uVML"),   // MuscleBlaze Biozyme Performance Whey 1kg
  mbCreatine:     CDN("81MHpBXjjkL"),   // MuscleBlaze Creatine Monohydrate
  onCreatine:     CDN("71DajhNIQOL"),   // ON Micronized Creatine 250g
  yogaBar:        CDN("71tO4H-FNWL"),   // YOGA BAR Everyday Protein Bars
  trueElements:   CDN("71VoH3oGmL"),    // True Elements Energy Granola
  // Fitness Food
  peanutButter:   CDN("71bfBxdwZmL"),   // My Fitness Peanut Butter
  mbMass:         CDN("71iCnP9BZMFL"),  // MuscleBlaze Mass Gainer XXL
  // Workout Gear
  nikeGloves:     CDN("71dY5xC8xCL"),   // Strauss Gym Gloves
  skippingRope:   CDN("71lI5i0oEnL"),   // Strauss Skipping Rope
  resistanceBand: CDN("71y4cnjnFwL"),   // WOD Nation Resistance Bands
  yogaMat:        CDN("71XpbNhwMML"),   // AmazonBasics Yoga Mat 6mm
  // Hydration
  pocariSweat:    CDN("71dkNF0GX8L"),   // Pocari Sweat Ion Supply Drink
  gatorade:       CDN("71dJkPQQHBL"),   // Gatorade Thirst Quencher Blue Bolt
  electral:       CDN("81CSmAI5hkL"),   // Electral ORS Lemon
  coconutWater:   CDN("71g5AEgcpAL"),   // Real Coconut Water
  // Nutrition Bars
  ritebite:       CDN("71X3VPXQ-4L"),   // RiteBite Max Protein Bar
  questBar:       CDN("71PnGNE8FIL"),   // Quest Nutrition Protein Bar
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

// ─── Fitness & Sports Nutrition ──────────────────────────────────────

export const ON_GOLD_STANDARD_WHEY = item(
  "fit_001", "Optimum Nutrition Gold Standard 100% Whey Protein — 1 lb", "Optimum Nutrition",
  "Protein Supplements",
  1799, 2199, 1, "454g (Double Rich Chocolate)",
  IMG.onGoldStandard,
  "B000QSNYGI", 4.3, 89234,
  "Best Seller",
  "24g protein + 5.5g BCAA per serving — world's #1 selling whey protein, Glanbia certified authentic",
  "Post-workout protein supplement", "Protein essential", 24,
  [
    sub("fit_001_s1", "MuscleBlaze Biozyme Performance Whey 1kg", "HealthKart (MuscleBlaze)",
      2099, 2699, "trusted", "Most Trusted", "Enhanced absorption BioZyme enzyme blend — 27g protein/serving",
      24, IMG.muscleBlaze, "B07WDKH3TQ", 4.4, 123456),
    sub("fit_001_s2", "MuscleBlaze Whey Beginner Protein 1kg", "HealthKart (MuscleBlaze)",
      1299, 1799, "cheapest", "Best Value", "₹500 cheaper, 25g protein, good for beginners",
      22, IMG.muscleBlaze, "B07PQV5T8Q", 4.2, 67234),
  ]
);

export const MB_CREATINE = item(
  "fit_002", "MuscleBlaze Creatine Monohydrate (Unflavoured)", "HealthKart (MuscleBlaze)",
  "Supplements",
  499, 699, 1, "250g (83 servings)",
  IMG.mbCreatine,
  "B07XKHQM6Q", 4.3, 67890,
  "Amazon's Choice",
  "3g creatine monohydrate per serving — increases strength and muscle endurance, Informed Sport tested",
  "Performance-enhancing creatine supplement", "Supplement", 22,
  [
    sub("fit_002_s1", "ON Micronized Creatine Monohydrate 250g", "Optimum Nutrition",
      799, 999, "trusted", "Most Trusted", "Pure Creapure creatine — patented, lab-tested, no fillers",
      22, IMG.onCreatine, "B000GIIJLC", 4.5, 89234),
  ]
);

export const YOGA_BAR_PROTEIN = item(
  "fit_003", "Yoga Bar Everyday Protein Bar — Chocolate Fudge (pack of 6)", "ITC India",
  "Nutrition Bars",
  449, 540, 1, "6 bars × 38g",
  IMG.yogaBar,
  "B07WDHKN3Q", 4.2, 56789,
  "Amazon's Choice",
  "10g plant protein per bar, no refined sugar — clean label, real almond & dark chocolate",
  "High-protein snack for pre or post-workout", "Protein snack", 18,
  [
    sub("fit_003_s1", "RiteBite Max Protein Assorted Bars (6 pack)", "RiteBite",
      399, 480, "cheapest", "Best Value", "₹50 cheaper, 20g protein, 5 assorted flavours",
      16, IMG.ritebite, "B07XKHQM5Q", 4.1, 34521),
    sub("fit_003_s2", "Quest Nutrition Protein Bar (4 pack)", "Quest Nutrition India",
      649, 749, "trusted", "Most Trusted", "21g protein, only 4g net carbs — keto-friendly",
      20, IMG.questBar, "B07PQV5T7Q", 4.3, 45678),
  ]
);

export const MY_FITNESS_PEANUT_BUTTER = item(
  "fit_004", "My Fitness Peanut Butter — Crunchy (Dark Roast)", "HF Foods",
  "Health Foods",
  399, 479, 1, "510g",
  IMG.peanutButter,
  "B07WDHKQ2Q", 4.4, 123456,
  "Best Seller",
  "25% protein, zero added sugar, zero cholesterol — roasted groundnuts, pure and simple",
  "High-protein peanut butter for fitness nutrition", "Protein food", 18,
  [
    sub("fit_004_s1", "Pintola All Natural Peanut Butter Crunchy 1kg", "Pintola",
      549, 649, "trusted", "Most Trusted", "Zero additives, 28g protein/100g — thick-grind crunchy",
      18, IMG.peanutButter, "B07XKHQM4Q", 4.5, 89234),
    sub("fit_004_s2", "Dr. Oetker Fun Foods Peanut Butter Smooth 350g", "Dr. Oetker India",
      299, 349, "cheapest", "Best Value", "₹100 cheaper, natural peanut flavour, spreadable smooth",
      14, IMG.peanutButter, "B07PQV5T6Q", 4.2, 67890),
  ]
);

export const YOGA_MAT = item(
  "fit_005", "AmazonBasics Extra Thick Yoga Mat 6mm", "Amazon Basics",
  "Yoga & Fitness Equipment",
  899, 1099, 1, "61 × 173 × 0.6 cm",
  IMG.yogaMat,
  "B01LP0U5X0", 4.3, 89234,
  "Best Seller",
  "6mm thick TPE foam — non-slip, moisture-resistant surface, carry strap included",
  "Non-slip mat for yoga, exercise or meditation", "Fitness essential", 22,
  [
    sub("fit_005_s1", "Strauss Yoga Mat 6mm (Purple)", "Strauss",
      699, 899, "cheapest", "Best Value", "₹200 cheaper, anti-skid, available in 8 vibrant colours",
      20, IMG.yogaMat, "B07WDHKP2Q", 4.2, 56789),
  ]
);

export const STRAUSS_SKIPPING_ROPE = item(
  "fit_006", "Strauss Speed Skipping Rope with Ball Bearings", "Strauss",
  "Fitness Equipment",
  349, 399, 1, "piece, adjustable length",
  IMG.skippingRope,
  "B07XKHQE4Q", 4.3, 67890,
  "Amazon's Choice",
  "Steel wire rope with PVC coating + ball-bearing handles — tangle-free, ideal for HIIT and boxing",
  "Cardio workout skipping rope", "Fitness gear", 18,
  [
    sub("fit_006_s1", "Boldfit Premium Speed Rope", "Boldfit",
      299, 349, "cheapest", "Best Value", "₹50 cheaper, adjustable, anti-slip soft handles",
      16, IMG.skippingRope, "B09FITROPE1", 4.1, 34521),
  ]
);

export const RESISTANCE_BANDS = item(
  "fit_007", "Resistance Bands Set (5 Levels)", "Strauss",
  "Fitness Equipment",
  599, 699, 1, "set of 5 bands + carry bag",
  IMG.resistanceBand,
  "B07WDKH4TQ", 4.3, 45678,
  "Amazon's Choice",
  "5 resistance levels (5–40 lbs) — latex bands for home workout, physiotherapy & stretching",
  "Resistance training for home workouts", "Fitness gear", 20,
  [
    sub("fit_007_s1", "Boldfit Resistance Bands 5 pcs Set", "Boldfit",
      499, 599, "cheapest", "Best Value", "₹100 cheaper, eco-latex, 10 workout cards included",
      18, IMG.resistanceBand, "B09FITBAND1", 4.2, 34521),
  ]
);

export const GATORADE_BOTTLE = item(
  "fit_008", "Gatorade Thirst Quencher Sports Drink", "PepsiCo India",
  "Sports Drinks",
  55, 55, 4, "591ml bottles",
  IMG.gatorade,
  "B07WDHKP1Q", 4.3, 56789,
  "Best Seller",
  "Electrolytes to replace what you sweat out — scientifically formulated for athletes and gym-goers",
  "Intra-workout electrolyte replenishment", "Sports drink", 14,
  [
    sub("fit_008_s1", "Pocari Sweat Ion Supply Drink 500ml (4 bottles)", "Otsuka Pharmaceutical India",
      280, 320, "trusted", "Most Trusted", "Japanese ion supply drink closest to body fluid, gentle on stomach",
      14, IMG.pocariSweat, "B07XKHQM3Q", 4.4, 34521),
    sub("fit_008_s2", "Electral ORS Lemon Sachets (10 sachets)", "FDC Limited",
      79, 89, "cheapest", "Best Value", "₹141 cheaper, clinical-grade ORS with glucose and electrolytes",
      12, IMG.electral, "B07PQV5T5Q", 4.4, 89234),
  ]
);

export const REAL_COCONUT_WATER = item(
  "fit_009", "Raw Pressery Pure Coconut Water", "Licious / Raw Pressery",
  "Health Drinks",
  45, 50, 4, "200ml Tetra packs",
  IMG.coconutWater,
  "B07XKHQT5Q", 4.2, 34521,
  "Amazon's Choice",
  "100% natural coconut water, no sugar added — electrolytes, 5 essential minerals, zero fat",
  "Natural post-workout hydration", "Hydration", 14,
  [
    sub("fit_009_s1", "Tender Coconut Water Real 200ml (6 packs)", "Dabur Real",
      270, 300, "trusted", "Most Trusted", "From Dabur — no preservatives, naturally hydrating",
      14, IMG.coconutWater, "B07WDKH6TQ", 4.3, 45678),
  ]
);

export const GRANOLA_BAR_BOX = item(
  "fit_010", "True Elements Crunchy Energy Granola 475g", "True Elements",
  "Healthy Breakfast",
  399, 499, 1, "475g",
  IMG.trueElements,
  "B07XKHQM2Q", 4.3, 45678,
  "Amazon's Choice",
  "Real oats + almonds + raisins — no maida, no refined sugar, high fibre pre-workout breakfast",
  "High-energy breakfast for active days", "Healthy breakfast", 18,
  [
    sub("fit_010_s1", "Yoga Bar Oats + Protein Muesli 700g", "ITC India",
      499, 599, "trusted", "Most Trusted", "10g protein/serving, quinoa + oats + dark choco",
      18, IMG.yogaBar, "B07PQV5T4Q", 4.3, 34521),
  ]
);
