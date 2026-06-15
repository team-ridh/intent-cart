import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Floor & Surface Cleaning
  colinFloor:     CDN("71EI56ULsfL"),   // Colin Glass & Surface Cleaner
  dettolFloor:    CDN("61WgfSMLxJL"),   // Dettol Floor Cleaner Citrus
  lizolFloor:     CDN("71JpUMx956L"),   // Lizol Disinfectant Surface Cleaner
  harpicToilet:   CDN("51dTSG1mo2L"),   // Harpic Power Plus Toilet Cleaner
  // Dishwash
  vimBar:         CDN("51lHyYX+jcL"),   // Vim Dishwash Lemon Bar
  vimGel:         CDN("71blMTsgNSL"),   // Vim Dishwash Gel
  pril:           CDN("51lHyYX+jcL"),   // Pril Concentrated Dishwash
  // Laundry
  ariel:          CDN("71G9Nf0q4bL"),   // Ariel Matic Front Load Washing Powder
  surfExcel:      CDN("61KFEAQk4GL"),   // Surf Excel Easy Wash Detergent Powder
  tide:           CDN("71Hy3CV9M7L"),   // Tide Plus Double Power Detergent
  comfortFabric:  CDN("61LCIyBMcqL"),   // Comfort After Wash Fabric Conditioner
  // Bathroom / Toilet
  domexToilet:    CDN("51ogQYikFYL"),   // Domex Ultra Toilet Cleaner
  scrubber:       CDN("61XIB4m1oBL"),   // Scotch-Brite Multi-Use Scrub Pad
  mop:            CDN("71mVE9yJJ6L"),   // Scotch-Brite Mop Head
  // Air & Space
  airwick:        CDN("51KDHkBOalS"),    // Air Wick Freshmatic Automatic Spray
  odonil:         CDN("71OqaBk8CHL"),   // Odonil Room Freshener Blocks
  // Kitchen & Surfaces
  colinSpray:     CDN("81w7hisi2ML"),   // Colin Multi-Surface Cleaner Spray
  mrMuscle:       CDN("51kNtaHtYmL"),   // Mr Muscle Kitchen Cleaner
  // Protective
  rubberGloves:   CDN("71ejp6RZo3L"),   // Vguard Rubber Cleaning Gloves
  garbage:        CDN("414C3BhSeKL"),   // Garbage Bags Strong Oxo-Biodegradable
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

// ─── Cleaning & Home Hygiene Products ────────────────────────────────

export const LIZOL_FLOOR_CLEANER = item(
  "clean_001", "Lizol Disinfectant Surface & Floor Cleaner — Citrus", "Reckitt India",
  "Floor & Surface Cleaners",
  185, 215, 1, "975 ml",
  IMG.lizolFloor,
  "B07WDHKN3R", 4.5, 178234,
  "Best Seller",
  "Kills 99.9% germs — disinfects surfaces, removes grease, leaves fresh citrus fragrance",
  "Daily floor disinfection and cleaning", "Floor cleaner", 16,
  [
    sub("clean_001_s1", "Dettol Floor Cleaner 900ml", "Reckitt India",
      175, 199, "trusted", "Most Trusted", "Original pine fragrance, kills 99.9% bacteria and viruses",
      14, IMG.dettolFloor, "B07XKHQM5R", 4.4, 145678),
    sub("clean_001_s2", "Nimyle Floor Cleaner Neem 1L", "Dabur India",
      145, 169, "cheapest", "Best Value", "₹40 cheaper, herbal neem formula, safe for pets and children",
      12, IMG.lizolFloor, "B07PQV5T9R", 4.2, 67890),
  ]
);

export const HARPIC_TOILET_CLEANER = item(
  "clean_002", "Harpic Power Plus Toilet Cleaner — Original", "Reckitt India",
  "Toilet Cleaners",
  155, 179, 1, "750 ml",
  IMG.harpicToilet,
  "B07WDHKQ1R", 4.5, 234567,
  "Best Seller",
  "Removes 99.9% germs, limescale and tough stains — thick gel formula clings to the bowl",
  "Weekly deep toilet cleaning", "Toilet cleaner", 14,
  [
    sub("clean_002_s1", "Domex Ultra Toilet Cleaner 750ml", "HUL",
      135, 155, "cheapest", "Best Value", "₹20 cheaper, kills typhoid, cholera and rotavirus germs",
      12, IMG.domexToilet, "B07XKHQE4R", 4.4, 145678),
  ]
);

export const VIM_DISHWASH_BAR = item(
  "clean_003", "Vim Dishwash Lemon Bar", "HUL",
  "Dishwash",
  79, 89, 3, "bars × 155g",
  IMG.vimBar,
  "B07XKHQT5R", 4.4, 189234,
  "Best Seller",
  "Active lemon salt formula — cuts 100% grease from India's toughest utensils in 1 wash",
  "Daily dishwashing for pots and pans", "Dishwash essential", 12,
  [
    sub("clean_003_s1", "Pril Concentrated Dishwash Liquid 750ml", "Henkel India",
      175, 199, "trusted", "Most Trusted", "Concentrated — 3x more dishes per drop, lemon freshness",
      12, IMG.pril, "B07WDKH3TR", 4.4, 89234),
    sub("clean_003_s2", "Vim Dishwash Gel Lemon 500g", "HUL",
      109, 125, "cheapest", "Best Value", "₹66 cheaper than Pril, same Vim quality in gel form",
      10, IMG.vimGel, "B07PQV4T7R", 4.3, 112345),
  ]
);

export const ARIEL_MATIC = item(
  "clean_004", "Ariel Matic Front Load Washing Powder", "Procter & Gamble",
  "Laundry",
  279, 329, 1, "2 kg",
  IMG.ariel,
  "B07WDHKP9R", 4.5, 234567,
  "Best Seller",
  "Unstainable technology — removes 30+ stains in first wash, safe for washing machines",
  "Deep-clean laundry detergent for washing machine", "Laundry essential", 18,
  [
    sub("clean_004_s1", "Surf Excel Matic Front Load Powder 2kg", "HUL",
      249, 289, "trusted", "Most Trusted", "Advanced stain removal, gentle on colors and fabric",
      18, IMG.surfExcel, "B07XKHQM4R", 4.5, 189234),
    sub("clean_004_s2", "Tide Plus Double Power 2kg", "P&G",
      219, 259, "cheapest", "Best Value", "₹60 cheaper, brilliant white formula with stain removal",
      16, IMG.tide, "B07PQV5T8R", 4.3, 145678),
  ]
);

export const SURF_EXCEL_BUCKET = item(
  "clean_005", "Surf Excel Easy Wash Detergent Powder", "HUL",
  "Laundry",
  229, 269, 1, "2 kg",
  IMG.surfExcel,
  "B07XKHQT3R", 4.5, 178234,
  "Best Seller",
  "Daag ache hain! — removes the toughest stains, works brilliantly in 2 mugs of water",
  "Bucket-wash detergent for clothes without machine", "Hand-wash detergent", 16,
  [
    sub("clean_005_s1", "Rin Advanced Stain Champion Powder 2.5kg", "HUL",
      249, 289, "trusted", "Most Trusted", "Blue crystal formula, brilliant stain removal and white brightness",
      16, IMG.surfExcel, "B07WDKH5TR", 4.4, 145678),
    sub("clean_005_s2", "Ghadi Detergent Powder 2kg", "RSPL India",
      159, 185, "cheapest", "Best Value", "₹70 cheaper — India's #1 selling value detergent",
      14, IMG.surfExcel, "B07PQV5T7R", 4.2, 189234),
  ]
);

export const COMFORT_FABRIC_CONDITIONER = item(
  "clean_006", "Comfort After Wash Fabric Conditioner — Morning Fresh", "HUL",
  "Fabric Care",
  155, 179, 1, "800 ml",
  IMG.comfortFabric,
  "B07WDHKQ2R", 4.4, 123456,
  "Amazon's Choice",
  "24-hour fragrance — softens clothes, reduces ironing time by 40% and fights static",
  "Post-wash fabric softener for freshness and softness", "Fabric care", 16,
  [
    sub("clean_006_s1", "Downy Fabric Softener 800ml", "P&G",
      199, 229, "trusted", "Most Trusted", "April Fresh scent — protects color vibrancy, reduces pilling",
      16, IMG.comfortFabric, "B07XKHQM3R", 4.4, 89234),
  ]
);

export const SCOTCH_BRITE_SCRUBBER = item(
  "clean_007", "Scotch-Brite Heavy Duty Scrub Pad", "3M India",
  "Cleaning Tools",
  69, 79, 3, "scrub pads",
  IMG.scrubber,
  "B07XKHQE3R", 4.4, 234567,
  "Best Seller",
  "Heavy-duty abrasive surface + soft sponge back — removes burnt food and grease with ease",
  "Kitchen scrubbing and utensil cleaning", "Cleaning tool", 12,
  [
    sub("clean_007_s1", "Scotch-Brite Regular Scrub Pad 6 pcs", "3M India",
      89, 99, "trusted", "Most Trusted", "6 pcs combo value pack — medium abrasive for daily use",
      12, IMG.scrubber, "B07PQV4T4R", 4.4, 189234),
  ]
);

export const COLIN_GLASS_CLEANER = item(
  "clean_008", "Colin Glass & Multi-Surface Cleaner — Original Blue", "Reckitt India",
  "Surface Cleaners",
  145, 169, 1, "500 ml spray",
  IMG.colinSpray,
  "B07WDKH3TK", 4.4, 145678,
  "Amazon's Choice",
  "Streak-free formula — cleans glass, mirrors, tiles, AC filters — 40% more shine",
  "Glass and mirror cleaning spray", "Surface cleaner", 14,
  [
    sub("clean_008_s1", "Mr. Muscle Kitchen Cleaner 500ml", "SC Johnson India",
      179, 199, "trusted", "Most Trusted", "Degreasing formula for kitchen counters, stovetops and tiles",
      14, IMG.mrMuscle, "B07XKHQM2R", 4.3, 89234),
  ]
);

export const ODONIL_ROOM_FRESHENER = item(
  "clean_009", "Odonil Room Freshener Blocks — Assorted (6 blocks)", "Dabur India",
  "Air Fresheners",
  149, 169, 1, "6 blocks × 50g",
  IMG.odonil,
  "B07WDHKP4R", 4.3, 89234,
  "Best Seller",
  "Activated fragrance blocks — up to 30 days fresh fragrance in bathroom, wardrobe or car",
  "Continuous room freshening", "Air freshener", 12,
  [
    sub("clean_009_s1", "Air Wick Freshmatic Automatic Spray Kit", "Reckitt India",
      499, 599, "trusted", "Most Trusted", "Automatic timed spray — up to 12 weeks of freshness",
      14, IMG.airwick, "B07XKHQM1R", 4.4, 67890),
  ]
);

export const GARBAGE_BAGS = item(
  "clean_010", "Ezee Garbage Bags — Medium 19x21 inches", "Nirma Limited",
  "Waste Management",
  99, 115, 1, "pack of 30 bags",
  IMG.garbage,
  "B07XKHQT1R", 4.3, 89234,
  "Amazon's Choice",
  "Oxo-biodegradable polyethylene — strong enough for wet waste, leakage-resistant construction",
  "Kitchen and bathroom bin liners", "Waste management", 12,
  [
    sub("clean_010_s1", "Biodegradable Garbage Bags Large (25 pcs)", "Visco",
      129, 149, "trusted", "Most Trusted", "CPCB certified compostable, 100% biodegradable",
      12, IMG.garbage, "B09GARB0001", 4.2, 45678),
  ]
);

export const RUBBER_CLEANING_GLOVES = item(
  "clean_011", "Vguard Latex Rubber Cleaning Gloves — Medium", "V-Guard Industries",
  "Cleaning Protection",
  99, 119, 1, "pair",
  IMG.rubberGloves,
  "B07WDKH4TK", 4.3, 67890,
  "Amazon's Choice",
  "Thick rubber with flocked cotton lining — protects hands during dishwashing and floor cleaning",
  "Hand protection during cleaning", "Safety gear", 12,
  [
    sub("clean_011_s1", "Scotch-Brite Medium Rubber Gloves", "3M India",
      79, 99, "cheapest", "Best Value", "₹20 cheaper, ergonomic design, textured fingertips for grip",
      10, IMG.rubberGloves, "B07PQV5T3R", 4.3, 45678),
  ]
);
