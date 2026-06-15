/**
 * Public API surface for the mock product catalog.
 * Import anything from here — scenarios, individual products, or all exports.
 */

// ─── Scenario cart map (primary export consumed by cartGenerator) ──
export { SCENARIO_CARTS } from "./scenarios";

// ─── Individual product catalogs ──────────────────────────────────
export * from "./products/beverages";
export * from "./products/food";
export * from "./products/medicines";
export * from "./products/pooja";
export * from "./products/emergency";
export * from "./products/stationery";
export * from "./products/travel";
export * from "./products/household";
// ─── New expanded catalog categories ──────────────────────────────
export * from "./products/personal_care";
export * from "./products/baby_care";
export * from "./products/electronics";
export * from "./products/gifting";
export * from "./products/party";
export * from "./products/pet_care";
export * from "./products/fitness";
export * from "./products/cleaning";

// ─── Phase 2 & 3 expanded catalog ────────────────────────────────
export * from "./products/breakfast";
export * from "./products/dairy";
export * from "./products/frozen_food";
export * from "./products/condiments";
export * from "./products/snacks";
export * from "./products/staples";
export * from "./products/skincare";
export * from "./products/pest_control";
export * from "./products/instant_food";
export * from "./products/office";
