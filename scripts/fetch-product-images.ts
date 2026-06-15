/**
 * fetch-product-images.ts
 *
 * One-time script: queries Open Food Facts for each product in the catalog,
 * extracts the front image URL, and writes a static productImages.json map.
 *
 * Usage:
 *   npx tsx scripts/fetch-product-images.ts
 *
 * Output:
 *   public/productImages.json   — { [productId]: imageUrl }
 */

import fs from "fs";
import path from "path";

// ─── Product ID → search query mapping ───────────────────────────────────────
// Format: "product_id": "search query string for Open Food Facts"
// Use the most specific brand + product name for best match.
const PRODUCT_QUERIES: Record<string, string> = {
  // ── Food & Beverages ──────────────────────────────────────────────────────
  "bev_tata_tea_gold":       "Tata Tea Gold",
  "bev_lipton_tea":          "Lipton Yellow Label Tea",
  "bev_amul_taaza":          "Amul Taaza Milk",
  "bev_bisleri_1l":          "Bisleri Water",
  "bev_cadbury_choc":        "Cadbury Drinking Chocolate",

  "food_marie_gold":         "Britannia Marie Gold",
  "food_parle_g":            "Parle G Glucose Biscuits",
  "food_parle_khari":        "Parle Khari Biscuit",
  "food_maggi":              "Maggi 2 Minute Noodles",
  "food_britannia_bread":    "Britannia Bread",
  "food_amul_butter":        "Amul Butter",
  "food_eggs":               "Farm Fresh Eggs",
  "food_haldirams_bhujia":   "Haldiram's Aloo Bhujia",

  // ── Medicines ─────────────────────────────────────────────────────────────
  // (most medicines not in Open Food Facts — handled by fallback)

  // ── Personal Care ─────────────────────────────────────────────────────────
  "pc_001": "Head and Shoulders Shampoo",
  "pc_002": "Dove Beauty Bar Soap",
  "pc_003": "Dettol Original Soap",
  "pc_004": "Himalaya Face Wash",
  "pc_005": "Colgate Strong Teeth Toothpaste",
  "pc_006": "Nivea Soft Moisturiser",
  "pc_007": "Parachute Coconut Hair Oil",
  "pc_008": "Axe Dark Temptation Deodorant",
  "pc_009": "Whisper Sanitary Pads",
  "pc_010": "Gillette Guard Razor",
  "pc_011": "Dettol Body Wash",
  "pc_012": "Oral B Toothbrush",

  // ── Baby Care ────────────────────────────────────────────────────────────
  "baby_001": "Pampers Diapers",
  "baby_002": "Pampers Baby Wipes",
  "baby_003": "Johnson's Baby Shampoo",
  "baby_004": "Johnson's Baby Oil",
  "baby_005": "Johnson's Baby Lotion",
  "baby_006": "Nestle Cerelac Wheat",
  "baby_007": "Pigeon Wide Neck Feeding Bottle",
  "baby_008": "Aptamil Follow On Formula",
  "baby_009": "Pampers Diapers Large",

  // ── Breakfast ─────────────────────────────────────────────────────────────
  "bkf_001": "Kellogg's Corn Flakes",
  "bkf_002": "Quaker Oats",
  "bkf_003": "Kellogg's Chocos",
  "bkf_004": "Baggry's Muesli",
  "bkf_005": "Horlicks Malt",
  "bkf_006": "Cadbury Bournvita",
  "bkf_007": "MTR Upma Mix",
  "bkf_008": "MTR Poha Mix",
  "bkf_009": "Kissan Mixed Fruit Jam",
  "bkf_010": "Britannia Whole Wheat Bread",

  // ── Dairy ────────────────────────────────────────────────────────────────
  "dry_001": "Amul Taaza Milk",
  "dry_002": "Amul Butter",
  "dry_003": "Amul Ghee",
  "dry_004": "Britannia Cheese Slices",
  "dry_005": "Amul Paneer",
  "dry_006": "Mother Dairy Curd",
  "dry_007": "Epigamia Greek Yogurt",
  "dry_008": "Farm Fresh Eggs",
  "dry_009": "Amul Cheese Spread",
  "dry_010": "Amul Kool Milk",

  // ── Frozen Food ───────────────────────────────────────────────────────────
  "frz_001": "McCain French Fries",
  "frz_002": "McCain Smiles Potato",
  "frz_003": "Sumeru Veg Momos",
  "frz_004": "ITC Master Chef Chicken Nuggets",
  "frz_005": "Haldiram's Frozen Samosa",
  "frz_006": "Vadilal Frozen Peas",
  "frz_007": "Kawan Lachha Paratha",
  "frz_008": "McCain Aloo Tikki",
  "frz_009": "Safal Frozen Spinach",
  "frz_010": "Sumeru Sweet Corn",

  // ── Condiments ────────────────────────────────────────────────────────────
  "cond_001": "Kissan Tomato Ketchup",
  "cond_002": "Dr Oetker FunFoods Mayonnaise",
  "cond_003": "Ching's Secret Soy Sauce",
  "cond_004": "Wingreens Farms Schezwan Chutney",
  "cond_005": "Maggi Hot and Sweet Ketchup",
  "cond_006": "Sundrop Peanut Butter",
  "cond_007": "Kissan Mixed Fruit Jam",
  "cond_008": "Maggi Masala ae Magic",
  "cond_009": "Ching's Secret Red Chilli Sauce",
  "cond_010": "Maggi Tomato Ketchup",

  // ── Snacks ────────────────────────────────────────────────────────────────
  "snack_001": "Haldiram's Aloo Bhujia",
  "snack_002": "Haldiram's Navrattan Mixture",
  "snack_003": "Parle G Glucose Biscuits",
  "snack_004": "Oreo Original Cream Biscuits",
  "snack_005": "Bikaji Bikaneri Bhujia",
  "snack_006": "Cadbury Dairy Milk Silk",
  "snack_007": "Farmley Makhana",
  "snack_008": "ACT II Instant Popcorn",
  "snack_009": "Lay's Classic Salted Chips",
  "snack_010": "KitKat Chocolate",

  // ── Staples ───────────────────────────────────────────────────────────────
  "stpl_001": "Aashirvaad Sharbati Atta",
  "stpl_002": "India Gate Basmati Rice",
  "stpl_003": "Tata Sampann Chana Dal",
  "stpl_004": "Tata Sampann Moong Dal",
  "stpl_005": "Fortune Sunflower Refined Oil",
  "stpl_006": "Fortune Kachi Ghani Mustard Oil",
  "stpl_007": "Tata Salt Iodised",
  "stpl_008": "Everest Garam Masala",
  "stpl_009": "Catch Turmeric Powder",
  "stpl_010": "MDH Chana Masala",

  // ── Skincare ──────────────────────────────────────────────────────────────
  "skin_001": "Minimalist Sunscreen SPF 50",
  "skin_002": "Lakme Sun Expert Sunscreen",
  "skin_003": "Minimalist Niacinamide Serum",
  "skin_004": "Minimalist Vitamin C Serum",
  "skin_005": "Garnier Micellar Cleansing Water",
  "skin_006": "Lakme Peach Milk Moisturizer",
  "skin_007": "St Ives Apricot Scrub",
  "skin_008": "Pond's Age Miracle Night Cream",
  "skin_009": "Lakme Eyeconic Kajal",
  "skin_010": "Cetaphil Gentle Skin Cleanser",

  // ── Pest Control ─────────────────────────────────────────────────────────
  "pest_001": "Good Knight Activ+ Mosquito Repellent",
  "pest_002": "Good Knight Activ+ Refill",
  "pest_003": "Good Knight Power Shot Spray",
  "pest_004": "HIT Cockroach Killer Spray",
  "pest_005": "HIT Flying Insect Killer",
  "pest_006": "Mortein All Insect Killer",
  "pest_007": "Good Knight Mosquito Coils",
  "pest_008": "Odomos Mosquito Repellent Cream",

  // ── Instant Food ─────────────────────────────────────────────────────────
  "inst_001": "MTR Paneer Butter Masala Ready to Eat",
  "inst_002": "MTR Dal Makhani Ready to Eat",
  "inst_003": "Haldiram's Pav Bhaji Minute Khana",
  "inst_004": "Maggi Cuppa Mania Noodles",
  "inst_005": "Maggi 2 Minute Masala Noodles",
  "inst_006": "Yippee Magic Masala Noodles",
  "inst_007": "Knorr Cream of Tomato Soup",
  "inst_008": "ITC Aashirvaad Ready to Eat Chole",
  "inst_009": "Gits Gulab Jamun Mix",
  "inst_010": "Wai Wai Chicken Noodles",

  // ── Office ───────────────────────────────────────────────────────────────
  // (most office products not in Open Food Facts — handled by fallback)
};

// ─── Open Food Facts search ───────────────────────────────────────────────────
const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";

async function fetchOffImage(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      fields: "product_name,brands,image_front_url",
      tagtype_0: "countries",
      tag_contains_0: "contains",
      tag_0: "India",
      page_size: "5",
    });

    const res = await fetch(`${OFF_SEARCH}?${params}`, {
      headers: { "User-Agent": "IntentCart/1.0 (prototype; contact@intentcart.dev)" },
    });

    if (!res.ok) return null;
    const data = await res.json() as { products?: { image_front_url?: string }[] };
    const products = data.products ?? [];

    // Return the first product that has a front image URL
    const match = products.find(p => p.image_front_url && p.image_front_url.startsWith("https://"));
    return match?.image_front_url ?? null;
  } catch {
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Fetching images for ${Object.keys(PRODUCT_QUERIES).length} products from Open Food Facts...\n`);

  const imageMap: Record<string, string> = {};
  const missing: string[] = [];
  let fetched = 0;

  for (const [productId, query] of Object.entries(PRODUCT_QUERIES)) {
    process.stdout.write(`  [${++fetched}/${Object.keys(PRODUCT_QUERIES).length}] ${query}... `);

    const url = await fetchOffImage(query);
    if (url) {
      imageMap[productId] = url;
      console.log(`✅`);
    } else {
      missing.push(productId);
      console.log(`❌ not found`);
    }

    // Polite rate-limiting: Open Food Facts asks for ≤10 req/s
    await new Promise(r => setTimeout(r, 200));
  }

  // ─── Write output ───────────────────────────────────────────────────────
  const outPath = path.join(process.cwd(), "public", "productImages.json");
  fs.writeFileSync(outPath, JSON.stringify(imageMap, null, 2));

  console.log(`\n✅ Done! ${Object.keys(imageMap).length} images found, ${missing.length} missing`);
  console.log(`📁 Written to: ${outPath}`);

  if (missing.length > 0) {
    console.log(`\n❗ Products with no image found (add manually):`);
    missing.forEach(id => console.log(`   - ${id}: "${PRODUCT_QUERIES[id]}"`));
  }
}

main().catch(console.error);
