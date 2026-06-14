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
  BRU_INSTANT_COFFEE,
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
  DABUR_HONEY,
  YOGA_BAR_ENERGY,
  HALDIRAMS_BHUJIA,
} from "./products/food";

import {
  DOLO_650,
  VICKS_VAPORUB,
  KLEENEX_TISSUES,
  ELECTRAL_ORS,
  DABUR_HONEY_MED,
  LIMCEE_VITAMIN_C,
} from "./products/medicines";

import {
  CYCLE_AGARBATTI,
  MANGALDEEP_CAMPHOR,
  POOJA_FLOWERS,
  COCONUT_POOJA,
  AMUL_GHEE,
  INDIA_GATE_RICE,
  EVEREST_TURMERIC,
} from "./products/pooja";

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
    BRITANNIA_MARIE_GOLD,
    HALDIRAMS_BHUJIA,
    PARLE_KHARI,
  ],

  // ── Fever Care ─────────────────────────────────────────────────
  fever: [
    DOLO_650,
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
    POOJA_FLOWERS,
    COCONUT_POOJA,
    AMUL_GHEE,
    INDIA_GATE_RICE,
    EVEREST_TURMERIC,
  ],

  // ── Rainy Day ─────────────────────────────────────────────────
  rainy: [
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
    GENERAL_MAGGI,
  ],
};
