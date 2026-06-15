/**
 * Assembles SCENARIO_CARTS from individual product catalog files.
 * Each scenario maps to a curated list of CartItems from the product modules.
 */

import type { CartItem, Scenario } from "../types";

// ─── Product imports ──────────────────────────────────────────────
import {
  TATA_TEA_GOLD,
  LIPTON_TEA_BAGS,
  AMUL_TAAZA_MILK,
  CADBURY_DRINKING_CHOCOLATE,
  BISLERI_WATER_1L,
} from "./products/beverages";

import {
  BRITANNIA_MARIE_GOLD,
  PARLE_G,
  PARLE_KHARI,
  MAGGI_NOODLES,
  KNORR_SOUP,
  BRITANNIA_BREAD,
  AMUL_BUTTER,
  FARM_EGGS_6PCS,
  HALDIRAMS_BHUJIA,
  PAPER_CUPS,
  PAPER_NAPKINS,
  SUGAR_500G,
} from "./products/food";

import {
  DOLO_650,
  VICKS_VAPORUB,
  KLEENEX_TISSUES,
  ELECTRAL_ORS,
  DABUR_HONEY_MED,
  LIMCEE_VITAMIN_C,
  OMRON_THERMOMETER,
} from "./products/medicines";

import {
  CYCLE_AGARBATTI,
  MANGALDEEP_CAMPHOR,
  POOJA_FLOWERS,
  COCONUT_POOJA,
  AMUL_GHEE,
  INDIA_GATE_RICE,
  EVEREST_TURMERIC,
  DIYA_CLAY,
  KUMKUM,
} from "./products/pooja";

import {
  FORTUNE_SUNFLOWER_OIL,
  TATA_SALT,
  INDIA_GATE_RICE_5KG,
  TOOR_DAL_1KG,
  ONIONS_1KG,
  TOMATOES_500G,
  WIPRO_LED_BULB,
  SCOTCH_TAPE,
  VIM_DISHWASH,
} from "./products/household";

import {
  EVEREADY_TORCH,
  DURACELL_AA_BATTERIES,
  PARAFFIN_CANDLES,
  MATCHBOX,
  MI_POWERBANK_20000,
  BISLERI_2L,
} from "./products/emergency";

import {
  CAMLIN_HB_PENCILS,
  CLASSMATE_NOTEBOOK_A4,
  CAMLIN_COLOUR_PENCILS,
  FEVICOL_ADHESIVE,
  CLASSMATE_SCISSORS,
  DRAWING_SHEETS_ITC,
  CAMLIN_RULER,
} from "./products/stationery";

import {
  BISLERI_TRAVEL,
  TOOYUMM_TRAIL_MIX,
  YOGA_BAR_TRAVEL,
  DETTOL_SANITIZER,
  SYSKA_TRAVEL_CHARGER,
  CLASSMATE_NOTEBOOK_TRAVEL,
} from "./products/travel";

import {
  HEAD_SHOULDERS_SHAMPOO,
  DOVE_SOAP,
  DETTOL_SOAP,
  HIMALAYA_FACE_WASH,
  COLGATE_TOOTHPASTE,
  NIVEA_MOISTURIZER,
  PARACHUTE_HAIR_OIL,
  AXE_DEODORANT,
  WHISPER_PADS,
  GILLETTE_RAZOR,
  DETTOL_BODY_WASH,
  ORAL_B_TOOTHBRUSH,
} from "./products/personal_care";

import {
  PAMPERS_DIAPERS_M,
  PAMPERS_DIAPERS_L,
  PAMPERS_BABY_WIPES,
  JOHNSONS_BABY_SHAMPOO,
  JOHNSONS_BABY_OIL,
  JOHNSONS_BABY_LOTION,
  CERELAC_WHEAT,
  PIGEON_BOTTLE,
  APTAMIL_FORMULA,
} from "./products/baby_care";

import {
  BOAT_AIRDOPES,
  USB_C_CABLE,
  USB_C_CHARGER_20W,
  MI_POWERBANK_10K,
  PHILIPS_LED_BULB_9W,
  AMAZON_BASICS_USB_HUB,
  SANDISK_MICRO_SD_32GB,
  LOGITECH_MOUSE,
  MICROUSB_CABLE,
  HDMI_CABLE,
  SCREEN_PROTECTOR,
  ANCHOR_EXTENSION,
} from "./products/electronics";

import {
  HALDIRAMS_DRY_FRUIT_BOX,
  CADBURY_CELEBRATIONS,
  CADBURY_SILK,
  HALDIRAMS_SOAN_PAPDI,
  PREMIUM_GIFT_BOX,
  SATIN_RIBBON_ROLL,
  GIFT_WRAPPING_PAPER,
  GREETING_CARDS,
  IRIS_SCENTED_CANDLE,
  HALDIRAMS_GIFT_HAMPER,
} from "./products/gifting";

import {
  BIRTHDAY_BALLOON_PACK,
  HAPPY_BIRTHDAY_BANNER,
  BETTY_CROCKER_CAKE_MIX,
  BIRTHDAY_CANDLES,
  COLOURFUL_PARTY_HATS,
  PAPER_STREAMERS,
  DISPOSABLE_PLATES,
  LAYS_PARTY_PACK,
  THUMSUP_2L,
  PAPER_CUPS_PARTY,
} from "./products/party";

import {
  PEDIGREE_ADULT_DRY_1KG,
  PEDIGREE_DENTASTIX,
  WHISKAS_DRY_CAT_FOOD,
  WHISKAS_WET_POUCHES,
  STAINLESS_PET_BOWL,
  DOG_LEASH,
  HIMALAYA_PET_SHAMPOO,
  CAT_LITTER_10KG,
  TAIYO_FISH_FOOD,
} from "./products/pet_care";

import {
  ON_GOLD_STANDARD_WHEY,
  MB_CREATINE,
  YOGA_BAR_PROTEIN,
  MY_FITNESS_PEANUT_BUTTER,
  YOGA_MAT,
  STRAUSS_SKIPPING_ROPE,
  RESISTANCE_BANDS,
  GATORADE_BOTTLE,
  REAL_COCONUT_WATER,
  GRANOLA_BAR_BOX,
} from "./products/fitness";

import {
  LIZOL_FLOOR_CLEANER,
  HARPIC_TOILET_CLEANER,
  VIM_DISHWASH_BAR,
  ARIEL_MATIC,
  SURF_EXCEL_BUCKET,
  SCOTCH_BRITE_SCRUBBER,
  COLIN_GLASS_CLEANER,
  ODONIL_ROOM_FRESHENER,
  GARBAGE_BAGS,
  RUBBER_CLEANING_GLOVES,
} from "./products/cleaning";

import {
  KELLOGGS_CORN_FLAKES,
  QUAKER_OATS,
  KELLOGGS_CHOCOS,
  BAGGRRYS_MUESLI,
  HORLICKS_MALT,
  CADBURY_BOURNVITA,
  MTR_UPMA_MIX,
  MTR_POHA_MIX,
  KISSAN_JAM,
  BRITANNIA_WHOLE_WHEAT_BREAD,
} from "./products/breakfast";

import {
  DAIRY_MILK_AMUL_TAAZA,
  DAIRY_BUTTER_AMUL,
  DAIRY_GHEE_AMUL,
  BRITANNIA_CHEESE_SLICES,
  AMUL_PANEER,
  MOTHER_DAIRY_CURD,
  EPIGAMIA_GREEK_YOGURT,
  EGGS_12,
  AMUL_CHEESE_SPREAD,
  AMUL_KOOL,
} from "./products/dairy";

import {
  MCCAIN_FRENCH_FRIES,
  MCCAIN_SMILES,
  SUMERU_VEG_MOMOS,
  ITC_CHICKEN_NUGGETS,
  HALDIRAMS_FROZEN_SAMOSA,
  VADILAL_FROZEN_PEAS,
  FROZEN_PARATHA,
  MCCAIN_ALOO_TIKKI,
  SAFAL_FROZEN_SPINACH,
  SUMERU_SWEET_CORN,
} from "./products/frozen_food";

import {
  KISSAN_TOMATO_KETCHUP,
  FUNFOODS_MAYO,
  CHINGS_SOY_SAUCE,
  WINGREENS_SCHEZWAN,
  MAGGI_HOT_SWEET,
  SUNDROP_PEANUT_BUTTER,
  KISSAN_MIXED_FRUIT_JAM,
  MAGGI_MASALA_AE_MAGIC,
  CHINGS_CHILLI_SAUCE,
  MAGGI_KETCHUP,
} from "./products/condiments";

import {
  HALDIRAMS_ALOO_BHUJIA,
  HALDIRAMS_MIXTURE,
  PARLE_G_ORIGINAL,
  OREO_ORIGINAL,
  BIKAJI_BHUJIA,
  CADBURY_DAIRY_MILK,
  ROASTED_MAKHANA,
  ACT2_POPCORN,
  LAYS_CHIPS,
  KITKAT_BARS,
} from "./products/snacks";

import {
  AASHIRVAAD_ATTA,
  INDIA_GATE_BASMATI,
  TATA_SAMPANN_CHANA_DAL,
  TATA_SAMPANN_MOONG_DAL,
  STAPLES_FORTUNE_OIL,
  FORTUNE_MUSTARD_OIL,
  STAPLES_TATA_SALT,
  EVEREST_GARAM_MASALA,
  CATCH_TURMERIC,
  MDH_CHANA_MASALA,
} from "./products/staples";

import {
  MINIMALIST_SUNSCREEN,
  LAKME_SUNSCREEN,
  MINIMALIST_NIACINAMIDE,
  MINIMALIST_VIT_C,
  GARNIER_MICELLAR,
  LAKME_MOISTURIZER,
  ST_IVES_SCRUB,
  PONDS_NIGHT_CREAM,
  LAKME_KAJAL,
  CETAPHIL_CLEANSER,
} from "./products/skincare";

import {
  GOOD_KNIGHT_MACHINE,
  GOOD_KNIGHT_REFILL_3PACK,
  GOOD_KNIGHT_POWER_SHOT,
  HIT_COCKROACH_SPRAY,
  HIT_FLYING_INSECT,
  MORTEIN_SPRAY,
  GOOD_KNIGHT_COILS,
  ODOMOS_CREAM,
} from "./products/pest_control";

import {
  MTR_PANEER_BUTTER_MASALA,
  MTR_DAL_MAKHANI,
  HALDIRAMS_PAV_BHAJI,
  MAGGI_CUPPA_MANIA,
  MAGGI_INSTANT_4PK,
  YIPPEE_NOODLES,
  KNORR_TOMATO_SOUP,
  ITC_RTE_CHOLE,
  GITS_GULAB_JAMUN,
  WAI_WAI_NOODLES,
} from "./products/instant_food";

import {
  JK_COPIER_A4,
  PILOT_V7_PEN,
  POSTIT_NOTES,
  CLASSMATE_SPIRAL_NOTEBOOK,
  SCOTCH_MAGIC_TAPE,
  WHITEBOARD_MARKERS,
  KANGARO_STAPLER,
  HP_680_INK,
  CAMLIN_HIGHLIGHTERS,
  OFFICE_SCISSORS,
} from "./products/office";

// ─── Rainy-day specifics (remapped from shared products) ───────────
const RAINY_TEA = {
  ...TATA_TEA_GOLD,
  id: "rainy_tea",
  reason: "Warm Assam chai to cozy up indoors on a rainy day",
  reasonTag: "Rainy day comfort",
  eta: 12,
};

const RAINY_MILK = {
  ...AMUL_TAAZA_MILK,
  id: "rainy_milk",
  quantity: 1,
  unit: "1 L",
  reason: "Fresh milk to make a warm cup of tea or hot chocolate",
  reasonTag: "Tea essential",
  eta: 12,
};

const GENERAL_MILK = {
  ...AMUL_TAAZA_MILK,
  id: "gen_milk",
  quantity: 1,
  unit: "500 ml",
  price: 36,
  mrp: 38,
  reason: "Daily dairy requirement",
  reasonTag: "Daily essential",
  eta: 12,
};

const GENERAL_WATER = {
  ...BISLERI_WATER_1L,
  id: "gen_water",
  reason: "Basic hydration essential",
  reasonTag: "Essential",
  eta: 10,
};

const GENERAL_EGGS = {
  ...FARM_EGGS_6PCS,
  id: "gen_eggs",
  reason: "Quick protein source",
  reasonTag: "Protein source",
  eta: 14,
};

const GENERAL_MAGGI = {
  ...MAGGI_NOODLES,
  id: "gen_maggi",
  quantity: 2,
  reason: "Quick meal option",
  reasonTag: "Quick meal",
  eta: 10,
};

const TEA_BREAK_MILK = {
  ...AMUL_TAAZA_MILK,
  id: "tb_milk",
  quantity: 1,
  unit: "500 ml",
  price: 36,
  mrp: 38,
  reason: "Required for milk-based tea preparation",
  reasonTag: "Tea essential",
  eta: 10,
};


// ─── SCENARIO_CARTS ────────────────────────────────────────────────
export const SCENARIO_CARTS: Record<Scenario, CartItem[]> = {

  // ── Hosting: guests arriving soon ──────────────────────────────
  hosting: [
    TATA_TEA_GOLD,
    AMUL_TAAZA_MILK,
    SUGAR_500G,
    BRITANNIA_MARIE_GOLD,
    HALDIRAMS_BHUJIA,
    PARLE_KHARI,
    PAPER_CUPS,
    PAPER_NAPKINS,
  ],

  // ── Fever Care ─────────────────────────────────────────────────
  fever: [
    DOLO_650,
    OMRON_THERMOMETER,
    VICKS_VAPORUB,
    KLEENEX_TISSUES,
    ELECTRAL_ORS,
    KNORR_SOUP,
    DABUR_HONEY_MED,
    LIMCEE_VITAMIN_C,
  ],

  // ── Pooja Essentials ───────────────────────────────────────────
  pooja: [
    CYCLE_AGARBATTI,
    MANGALDEEP_CAMPHOR,
    DIYA_CLAY,
    POOJA_FLOWERS,
    COCONUT_POOJA,
    AMUL_GHEE,
    INDIA_GATE_RICE,
    EVEREST_TURMERIC,
    KUMKUM,
  ],

  // ── Rainy Day ─────────────────────────────────────────────────
  rainy: [
    RAINY_TEA,
    RAINY_MILK,
    CADBURY_DRINKING_CHOCOLATE,
    BRITANNIA_BREAD,
    AMUL_BUTTER,
    FARM_EGGS_6PCS,
    MAGGI_NOODLES,
    PARAFFIN_CANDLES,
  ],

  // ── Travel Prep ───────────────────────────────────────────────
  travel: [
    BISLERI_TRAVEL,
    TOOYUMM_TRAIL_MIX,
    YOGA_BAR_TRAVEL,
    DETTOL_SANITIZER,
    SYSKA_TRAVEL_CHARGER,
    CLASSMATE_NOTEBOOK_TRAVEL,
  ],

  // ── Power Cut Emergency ───────────────────────────────────────
  power_cut: [
    EVEREADY_TORCH,
    DURACELL_AA_BATTERIES,
    PARAFFIN_CANDLES,
    MATCHBOX,
    MI_POWERBANK_20000,
    BISLERI_2L,
  ],

  // ── School Project ────────────────────────────────────────────
  school: [
    CAMLIN_HB_PENCILS,
    CLASSMATE_NOTEBOOK_A4,
    CAMLIN_COLOUR_PENCILS,
    FEVICOL_ADHESIVE,
    CLASSMATE_SCISSORS,
    DRAWING_SHEETS_ITC,
    CAMLIN_RULER,
  ],

  // ── Tea Break ─────────────────────────────────────────────────
  tea_break: [
    LIPTON_TEA_BAGS,
    TEA_BREAK_MILK,
    PARLE_G,
    HALDIRAMS_BHUJIA,
  ],

  // ── General Shopping ──────────────────────────────────────────
  general: [
    GENERAL_WATER,
    BRITANNIA_BREAD,
    GENERAL_MILK,
    GENERAL_EGGS,
    ONIONS_1KG,
    TOMATOES_500G,
    TATA_SALT,
    GENERAL_MAGGI,
  ],

  // ── Cooking out of ingredients ────────────────────────────────
  cooking: [
    FORTUNE_SUNFLOWER_OIL,
    TATA_SALT,
    ONIONS_1KG,
    TOMATOES_500G,
    TOOR_DAL_1KG,
    INDIA_GATE_RICE_5KG,
  ],

  // ── Home Repair ───────────────────────────────────────────────
  home_repair: [
    WIPRO_LED_BULB,
    SCOTCH_TAPE,
    VIM_DISHWASH,
  ],

  // ── Gift Shopping ─────────────────────────────────────────────
  gifting: [
    HALDIRAMS_DRY_FRUIT_BOX,
    CADBURY_CELEBRATIONS,
    HALDIRAMS_SOAN_PAPDI,
    PREMIUM_GIFT_BOX,
    IRIS_SCENTED_CANDLE,
    CADBURY_SILK,
    GIFT_WRAPPING_PAPER,
    SATIN_RIBBON_ROLL,
    GREETING_CARDS,
    HALDIRAMS_GIFT_HAMPER,
  ],

  // ── Electronics & Tech ────────────────────────────────────────
  electronics: [
    USB_C_CABLE,
    USB_C_CHARGER_20W,
    MI_POWERBANK_10K,
    BOAT_AIRDOPES,
    ANCHOR_EXTENSION,
    SANDISK_MICRO_SD_32GB,
    PHILIPS_LED_BULB_9W,
    AMAZON_BASICS_USB_HUB,
    HDMI_CABLE,
    MICROUSB_CABLE,
    SCREEN_PROTECTOR,
    LOGITECH_MOUSE,
  ],

  // ── Baby Care ─────────────────────────────────────────────────
  baby_care: [
    PAMPERS_DIAPERS_M,
    PAMPERS_BABY_WIPES,
    JOHNSONS_BABY_SHAMPOO,
    JOHNSONS_BABY_LOTION,
    JOHNSONS_BABY_OIL,
    CERELAC_WHEAT,
    PIGEON_BOTTLE,
    PAMPERS_DIAPERS_L,
    APTAMIL_FORMULA,
  ],

  // ── Personal Care ─────────────────────────────────────────────
  personal_care: [
    HEAD_SHOULDERS_SHAMPOO,
    DOVE_SOAP,
    HIMALAYA_FACE_WASH,
    COLGATE_TOOTHPASTE,
    NIVEA_MOISTURIZER,
    PARACHUTE_HAIR_OIL,
    DETTOL_BODY_WASH,
    AXE_DEODORANT,
    ORAL_B_TOOTHBRUSH,
    DETTOL_SOAP,
    WHISPER_PADS,
    GILLETTE_RAZOR,
  ],

  // ── Party & Celebrations ──────────────────────────────────────
  party: [
    BIRTHDAY_BALLOON_PACK,
    HAPPY_BIRTHDAY_BANNER,
    BETTY_CROCKER_CAKE_MIX,
    BIRTHDAY_CANDLES,
    LAYS_PARTY_PACK,
    THUMSUP_2L,
    DISPOSABLE_PLATES,
    PAPER_CUPS_PARTY,
    COLOURFUL_PARTY_HATS,
    PAPER_STREAMERS,
  ],

  // ── Pet Care ──────────────────────────────────────────────────
  pet_care: [
    PEDIGREE_ADULT_DRY_1KG,
    PEDIGREE_DENTASTIX,
    STAINLESS_PET_BOWL,
    HIMALAYA_PET_SHAMPOO,
    WHISKAS_DRY_CAT_FOOD,
    WHISKAS_WET_POUCHES,
    CAT_LITTER_10KG,
    DOG_LEASH,
    TAIYO_FISH_FOOD,
  ],

  // ── Fitness & Gym ─────────────────────────────────────────────
  fitness: [
    ON_GOLD_STANDARD_WHEY,
    YOGA_BAR_PROTEIN,
    MY_FITNESS_PEANUT_BUTTER,
    GATORADE_BOTTLE,
    YOGA_MAT,
    MB_CREATINE,
    STRAUSS_SKIPPING_ROPE,
    RESISTANCE_BANDS,
    REAL_COCONUT_WATER,
    GRANOLA_BAR_BOX,
  ],

  // ── Cleaning & Hygiene ────────────────────────────────────────
  cleaning: [
    LIZOL_FLOOR_CLEANER,
    HARPIC_TOILET_CLEANER,
    VIM_DISHWASH_BAR,
    ARIEL_MATIC,
    SCOTCH_BRITE_SCRUBBER,
    COLIN_GLASS_CLEANER,
    ODONIL_ROOM_FRESHENER,
    GARBAGE_BAGS,
    RUBBER_CLEANING_GLOVES,
    SURF_EXCEL_BUCKET,
  ],

  // ── Breakfast & Cereals ───────────────────────────────────────
  breakfast: [
    KELLOGGS_CORN_FLAKES,
    QUAKER_OATS,
    HORLICKS_MALT,
    CADBURY_BOURNVITA,
    BRITANNIA_WHOLE_WHEAT_BREAD,
    KISSAN_JAM,
    MTR_UPMA_MIX,
    BAGGRRYS_MUESLI,
    KELLOGGS_CHOCOS,
    MTR_POHA_MIX,
  ],

  // ── Dairy & Eggs ──────────────────────────────────────────────
  dairy: [
    DAIRY_MILK_AMUL_TAAZA,
    DAIRY_BUTTER_AMUL,
    AMUL_PANEER,
    MOTHER_DAIRY_CURD,
    EGGS_12,
    BRITANNIA_CHEESE_SLICES,
    DAIRY_GHEE_AMUL,
    EPIGAMIA_GREEK_YOGURT,
    AMUL_CHEESE_SPREAD,
    AMUL_KOOL,
  ],

  // ── Frozen Food ───────────────────────────────────────────────
  frozen_food: [
    MCCAIN_FRENCH_FRIES,
    MCCAIN_SMILES,
    SUMERU_VEG_MOMOS,
    HALDIRAMS_FROZEN_SAMOSA,
    MCCAIN_ALOO_TIKKI,
    VADILAL_FROZEN_PEAS,
    FROZEN_PARATHA,
    SUMERU_SWEET_CORN,
    SAFAL_FROZEN_SPINACH,
    ITC_CHICKEN_NUGGETS,
  ],

  // ── Condiments & Sauces ───────────────────────────────────────
  condiments: [
    KISSAN_TOMATO_KETCHUP,
    FUNFOODS_MAYO,
    CHINGS_SOY_SAUCE,
    WINGREENS_SCHEZWAN,
    SUNDROP_PEANUT_BUTTER,
    KISSAN_MIXED_FRUIT_JAM,
    MAGGI_HOT_SWEET,
    CHINGS_CHILLI_SAUCE,
    MAGGI_MASALA_AE_MAGIC,
    MAGGI_KETCHUP,
  ],

  // ── Snacks & Munchies ─────────────────────────────────────────
  snacks: [
    HALDIRAMS_ALOO_BHUJIA,
    HALDIRAMS_MIXTURE,
    PARLE_G_ORIGINAL,
    BIKAJI_BHUJIA,
    LAYS_CHIPS,
    OREO_ORIGINAL,
    CADBURY_DAIRY_MILK,
    KITKAT_BARS,
    ROASTED_MAKHANA,
    ACT2_POPCORN,
  ],

  // ── Grocery Staples ───────────────────────────────────────────
  staples: [
    AASHIRVAAD_ATTA,
    INDIA_GATE_BASMATI,
    TATA_SAMPANN_CHANA_DAL,
    TATA_SAMPANN_MOONG_DAL,
    STAPLES_FORTUNE_OIL,
    FORTUNE_MUSTARD_OIL,
    STAPLES_TATA_SALT,
    EVEREST_GARAM_MASALA,
    CATCH_TURMERIC,
    MDH_CHANA_MASALA,
  ],

  // ── Skincare & Beauty ─────────────────────────────────────────
  skincare: [
    MINIMALIST_SUNSCREEN,
    LAKME_SUNSCREEN,
    MINIMALIST_NIACINAMIDE,
    MINIMALIST_VIT_C,
    GARNIER_MICELLAR,
    LAKME_MOISTURIZER,
    ST_IVES_SCRUB,
    PONDS_NIGHT_CREAM,
    LAKME_KAJAL,
    CETAPHIL_CLEANSER,
  ],

  // ── Pest Control ──────────────────────────────────────────────
  pest_control: [
    GOOD_KNIGHT_MACHINE,
    GOOD_KNIGHT_REFILL_3PACK,
    GOOD_KNIGHT_POWER_SHOT,
    HIT_COCKROACH_SPRAY,
    HIT_FLYING_INSECT,
    MORTEIN_SPRAY,
    GOOD_KNIGHT_COILS,
    ODOMOS_CREAM,
  ],

  // ── Instant & Ready-to-Eat ────────────────────────────────────
  instant_food: [
    MTR_PANEER_BUTTER_MASALA,
    MTR_DAL_MAKHANI,
    HALDIRAMS_PAV_BHAJI,
    MAGGI_INSTANT_4PK,
    MAGGI_CUPPA_MANIA,
    YIPPEE_NOODLES,
    KNORR_TOMATO_SOUP,
    ITC_RTE_CHOLE,
    GITS_GULAB_JAMUN,
    WAI_WAI_NOODLES,
  ],

  // ── Office Supplies ───────────────────────────────────────────
  office: [
    JK_COPIER_A4,
    PILOT_V7_PEN,
    POSTIT_NOTES,
    CLASSMATE_SPIRAL_NOTEBOOK,
    SCOTCH_MAGIC_TAPE,
    WHITEBOARD_MARKERS,
    KANGARO_STAPLER,
    HP_680_INK,
    CAMLIN_HIGHLIGHTERS,
    OFFICE_SCISSORS,
  ],
};
