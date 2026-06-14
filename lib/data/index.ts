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
