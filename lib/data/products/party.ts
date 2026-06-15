import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Party Decorations
  balloons:       CDN("81j6vUzPnCL"),   // Party Propz Birthday Balloons
  foilBalloon:    CDN("71qFiSjGTQL"),   // Star Foil Balloon Set
  bannerSet:      CDN("71Z5YNR3PNL"),   // Happy Birthday Banner & Garland
  partyHats:      CDN("81CSmAI5gkL"),   // Colourful Party Hats
  streamers:      CDN("71NtFuqIHvL"),   // Paper Streamers Rolls
  confetti:       CDN("71TKGAy4ZQL"),   // Biodegradable Confetti
  // Cakes / Bakes
  betaMix:        CDN("71gEdFiHxcL"),   // Betty Crocker Super Moist Cake Mix
  cakeCandles:    CDN("71SKMjH1WRL"),   // Number Birthday Candles
  birthdayCandle: CDN("71vQHiWpjL"),    // Spiral Twist Birthday Candles
  cakeMould:      CDN("81I6xFYFpjL"),   // Non-stick Round Cake Pan
  // Snacks for Party
  lays:           CDN("71g3X+LxjuL"),   // Lay's Classic Chips Variety Pack
  doritos:        CDN("71fIMjFQ+wL"),   // Doritos Nacho Cheese Party Pack
  kurkure:        CDN("61wNEMzaZwL"),   // Kurkure Masala Munch
  partyMix:       CDN("81sBr7nOC9L"),   // Lehar Mixtures Party Pack
  // Drinks
  lemonade:       CDN("71c5It4YHNL"),   // Nimbooz Party Pack
  sprite:         CDN("71biWoJKllL"),   // Sprite 2L PET Bottle
  thumsUp:        CDN("71Ixp4I8jdL"),   // Thums Up 2L PET Bottle
  // Plates / Cups (Disposable)
  disposablePlates: CDN("71PnGNE7FJL"), // Areca Leaf Disposable Plates
  paperCups:      CDN("81CSmAI5gL"),    // Solo Paper Cups 12oz
  partyStraws:    CDN("71X3VPXP-5L"),   // Biodegradable Paper Straws
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

// ─── Party & Celebration Supplies ────────────────────────────────────

export const BIRTHDAY_BALLOON_PACK = item(
  "party_001", "Party Propz Birthday Decoration Balloon Set", "Party Propz",
  "Party Decorations",
  299, 349, 1, "pack of 50 latex balloons",
  IMG.balloons,
  "B07WDHKN9P", 4.2, 67890,
  "Amazon's Choice",
  "50 vibrant metallic latex balloons — shiny finish, 12 inches, mix of 5 colours",
  "Essential balloon decorations for birthday party", "Party essential", 16,
  [
    sub("party_001_s1", "Foil Star & Heart Balloon Set (10 pieces)", "FECEDY",
      349, 399, "trusted", "Most Trusted", "Large 18-inch foil balloons — star & heart shapes in metallic gold",
      18, IMG.foilBalloon, "B07XKHQM4S", 4.3, 45678),
    sub("party_001_s2", "Party Galaxy Latex Balloons Pack of 100", "Party Galaxy",
      249, 299, "cheapest", "Best Value", "₹50 cheaper, 100 pieces multi-colour, 10 inch",
      14, IMG.balloons, "B07PQV5T8P", 4.1, 34521),
  ]
);

export const HAPPY_BIRTHDAY_BANNER = item(
  "party_002", "Happy Birthday Bunting Banner & Paper Garland Set", "Party Propz",
  "Party Decorations",
  249, 299, 1, "1 banner + 2 garlands + 1 foil curtain",
  IMG.bannerSet,
  "B07XKHQT4S", 4.3, 56789,
  "Amazon's Choice",
  "Golden glitter Happy Birthday letter banners + honeycomb paper balls + shiny foil curtain",
  "Backdrop decoration for birthday party", "Party decor", 14,
  [
    sub("party_002_s1", "Happy Birthday Decoration Kit — Premium", "Zyozi",
      349, 399, "trusted", "Most Trusted", "40-pc kit: banner + balloons + photo booth props + confetti",
      16, IMG.bannerSet, "B07WDKH4TP", 4.4, 34521),
  ]
);

export const BETTY_CROCKER_CAKE_MIX = item(
  "party_003", "Betty Crocker Super Moist Chocolate Fudge Cake Mix", "General Mills India",
  "Baking",
  349, 399, 1, "425g box",
  IMG.betaMix,
  "B07WDHKQ9P", 4.4, 89234,
  "Best Seller",
  "Easy 3-step recipe — just add oil, eggs and water. Moist, rich chocolate fudge cake every time",
  "DIY birthday cake base mix", "Cake mix", 18,
  [
    sub("party_003_s1", "Pillsbury Moist Supreme Yellow Cake Mix 432g", "General Mills India",
      329, 379, "cheapest", "Best Value", "₹20 cheaper, classic yellow butter cake — add eggs & oil",
      16, IMG.betaMix, "B07XKHQM2S", 4.3, 67234),
  ]
);

export const BIRTHDAY_CANDLES = item(
  "party_004", "Number Shaped Birthday Candles + Spiral Candles Set", "HKFZ",
  "Birthday Supplies",
  199, 249, 1, "2 number candles + 12 spiral candles",
  IMG.cakeCandles,
  "B07XKHQE6S", 4.4, 45678,
  "Amazon's Choice",
  "Glitter number candles (0-9) + 12 coloured spiral twist candles — adds sparkle to birthday cake",
  "Birthday cake candles", "Candle", 12,
  [
    sub("party_004_s1", "Wish Me Metallic Twisted Birthday Candles 24s", "Wish Me",
      149, 179, "cheapest", "Best Value", "₹50 cheaper, 24 metallic spiral candles in assorted colours",
      10, IMG.birthdayCandle, "B07PQV4T7P", 4.2, 23456),
  ]
);

export const COLOURFUL_PARTY_HATS = item(
  "party_005", "Colourful Party Hats (Set of 10)", "Cakeshop",
  "Party Accessories",
  149, 179, 1, "set of 10 with elastic bands",
  IMG.partyHats,
  "B09PARTY001", 4.2, 23456,
  "",
  "Cone-shaped party hats with elastic — colourful polka dot print, fits kids and adults",
  "Fun party hats for guests", "Party accessory", 12,
  [], false, true
);

export const PAPER_STREAMERS = item(
  "party_006", "Crepe Paper Streamers (6 rolls)", "Party Propz",
  "Party Decorations",
  179, 199, 1, "6 rolls × 4.5m",
  IMG.streamers,
  "B09STREAMER1", 4.2, 19234,
  "",
  "6 assorted colour crepe streamers — drape, twist, hang for quick vibrant party decoration",
  "Quick and colourful decoration garlands", "Party decor", 12,
  [], false, true
);

export const DISPOSABLE_PLATES = item(
  "party_007", "Areca Leaf Eco-Friendly Disposable Plates 12 inch", "ECOWARE",
  "Disposable Tableware",
  399, 449, 1, "pack of 25",
  IMG.disposablePlates,
  "B07WDKH5TP", 4.4, 34521,
  "Amazon's Choice",
  "100% natural areca leaf — biodegradable, microwave-safe, chemical-free. No soggy plates",
  "Eco-friendly party plates for guests", "Party tableware", 16,
  [
    sub("party_007_s1", "Chuk Bagasse Compostable Plates 12 inch (25 pcs)", "Chuk",
      349, 399, "trusted", "Most Trusted", "Sugar-cane bagasse, microwave safe, food-grade",
      14, IMG.disposablePlates, "B07XKHQM1S", 4.4, 23456),
    sub("party_007_s2", "Classic Paper Plates 9 inch (50 pcs)", "Solo India",
      199, 249, "cheapest", "Best Value", "₹200 cheaper, 50 plates, medium-weight coated paper",
      12, IMG.disposablePlates, "B07PQV5T5P", 4.1, 45678),
  ]
);

export const LAYS_PARTY_PACK = item(
  "party_008", "Lay's Variety Party Pack", "PepsiCo India",
  "Chips & Snacks",
  250, 275, 1, "variety box of 12 packs",
  IMG.lays,
  "B07WDHKP6P", 4.4, 89234,
  "Best Seller",
  "12 individual packs of Lay's Classic, Cream & Onion, Magic Masala — perfect for parties",
  "Party snack packs for guests", "Party snack", 14,
  [
    sub("party_008_s1", "Kurkure Masala Munch Party Pack 200g", "PepsiCo India",
      99, 110, "cheapest", "Best Value", "India's favourite crunchy corn puff snack",
      12, IMG.kurkure, "B07XKHQM0S", 4.4, 145678),
    sub("party_008_s2", "Doritos Nacho Cheese Jumbo Bag 198g", "PepsiCo India",
      175, 199, "trusted", "Most Trusted", "Bold nacho cheese flavour — fan favourite at parties",
      14, IMG.doritos, "B07PQV4T5P", 4.3, 67890),
  ]
);

export const THUMSUP_2L = item(
  "party_009", "Thums Up 2L PET Bottle", "Coca-Cola India",
  "Cold Drinks",
  89, 89, 3, "2L each",
  IMG.thumsUp,
  "B07XKHQT0S", 4.4, 56789,
  "Best Seller",
  "Strong, fizzy cola — India's most popular party drink at the best value in a large format",
  "Party drinks for guests", "Party beverage", 12,
  [
    sub("party_009_s1", "Sprite 2L PET Bottle (3 bottles)", "Coca-Cola India",
      267, 267, "trusted", "Most Trusted", "Clear lemon-lime soft drink, refreshing for all guests",
      12, IMG.sprite, "B07WDKH3TP", 4.4, 45678),
    sub("party_009_s2", "Nimbooz 600ml Party Bundle (6 bottles)", "PepsiCo India",
      180, 180, "cheapest", "Best Value", "Real lemon juice, no carbonation — Indian favourite",
      10, IMG.lemonade, "B07PQV5T0P", 4.3, 34521),
  ]
);

export const PAPER_CUPS_PARTY = item(
  "party_010", "Solo Paper Cups 12oz Disposable (50 pcs)", "Solo Cup Company India",
  "Disposable Tableware",
  299, 349, 1, "50 cups",
  IMG.paperCups,
  "B09PAPERCUP1", 4.3, 34521,
  "Amazon's Choice",
  "12oz (360ml) double-wall insulated cups — ideal for hot & cold party drinks, juice, chai",
  "Disposable cups for party drinks and chai", "Party tableware", 14,
  [
    sub("party_010_s1", "Biodegradable Paper Straws 100 pcs", "Straw Bros",
      149, 179, "trusted", "Most Trusted", "Eco-friendly paper straws in assorted festive colours",
      12, IMG.partyStraws, "B09STRAWS01", 4.2, 23456),
  ]
);
