import type { CartItem, Substitute } from "../../types";

const CDN = (id: string) => `https://m.media-amazon.com/images/I/${id}._SL300_.jpg`;

const IMG = {
  // Dog Food
  pedigreeDry:    CDN("71Ht1USGwiL"),   // Pedigree Adult Dry Dog Food Chicken & Vegetables
  royalCaninDog:  CDN("71Ht1USGwiL"),   // Royal Canin Adult Dog Food
  dogChewDentastix: CDN("71kLZ7rVQpL"), // Pedigree Dentastix
  droolsDog:      CDN("81NLVNXoP5S"),   // Drools Adult Dry Dog Food
  // Cat Food
  whiskasDry:     CDN("61njWyuO-dL"),   // Whiskas Adult Dry Cat Food Mackerel
  royalCaninCat:  CDN("61Yxqu5HvCL"),   // Royal Canin Indoor Adult Cat Food
  whiskasTuna:    CDN("71kTgp5+tQL"),   // Whiskas Tuna Wet Food Pouches
  droolsCat:      CDN("81NLVNXoP5S"),   // Drools Adult Dry Cat Food
  // Pet Accessories
  petBowl:        CDN("61ZZKkgEykL"),   // Stainless Steel Dog/Cat Bowl
  petLeash:       CDN("51U7u8mHO+L"),   // Nylon Dog Leash
  petShampoo:     CDN("51UYPTXkUhL"),   // Himalaya Erina Dog Shampoo
  petTreats:      CDN("71YR0J+VfIL"),   // Pedigree Chicken Jerky Treats
  scratchPost:    CDN("71hoJJn0SVL"),   // Whiskas Cat Scratch Post
  catLitter:      CDN("71-UrxTYj6L"),   // SKS Cat Litter Bentonite
  // Bird Food / Aquarium
  fishFood:       CDN("91mp-A5s1pL"),   // Taiyo Plus Premium Fish Food
  birdSeed:       CDN("51zWu4O06CL"),   // Veg Bird Seed Mix for Parrots
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

// ─── Pet Care Products ──────────────────────────────────────────────

export const PEDIGREE_ADULT_DRY_1KG = item(
  "pet_001", "Pedigree Adult Dry Dog Food — Chicken & Vegetables", "Mars Petcare India",
  "Dog Food",
  379, 429, 1, "1 kg",
  IMG.pedigreeDry,
  "B07WDHKN4P", 4.4, 89234,
  "Best Seller",
  "100% balanced nutrition with omega-6 for healthy coat and antibodies for immunity",
  "Daily complete nutrition for adult dogs", "Dog food essential", 20,
  [
    sub("pet_001_s1", "Royal Canin Medium Adult Dog Food 1kg", "Royal Canin India",
      750, 850, "trusted", "Most Trusted", "Tailored for medium breeds, supports joint health & digestion",
      22, IMG.royalCaninDog, "B07XKHQM5T", 4.5, 45678),
    sub("pet_001_s2", "Drools Adult Dry Dog Food Chicken & Egg 1kg", "Drools Pet Care",
      289, 349, "cheapest", "Best Value", "₹90 cheaper, 26% protein, Made in India, vet-recommended",
      18, IMG.droolsDog, "B07PQV5T7T", 4.3, 67890),
  ]
);

export const PEDIGREE_DENTASTIX = item(
  "pet_002", "Pedigree Dentastix Daily Oral Care Dog Treats", "Mars Petcare India",
  "Dog Treats",
  245, 280, 1, "270g (7 sticks)",
  IMG.dogChewDentastix,
  "B07XKHQE5S", 4.4, 67234,
  "Amazon's Choice",
  "X-shape cleans hard-to-reach teeth — clinically proven to reduce tartar build-up by up to 80%",
  "Daily dental care and treat for dogs", "Dog treat", 18,
  [
    sub("pet_002_s1", "Pedigree Jerky Chicken Dog Treats 75g", "Mars Petcare India",
      145, 165, "cheapest", "Best Value", "Tender chicken jerky strips — low fat, high protein treat",
      14, IMG.petTreats, "B07WDKH5TS", 4.3, 45678),
  ]
);

export const WHISKAS_DRY_CAT_FOOD = item(
  "pet_003", "Whiskas Adult Dry Cat Food — Mackerel Flavour", "Mars Petcare India",
  "Cat Food",
  349, 399, 1, "1 kg",
  IMG.whiskasDry,
  "B07WDHKQ4P", 4.3, 56789,
  "Best Seller",
  "Complete and balanced with 41 nutrients — tuna flavour crunchy kibble that cats love",
  "Daily dry food for adult cats", "Cat food essential", 18,
  [
    sub("pet_003_s1", "Royal Canin Indoor Adult Cat Food 400g", "Royal Canin India",
      599, 699, "trusted", "Most Trusted", "Tailored for indoor cats — reduces hairballs, controls weight",
      20, IMG.royalCaninCat, "B07XKHQM4T", 4.5, 34521),
    sub("pet_003_s2", "Drools Focus Adult Dry Cat Food Tuna 1kg", "Drools Pet Care",
      275, 329, "cheapest", "Best Value", "₹74 cheaper, 28% protein, taurine for heart health",
      16, IMG.droolsCat, "B07PQV4T8T", 4.2, 45678),
  ]
);

export const WHISKAS_WET_POUCHES = item(
  "pet_004", "Whiskas Wet Adult Cat Food Pouches — Tuna", "Mars Petcare India",
  "Cat Food",
  349, 379, 1, "pack of 12 pouches (85g each)",
  IMG.whiskasTuna,
  "B07XKHQT6S", 4.4, 78234,
  "Amazon's Choice",
  "Jelly-coated tuna chunks — 75% moisture, irresistible flavour that finicky cats adore",
  "Wet food supplement for better hydration and appetite", "Cat food", 18,
  [
    sub("pet_004_s1", "Royal Canin Instinctive Wet Food 85g (12 pouches)", "Royal Canin India",
      799, 899, "trusted", "Most Trusted", "Premium veterinary-grade wet food with balanced proteins",
      20, IMG.royalCaninCat, "B07WDKH6TS", 4.5, 34521),
  ]
);

export const STAINLESS_PET_BOWL = item(
  "pet_005", "Stainless Steel Non-Slip Pet Food & Water Bowl Set", "Trixie",
  "Pet Accessories",
  349, 399, 1, "set of 2 bowls (800ml each)",
  IMG.petBowl,
  "B07WDHKP8P", 4.4, 45678,
  "Amazon's Choice",
  "Food-grade steel + rubber anti-slip base — dishwasher safe, ideal for dogs & cats",
  "Durable feeding bowls for pets", "Pet essential", 16,
  [
    sub("pet_005_s1", "Trixie Ceramic Pet Bowl 300ml", "Trixie",
      249, 299, "cheapest", "Best Value", "₹100 cheaper, heavy ceramic prevents tipping",
      14, IMG.petBowl, "B07PQV5T8T", 4.3, 34521),
  ]
);

export const DOG_LEASH = item(
  "pet_006", "Nylon Dog Leash & Collar Set — 1.5m", "Trixie",
  "Pet Accessories",
  399, 449, 1, "leash + collar (adjustable, M/L)",
  IMG.petLeash,
  "B07XKHQM6T", 4.3, 34521,
  "Amazon's Choice",
  "Heavy-duty nylon webbing + metal snap hook — adjustable collar for medium to large breeds",
  "Essential for walking and training", "Pet accessory", 18,
  [
    sub("pet_006_s1", "Pets Kingdom Padded Leash & Collar Set", "Pets Kingdom",
      299, 349, "cheapest", "Best Value", "₹100 cheaper, foam-padded handle for comfort",
      16, IMG.petLeash, "B09PETLSH01", 4.2, 23456),
  ]
);

export const HIMALAYA_PET_SHAMPOO = item(
  "pet_007", "Himalaya Erina EP Dog Shampoo (Tick & Flea Control)", "Himalaya Drug Company",
  "Pet Grooming",
  175, 199, 1, "200 ml",
  IMG.petShampoo,
  "B07WDKH7TS", 4.3, 45678,
  "Amazon's Choice",
  "Herbal formula with neem — controls ticks, fleas & lice. Safe for puppies above 3 months",
  "Medicated anti-tick shampoo for dogs", "Pet hygiene", 18,
  [
    sub("pet_007_s1", "Pet Head Feeling Flaky Dog Shampoo 300ml", "Pet Head",
      449, 499, "trusted", "Most Trusted", "Natural oatmeal + tea tree — soothes dry, itchy skin",
      18, IMG.petShampoo, "B09PETSHM01", 4.4, 23456),
  ]
);

export const CAT_LITTER_10KG = item(
  "pet_008", "SKS Clumping Bentonite Cat Litter", "SKS India",
  "Cat Litter",
  499, 599, 1, "10 kg",
  IMG.catLitter,
  "B07XKHQM3T", 4.2, 34521,
  "Best Seller",
  "Premium clumping clay — locks odour for 7 days, 99% dust-free, fast clump formation",
  "Cat litter for litter box", "Cat care essential", 22,
  [
    sub("pet_008_s1", "PetSutra Clumping Cat Litter 10kg", "PetSutra",
      449, 549, "cheapest", "Best Value", "₹50 cheaper, natural sand-like texture, fragrance-free",
      20, IMG.catLitter, "B09CATLTR01", 4.1, 23456),
  ]
);

export const TAIYO_FISH_FOOD = item(
  "pet_009", "Taiyo Plus Premium Goldfish & Tropical Fish Food", "Taiyo Aqua",
  "Fish Food",
  149, 179, 1, "100g",
  IMG.fishFood,
  "B07WDKH8TS", 4.3, 23456,
  "Amazon's Choice",
  "High-protein pellets with spirulina — enhances colour, promotes growth, clean water formula",
  "Daily food for aquarium fish", "Fish food", 16,
  [
    sub("pet_009_s1", "Sera Goldy Colour Flakes 100ml", "Sera India",
      249, 299, "trusted", "Most Trusted", "Premium German fish food brand — enhances natural colour",
      18, IMG.fishFood, "B09FISHFD01", 4.4, 12345),
  ]
);
