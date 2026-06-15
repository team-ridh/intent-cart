import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Ketchup
  kissanKetchup:    CDN("71g+I2lZA4L"),  // Kissan Fresh Tomato Ketchup 1kg
  maggiKetchup:     CDN("81bXvM-uXML"),  // Maggi Hot & Sweet Ketchup 1kg
  heinzKetchup:     CDN("81MHpBXjllL"),  // Heinz Tomato Ketchup 450g
  // Mayonnaise
  funfoodsMayo:     CDN("71DajhNIPOL"),  // Dr. Oetker Fun Foods Eggless Mayo 875g
  veebaMayo:        CDN("71tO4H-FNYЛ"),  // Veeba Burger Mayo 900g
  hellmanns:        CDN("71VoH3oImL"),   // Hellmann's Real Mayonnaise 400g
  // Sauces
  chingsSoy:        CDN("71bfBxdyZmL"),  // Ching's Secret Soy Sauce 750ml
  wingreensSchz:    CDN("71iCnP9BZMHL"), // Wingreens Farms Schezwan Sauce 450g
  chingsChilli:     CDN("71dY5xCAXCL"),  // Ching's Chilli Sauce 680g
  maggiHotChilli:   CDN("71lI5i2oDnL"),  // Maggi Hot & Sweet Chilli Sauce
  delMonteOlive:    CDN("71y4cnjpFwL"),  // Del Monte Olive Oil Extra Virgin
  // Spreads
  kissamJam:        CDN("71XpbNhyMML"),  // Kissan Mixed Fruit Jam 500g
  sundropPB:        CDN("71dkNF0HX8L"),  // Sundrop Peanut Butter Creamy 924g
  // Vinegar & Others
  chingsVinegar:    CDN("71dJkPQRHBL"),  // Ching's White Vinegar
  maggiMasala:      CDN("81CSmAI5ikL"),  // Maggi Masala ae Magic 6g×18
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Condiments, Sauces & Spreads ────────────────────────────────

export const KISSAN_TOMATO_KETCHUP = item(
  "cond_001", "Kissan Fresh Tomato Ketchup", "Hindustan Unilever",
  "Ketchup & Sauces", 160, 185, 1, "1 kg",
  IMG.kissanKetchup, "B07WDHKN4C", 4.4, 234567,
  "Best Seller",
  "Made from 100% real tomatoes — thick, tangy ketchup without preservatives. India's top ketchup brand",
  "Classic tomato ketchup for snacks and meals", "Ketchup essential", 14,
  [
    sub("cond_001_s1", "Maggi Hot & Sweet Ketchup 1kg", "Nestle India",
      175, 199, "trusted", "Most Trusted", "Tangy-sweet blend with chilli — great with samosas and fries",
      14, IMG.maggiKetchup, "B07XKHQM4C", 4.4, 189234),
    sub("cond_001_s2", "Heinz Tomato Ketchup 450g", "Kraft Heinz India",
      149, 169, "cheapest", "Best Value", "₹11 cheaper for 450g, world's #1 ketchup, smooth thick pour",
      14, IMG.heinzKetchup, "B07WDK5H4C", 4.5, 145678),
  ]
);

export const FUNFOODS_MAYO = item(
  "cond_002", "Dr. Oetker Fun Foods Eggless Mayonnaise", "Dr. Oetker India",
  "Mayonnaise", 225, 265, 1, "875g",
  IMG.funfoodsMayo, "B07WDHKQ2C", 4.4, 189234,
  "Best Seller",
  "India's #1 eggless mayonnaise — creamy, thick, vegetarian-friendly, perfect for sandwiches and wraps",
  "Eggless mayo for sandwiches, pasta salad and dips", "Condiment essential", 14,
  [
    sub("cond_002_s1", "Veeba Burger Mayo 900g", "Veeba Food Services",
      199, 235, "cheapest", "Best Value", "₹26 cheaper, restaurant-style thick burger mayo",
      14, IMG.veebaMayo, "B07XKHQE4C", 4.3, 112345),
    sub("cond_002_s2", "Hellmann's Real Mayonnaise 400g", "Unilever India",
      249, 289, "trusted", "Most Trusted", "With eggs — richer, creamier, global #1 mayo brand",
      16, IMG.hellmanns, "B07WDK5H5C", 4.5, 89234),
  ]
);

export const CHINGS_SOY_SAUCE = item(
  "cond_003", "Ching's Secret Soy Sauce", "Capital Foods",
  "Asian Sauces", 125, 145, 1, "750ml",
  IMG.chingsSoy, "B07XKHQT4C", 4.4, 145678,
  "Best Seller",
  "India's #1 Chinese sauce brand — fermented soy, rich umami flavour for stir-fries, fried rice and noodles",
  "Soy sauce for Chinese-style cooking and dips", "Sauce essential", 12,
  [
    sub("cond_003_s1", "Ching's Chilli Sauce 680g", "Capital Foods",
      125, 145, "trusted", "Most Trusted", "Spicy chilli sauce — perfect for momos, fries and snacks",
      12, IMG.chingsChilli, "B07WDKH4TC", 4.4, 112345),
    sub("cond_003_s2", "Wingreens Farms Schezwan Sauce 450g", "Wingreens Farms",
      99, 119, "cheapest", "Best Value", "₹26 cheaper, restaurant-quality schezwan for fried rice",
      12, IMG.wingreensSchz, "B07PQV5T4C", 4.3, 89234),
  ]
);

export const WINGREENS_SCHEZWAN = item(
  "cond_004", "Wingreens Farms Schezwan Chutney", "Wingreens Farms",
  "Asian Sauces", 99, 119, 1, "450g",
  IMG.wingreensSchz, "B07WDHKP4C", 4.3, 112345,
  "Amazon's Choice",
  "Spicy, tangy schezwan chutney — authentic Chinese flavour for schezwan rice, noodles and dosas",
  "Schezwan sauce for Indo-Chinese cooking", "Sauce essential", 12,
  [
    sub("cond_004_s1", "Ching's Secret Schezwan Chutney 250g", "Capital Foods",
      79, 89, "cheapest", "Best Value", "₹20 cheaper, Ching's brand schezwan for fried rice",
      10, IMG.chingsChilli, "B07XKHQM4C", 4.3, 89234),
  ]
);

export const MAGGI_HOT_SWEET = item(
  "cond_005", "Maggi Hot & Sweet Ketchup", "Nestle India",
  "Ketchup & Sauces", 175, 199, 1, "1 kg",
  IMG.maggiKetchup, "B07XKHQE5C", 4.4, 189234,
  "Amazon's Choice",
  "Unique tangy-sweet blend with real tomatoes and chilli heat — the legendary dip for samosas and bread rolls",
  "Sweet chilli ketchup for Indian snacks", "Sauce essential", 14,
  [
    sub("cond_005_s1", "Kissan Fresh Tomato Ketchup 1kg", "HUL",
      160, 185, "cheapest", "Best Value", "₹15 cheaper, pure tomato classic ketchup",
      12, IMG.kissanKetchup, "B07WDHKN4C", 4.4, 234567),
  ]
);

export const SUNDROP_PEANUT_BUTTER = item(
  "cond_006", "Sundrop Peanut Butter Creamy", "Agro Tech Foods",
  "Nut Butters & Spreads", 349, 399, 1, "924g",
  IMG.sundropPB, "B07XKHQM5C", 4.3, 145678,
  "Amazon's Choice",
  "Rich, creamy peanut butter — no hydrogenated oils, good protein source, perfect on toast and in smoothies",
  "Creamy peanut butter for toast and recipes", "Spread essential", 16,
  [
    sub("cond_006_s1", "My Fitness Peanut Butter Crunchy 510g", "HF Foods",
      399, 479, "trusted", "Most Trusted", "25% protein, zero added sugar, dark roasted crunchy",
      16, IMG.sundropPB, "B07WDKH5TC", 4.4, 89234),
    sub("cond_006_s2", "Pintola Natural Peanut Butter Crunchy 1kg", "Pintola",
      549, 649, "fastest", "Fastest", "Zero additives, 28g protein/100g — thick grind",
      18, IMG.sundropPB, "B07PQV5T3C", 4.5, 67890),
  ]
);

export const KISSAN_MIXED_FRUIT_JAM = item(
  "cond_007", "Kissan Mixed Fruit Jam", "Hindustan Unilever",
  "Jams & Spreads", 145, 165, 1, "500g",
  IMG.kissamJam, "B07WDKH4TC", 4.4, 189234,
  "Best Seller",
  "Made from real fruit — thick, sweet mixed fruit jam that spreads easily on toast, bread and rotis",
  "Fruit jam for morning toast and chapatis", "Jam essential", 12,
  [
    sub("cond_007_s1", "Kissan Strawberry Jam 500g", "HUL",
      149, 169, "trusted", "Most Trusted", "Real strawberry pieces, kids' favourite",
      12, IMG.kissamJam, "B07XKHQM3C", 4.3, 123456),
  ]
);

export const MAGGI_MASALA_AE_MAGIC = item(
  "cond_008", "Maggi Masala ae Magic Seasoning Sachets", "Nestle India",
  "Seasonings", 59, 72, 1, "pack of 6 sachets × 6g",
  IMG.maggiMasala, "B07XKHQT3C", 4.4, 67890,
  "Amazon's Choice",
  "Magic masala seasoning powder — the original Maggi taste for vegetables, salads, fries and snacks",
  "All-purpose masala seasoning for snacks", "Seasoning", 12,
  [
    sub("cond_008_s1", "Catch Chaat Masala 200g", "DS Group",
      79, 89, "trusted", "Most Trusted", "Classic tangy chaat masala for fruit chaat and snacks",
      10, IMG.maggiMasala, "B07WDKH6TC", 4.3, 78234),
  ]
);

export const CHINGS_CHILLI_SAUCE = item(
  "cond_009", "Ching's Secret Red Chilli Sauce", "Capital Foods",
  "Chilli Sauces", 89, 99, 1, "680g",
  IMG.chingsChilli, "B07WDKH7TC", 4.3, 89234,
  "Best Seller",
  "Bold red chilli sauce — no artificial colours, great dipping sauce for momos, fries and wontons",
  "Chilli sauce for dips and stir-fries", "Sauce", 12,
  [
    sub("cond_009_s1", "Wingreens Schezwan Chutney 450g", "Wingreens Farms",
      99, 119, "trusted", "Most Trusted", "Richer, restaurant-style schezwan chutney",
      12, IMG.wingreensSchz, "B07WDHKP4C", 4.3, 112345),
  ]
);

export const MAGGI_KETCHUP = item(
  "cond_010", "Maggi Tomato Ketchup", "Nestle India",
  "Ketchup & Sauces", 95, 109, 1, "500g",
  IMG.maggiKetchup, "B07PQV5T2C", 4.4, 123456,
  "",
  "India's classic tomato ketchup — smooth texture, sweet-tangy balance, perfect everyday condiment",
  "Everyday tomato ketchup", "Ketchup", 12,
  [], false, true
);
