import type { GeneratedCart, ParsedIntent, Scenario } from "../types";
import type { ContextSignals } from "@/hooks/useContextSignals";

// ─── Scenario metadata (used server-side to validate Bedrock response) ───
export const SCENARIO_META: Record<
  Scenario,
  Omit<ParsedIntent, "confidence" | "usedBedrock">
> = {
  hosting: {
    scenario: "hosting",
    scenarioLabel: "Hosting",
    urgency: "High",
    category: "Food & Beverage",
    summary: "Quick snack and beverage setup for guests",
    deliveryMode: "fastest",
    suggestedItems: ["Tea", "Milk", "Snacks", "Paper Cups", "Napkins"],
  },
  fever: {
    scenario: "fever",
    scenarioLabel: "Fever Care",
    urgency: "High",
    category: "Health & Medicine",
    summary: "Fever relief and recovery essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Paracetamol", "ORS", "Tissues", "Soup", "Honey"],
  },
  pooja: {
    scenario: "pooja",
    scenarioLabel: "Pooja Essentials",
    urgency: "Medium",
    category: "Religious & Spiritual",
    summary: "Ritual items and fresh offerings for pooja",
    deliveryMode: "fastest",
    suggestedItems: ["Agarbatti", "Camphor", "Flowers", "Coconut", "Ghee"],
  },
  rainy: {
    scenario: "rainy",
    scenarioLabel: "Rainy Day",
    urgency: "Medium",
    category: "Comfort & Food",
    summary: "Warm food and comfort essentials for a rainy day",
    deliveryMode: "fastest",
    suggestedItems: ["Hot Chocolate", "Maggi", "Bread", "Eggs", "Candles"],
  },
  travel: {
    scenario: "travel",
    scenarioLabel: "Travel Prep",
    urgency: "High",
    category: "Travel Essentials",
    summary: "Travel kit with snacks, hydration and essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Water", "Snacks", "Sanitizer", "Charger", "Energy Bar"],
  },
  power_cut: {
    scenario: "power_cut",
    scenarioLabel: "Power Cut",
    urgency: "High",
    category: "Emergency",
    summary: "Emergency lighting and backup power essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Torch", "Batteries", "Candles", "Matchbox", "Power Bank"],
  },
  school: {
    scenario: "school",
    scenarioLabel: "School Project",
    urgency: "High",
    category: "Stationery & Craft",
    summary: "Project materials and stationery for school deadline",
    deliveryMode: "fastest",
    suggestedItems: ["Pencils", "Notebook", "Colour Pencils", "Fevicol", "Scissors"],
  },
  tea_break: {
    scenario: "tea_break",
    scenarioLabel: "Tea Break",
    urgency: "Low",
    category: "Beverages & Snacks",
    summary: "Quick tea setup with snacks for a relaxing break",
    deliveryMode: "value",
    suggestedItems: ["Tea Bags", "Milk", "Biscuits", "Namkeen"],
  },
  general: {
    scenario: "general",
    scenarioLabel: "General Shopping",
    urgency: "Low",
    category: "Essentials",
    summary: "Common everyday household essentials",
    deliveryMode: "value",
    suggestedItems: ["Water", "Bread", "Milk", "Eggs"],
  },
  cooking: {
    scenario: "cooking",
    scenarioLabel: "Cooking Essentials",
    urgency: "Medium",
    category: "Groceries",
    summary: "Essential ingredients for daily home cooking",
    deliveryMode: "fastest",
    suggestedItems: ["Oil", "Salt", "Onions", "Tomatoes", "Dal", "Rice"],
  },
  home_repair: {
    scenario: "home_repair",
    scenarioLabel: "Home Repair",
    urgency: "Medium",
    category: "Home Improvement",
    summary: "Quick fix for broken items at home",
    deliveryMode: "fastest",
    suggestedItems: ["LED Bulb", "Tape", "Screwdriver", "Fuse", "Glue"],
  },
  gifting: {
    scenario: "gifting",
    scenarioLabel: "Gift Shopping",
    urgency: "Medium",
    category: "Gifts & Occasions",
    summary: "Curated gift-ready products for Indian gifting occasions",
    deliveryMode: "value",
    suggestedItems: ["Dry Fruit Box", "Chocolate Gift Pack", "Scented Candle", "Haldiram's Soan Papdi", "Gift Wrap"],
  },
  electronics: {
    scenario: "electronics",
    scenarioLabel: "Electronics & Tech",
    urgency: "Medium",
    category: "Electronics & Accessories",
    summary: "Mobile accessories, cables, chargers and tech essentials",
    deliveryMode: "fastest",
    suggestedItems: ["USB-C Cable", "Charger", "Power Bank", "Earbuds", "Extension Board"],
  },
  baby_care: {
    scenario: "baby_care",
    scenarioLabel: "Baby Care",
    urgency: "High",
    category: "Baby & Infant Care",
    summary: "Diapers, wipes, baby food and infant care essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Pampers Diapers", "Baby Wipes", "Johnson's Baby Shampoo", "Baby Lotion", "Baby Formula"],
  },
  personal_care: {
    scenario: "personal_care",
    scenarioLabel: "Personal Care",
    urgency: "Low",
    category: "Personal Hygiene & Beauty",
    summary: "Shampoo, soap, face wash, toothpaste and daily hygiene essentials",
    deliveryMode: "value",
    suggestedItems: ["Shampoo", "Soap", "Face Wash", "Toothpaste", "Moisturizer"],
  },
  party: {
    scenario: "party",
    scenarioLabel: "Party & Celebrations",
    urgency: "High",
    category: "Party & Event Supplies",
    summary: "Balloons, decorations, snacks and drinks for celebrations",
    deliveryMode: "fastest",
    suggestedItems: ["Balloons", "Birthday Banner", "Cake Mix", "Chips", "Cold Drinks"],
  },
  pet_care: {
    scenario: "pet_care",
    scenarioLabel: "Pet Care",
    urgency: "Medium",
    category: "Pets & Animals",
    summary: "Dog food, cat food, pet accessories and grooming essentials",
    deliveryMode: "value",
    suggestedItems: ["Pedigree Dog Food", "Whiskas Cat Food", "Pet Treats", "Cat Litter", "Pet Bowl"],
  },
  fitness: {
    scenario: "fitness",
    scenarioLabel: "Fitness & Gym",
    urgency: "Medium",
    category: "Sports & Fitness",
    summary: "Protein supplements, gym gear and sports nutrition",
    deliveryMode: "value",
    suggestedItems: ["Whey Protein", "Creatine", "Protein Bar", "Peanut Butter", "Yoga Mat"],
  },
  cleaning: {
    scenario: "cleaning",
    scenarioLabel: "Cleaning & Hygiene",
    urgency: "Medium",
    category: "Home Cleaning",
    summary: "Floor cleaners, dishwash, detergent and bathroom hygiene supplies",
    deliveryMode: "value",
    suggestedItems: ["Lizol Floor Cleaner", "Harpic Toilet Cleaner", "Vim Dishwash", "Ariel Detergent", "Scrubber"],
  },
  // ─── Phase 2 & 3 new categories ──────────────────────────────
  breakfast: {
    scenario: "breakfast",
    scenarioLabel: "Breakfast Essentials",
    urgency: "Medium",
    category: "Breakfast & Cereals",
    summary: "Cereals, oats, malts, bread and morning breakfast essentials",
    deliveryMode: "fastest",
    suggestedItems: ["Kellogg's Corn Flakes", "Quaker Oats", "Horlicks", "Bread", "Kissan Jam"],
  },
  dairy: {
    scenario: "dairy",
    scenarioLabel: "Dairy & Eggs",
    urgency: "High",
    category: "Dairy & Eggs",
    summary: "Milk, butter, paneer, curd, cheese and eggs for daily needs",
    deliveryMode: "fastest",
    suggestedItems: ["Amul Milk", "Amul Butter", "Paneer", "Curd", "Eggs"],
  },
  frozen_food: {
    scenario: "frozen_food",
    scenarioLabel: "Frozen Food",
    urgency: "Low",
    category: "Frozen Snacks & Meals",
    summary: "Frozen fries, momos, nuggets, parathas and vegetables",
    deliveryMode: "value",
    suggestedItems: ["McCain French Fries", "Sumeru Momos", "Haldiram's Samosa", "Frozen Peas", "Lachha Paratha"],
  },
  condiments: {
    scenario: "condiments",
    scenarioLabel: "Condiments & Sauces",
    urgency: "Low",
    category: "Sauces, Spreads & Condiments",
    summary: "Ketchup, mayo, soy sauce, jams and spreads",
    deliveryMode: "value",
    suggestedItems: ["Kissan Ketchup", "FunFoods Mayo", "Ching's Soy Sauce", "Peanut Butter", "Kissan Jam"],
  },
  snacks: {
    scenario: "snacks",
    scenarioLabel: "Snacks & Munchies",
    urgency: "Low",
    category: "Snacks & Confectionery",
    summary: "Namkeen, chips, biscuits, chocolates and munchies",
    deliveryMode: "value",
    suggestedItems: ["Haldiram's Aloo Bhujia", "Parle-G", "Lay's Chips", "Oreo", "Dairy Milk"],
  },
  staples: {
    scenario: "staples",
    scenarioLabel: "Grocery Staples",
    urgency: "High",
    category: "Atta, Rice, Dal & Oil",
    summary: "Wheat flour, rice, dal, cooking oil, salt, sugar and masala",
    deliveryMode: "value",
    suggestedItems: ["Aashirvaad Atta", "India Gate Basmati Rice", "Tata Sampann Dal", "Fortune Oil", "Tata Salt"],
  },
  skincare: {
    scenario: "skincare",
    scenarioLabel: "Skincare & Beauty",
    urgency: "Low",
    category: "Skincare & Beauty",
    summary: "Sunscreen, serums, moisturizers, cleansers and makeup",
    deliveryMode: "value",
    suggestedItems: ["Minimalist Sunscreen SPF 50", "Niacinamide Serum", "Garnier Micellar Water", "Lakme Kajal", "St. Ives Scrub"],
  },
  pest_control: {
    scenario: "pest_control",
    scenarioLabel: "Pest Control",
    urgency: "High",
    category: "Pest Control & Repellents",
    summary: "Mosquito repellents, cockroach sprays and insect killers",
    deliveryMode: "fastest",
    suggestedItems: ["Good Knight Activ+", "All Out Refill", "HIT Cockroach Spray", "Odomos Cream", "Good Knight Coils"],
  },
  instant_food: {
    scenario: "instant_food",
    scenarioLabel: "Instant & Ready-to-Eat",
    urgency: "Medium",
    category: "Ready-to-Eat & Instant Food",
    summary: "MTR/Haldiram's RTE meals, cup noodles, soups and instant mixes",
    deliveryMode: "fastest",
    suggestedItems: ["MTR Paneer Butter Masala", "Maggi Noodles", "MTR Dal Makhani", "Knorr Tomato Soup", "Yippee Noodles"],
  },
  office: {
    scenario: "office",
    scenarioLabel: "Office Supplies",
    urgency: "Medium",
    category: "Stationery & Office Supplies",
    summary: "A4 paper, pens, sticky notes, markers and office essentials",
    deliveryMode: "value",
    suggestedItems: ["JK Copier A4 Paper", "Pilot V7 Pen", "Post-it Notes", "Whiteboard Markers", "HP Ink Cartridge"],
  },
};

// ─── Client-side intent parse via Bedrock API route ──────────────
// Throws on any error — no silent fallback.
// Returns intent, the server-generated cart, and initial substitute selections.
export async function parseIntent(
  input: string,
  photoS3Key?: string,
  recentOrders?: string[],
  contextSignals?: ContextSignals
): Promise<{
  intent: ParsedIntent;
  cart: GeneratedCart;
  initialSelections: Record<string, string>;
}> {
  const res = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input,
      ...(photoS3Key ? { photoS3Key } : {}),
      ...(recentOrders && recentOrders.length > 0 ? { recentOrders } : {}),
      ...(contextSignals?.weather || contextSignals?.location
        ? { contextSignals }
        : {}),
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(
      `Intent parsing failed (${res.status}): ${body.error ?? "Unknown error"}`
    );
  }

  const data = await res.json();
  return {
    intent: data.intent as ParsedIntent,
    cart: data.cart as GeneratedCart,
    initialSelections: (data.initialSelections ?? {}) as Record<string, string>,
  };
}
