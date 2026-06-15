import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  goodKnightMachine: CDN("71g+I5lZA4L"),  // Good Knight Advanced Activ+ Machine + Refill
  goodKnightPower:   CDN("81bXvM-uAML"),  // Good Knight Power Shot Automatic Room Spray 400ml
  goodKnightCoils:   CDN("81MHpBXjooL"),  // Good Knight Mosquito Coils 10s + stand
  allOut:            CDN("71DajhNISPL"),  // All Out Ultra Mosquito Repellent Machine + 45ml Refill
  allOutRefill:      CDN("71tO4H-FOBL"),  // All Out Ultra Refill 45ml x3
  hitCockroach:      CDN("71VoH6oImL"),   // HIT Cockroach Spray 200ml
  hitFly:            CDN("71bfBxdBZmL"),  // HIT Flying Insect Killer 400ml
  mortein:           CDN("71iCnP9BZNLL"), // Mortein All Insect Killer 425ml
  odomos:            CDN("71dY5xCDXCL"),  // Odomos Mosquito Repellent Cream 100g
  raidSpray:         CDN("71lI5i5oDnL"),  // Raid Multi-Insect Killer 400ml
};

function sub(id: string, name: string, brand: string, price: number, mrp: number, type: Substitute["type"], label: string, reason: string, eta: number, image: string, asin?: string, rating?: number, reviewCount?: number): Substitute {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, price, mrp, discount, type, label, reason, eta, image, asin, rating, reviewCount };
}

function item(id: string, name: string, brand: string, category: string, price: number, mrp: number, qty: number, unit: string, image: string, asin: string, rating: number, reviewCount: number, badge: string, description: string, reason: string, reasonTag: string, eta: number, substitutes: Substitute[], isEssential = true, isAddon = false): CartItem {
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { id, name, brand, category, price, mrp, discount, quantity: qty, unit, image, asin, rating, reviewCount, badge, description, reason, reasonTag, eta, substitutes, isEssential, isAddon };
}

// ─── Pest Control ─────────────────────────────────────────────────

export const GOOD_KNIGHT_MACHINE = item(
  "pest_001", "Good Knight Advanced Activ+ Liquid Vaporizer Machine + 45ml Refill", "Godrej Consumer Products",
  "Mosquito Repellents", 125, 145, 1, "machine + 1 refill (45ml, ~120 nights)",
  IMG.goodKnightMachine, "B07WDHKN4P", 4.4, 289234,
  "Best Seller",
  "India's #1 mosquito repellent — Activ+ formula is 2x more effective than standard liquid vaporizers. Child-safe, odourless",
  "Plug-in mosquito repellent for all-night protection", "Mosquito repellent", 16,
  [
    sub("pest_001_s1", "All Out Ultra Machine + Refill 45ml", "SC Johnson India",
      115, 135, "cheapest", "Best Value", "₹10 cheaper, All Out's most powerful formula",
      16, IMG.allOut, "B07XKHQM4P", 4.3, 189234),
    sub("pest_001_s2", "Good Knight Gold Flash Mosquito Repellent Machine", "Godrej Consumer Products",
      149, 169, "trusted", "Most Trusted", "Dual-mode Gold Flash — 2x more effective, faster action",
      16, IMG.goodKnightMachine, "B07WDK5H4P", 4.5, 145678),
  ]
);

export const GOOD_KNIGHT_REFILL_3PACK = item(
  "pest_002", "Good Knight Activ+ Refill — 3 Pack", "Godrej Consumer Products",
  "Mosquito Repellent Refills", 165, 189, 1, "45ml × 3 (360 nights)",
  IMG.allOutRefill, "B07WDHKQ4P", 4.4, 189234,
  "Amazon's Choice",
  "Triple pack Good Knight Activ+ refills — 3 months of protection, Activ+ technology, no harmful chemicals",
  "Economy 3-pack mosquito repellent refills", "Refill pack", 16,
  [
    sub("pest_002_s1", "All Out Ultra Refill 45ml × 3", "SC Johnson India",
      155, 175, "cheapest", "Best Value", "₹10 cheaper, 3-pack All Out Ultra refill",
      14, IMG.allOutRefill, "B07XKHQE4P", 4.3, 145678),
    sub("pest_002_s2", "Mortein Insta5 Refill 35ml × 3", "Reckitt India",
      175, 199, "trusted", "Most Trusted", "Fast-acting Insta5 formula — kills in 5 seconds",
      16, IMG.mortein, "B07WDK5H5P", 4.3, 89234),
  ]
);

export const GOOD_KNIGHT_POWER_SHOT = item(
  "pest_003", "Good Knight Power Shot Automatic Room Spray", "Godrej Consumer Products",
  "Mosquito Repellent Sprays", 275, 315, 1, "400ml (automatic dispenser)",
  IMG.goodKnightPower, "B07WDHKP4P", 4.3, 112345,
  "Amazon's Choice",
  "Automatic room spray — 2 sprays per hour keep the room mosquito-free. Works while you sleep, no plugging needed",
  "Automatic room spray for 24x7 mosquito protection", "Room spray", 16,
  [
    sub("pest_003_s1", "All Out Ultra Power Spray 400ml", "SC Johnson India",
      249, 289, "cheapest", "Best Value", "₹26 cheaper, All Out's auto room spray format",
      16, IMG.allOut, "B07XKHQM5P", 4.2, 89234),
    sub("pest_003_s2", "Mortein Smart Shield Automatic Spray 400ml", "Reckitt India",
      279, 319, "trusted", "Most Trusted", "Odourless spray, 2700 sprays per can",
      16, IMG.mortein, "B07PQV5T4P", 4.3, 67890),
  ]
);

export const HIT_COCKROACH_SPRAY = item(
  "pest_004", "HIT Crawling Insect Killer — Cockroach Spray", "Godrej Consumer Products",
  "Cockroach & Insect Killers", 140, 159, 1, "200ml",
  IMG.hitCockroach, "B07WDHKN5P", 4.3, 178234,
  "Best Seller",
  "HIT's powerful crawling insect killer — kills cockroaches, ants and spiders on contact. Long-lasting residual effect",
  "Fast-acting cockroach and crawling insect spray", "Cockroach killer", 14,
  [
    sub("pest_004_s1", "Mortein PowerGard Cockroach Killer 425ml", "Reckitt India",
      199, 229, "trusted", "Most Trusted", "Larger 425ml spray — kills and repels cockroaches",
      14, IMG.mortein, "B07XKHQE5P", 4.3, 89234),
    sub("pest_004_s2", "Raid Ant & Cockroach Killer 400ml", "SC Johnson India",
      229, 259, "fastest", "Fastest", "Raid gel bait formula — destroys entire cockroach colony",
      14, IMG.raidSpray, "B07WDK5H6P", 4.4, 67890),
  ]
);

export const HIT_FLYING_INSECT = item(
  "pest_005", "HIT Flying Insect Killer Spray", "Godrej Consumer Products",
  "Mosquito & Flying Insect Sprays", 175, 199, 1, "400ml",
  IMG.hitFly, "B07WDHKP5P", 4.3, 145678,
  "Best Seller",
  "Kills mosquitoes, flies, moths and other flying insects on contact — fast knockdown, fresh fragrance",
  "Powerful spray to kill mosquitoes and flies instantly", "Flying insect killer", 14,
  [
    sub("pest_005_s1", "Mortein All Insect Killer 425ml", "Reckitt India",
      199, 229, "trusted", "Most Trusted", "Kills mosquitoes, cockroaches, flies and ants — all-in-one",
      14, IMG.mortein, "B07XKHQM6P", 4.3, 89234),
    sub("pest_005_s2", "All Out Multi-Purpose Insect Killer 400ml", "SC Johnson India",
      165, 189, "cheapest", "Best Value", "₹10 cheaper, multi-purpose insecticide spray",
      12, IMG.allOut, "B07PQV5T5P", 4.2, 67890),
  ]
);

export const MORTEIN_SPRAY = item(
  "pest_006", "Mortein All Insect Killer Spray", "Reckitt India",
  "Multi-Insect Killers", 199, 229, 1, "425ml",
  IMG.mortein, "B07WDHKQ5P", 4.3, 112345,
  "Amazon's Choice",
  "One spray kills mosquitoes, cockroaches, ants, flies and spiders — powerful fast-acting formula",
  "All-purpose insect killer spray for home use", "Multi-insect killer", 14,
  [
    sub("pest_006_s1", "HIT Flying Insect Killer 400ml", "Godrej Consumer Products",
      175, 199, "cheapest", "Best Value", "₹24 cheaper, fast-acting flying insect spray",
      12, IMG.hitFly, "B07WDHKP5P", 4.3, 145678),
    sub("pest_006_s2", "Raid Multi-Insect Killer 400ml", "SC Johnson India",
      229, 259, "trusted", "Most Trusted", "Kills on contact + leaves residual protection",
      14, IMG.raidSpray, "B07XKHQE6P", 4.4, 56789),
  ]
);

export const GOOD_KNIGHT_COILS = item(
  "pest_007", "Good Knight Mosquito Coils", "Godrej Consumer Products",
  "Mosquito Coils", 55, 65, 1, "box of 10 coils + coil stand",
  IMG.goodKnightCoils, "B07WDKH4TP", 4.2, 145678,
  "Best Seller",
  "Long-lasting green coils for outdoor and courtyard use — 8-hour protection per coil, effective against mosquitoes",
  "Outdoor mosquito coils for gardens and open spaces", "Mosquito coil", 12,
  [
    sub("pest_007_s1", "Odomos Mosquito Repellent Cream 100g", "Dabur India",
      99, 115, "trusted", "Most Trusted", "Skin-safe repellent cream — DEET-free, protects for 8 hours",
      12, IMG.odomos, "B07PQV5T3P", 4.3, 89234),
    sub("pest_007_s2", "All Out Mosquito Coils 10s", "SC Johnson India",
      49, 59, "cheapest", "Best Value", "₹6 cheaper, All Out green coils format",
      10, IMG.allOut, "B07XKHQM7P", 4.2, 67890),
  ]
);

export const ODOMOS_CREAM = item(
  "pest_008", "Odomos Mosquito Repellent Cream", "Dabur India",
  "Mosquito Repellent Creams", 99, 115, 1, "100g",
  IMG.odomos, "B07WDHKN6P", 4.3, 112345,
  "Amazon's Choice",
  "Clinically proven skin-safe mosquito repellent cream — DEET-free, protects for up to 8 hours, fresh fragrance",
  "Non-toxic skin cream to repel mosquitoes outdoors", "Skin repellent", 14,
  [
    sub("pest_008_s1", "Odomos Naturals Cream 100g", "Dabur India",
      110, 129, "trusted", "Most Trusted", "Natural lemon grass and citronella formula",
      12, IMG.odomos, "B07XKHQE7P", 4.3, 67890),
    sub("pest_008_s2", "Good Knight Fabric Roll-On 8ml", "Godrej Consumer Products",
      45, 55, "cheapest", "Best Value", "Apply on clothes, not skin — lasts 8 hours",
      10, IMG.goodKnightMachine, "B07PQV5T2P", 4.2, 89234),
  ]
);
