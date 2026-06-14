/**
 * @deprecated Use `@/lib/data` for the full product catalog.
 *
 * This file is kept as a backward-compatible re-export wrapper so that
 * existing imports like:
 *   import { SCENARIO_CARTS } from "../mockProducts"
 * continue to work without any changes.
 *
 * All actual data now lives in lib/data/products/*.ts (one file per category)
 * and is assembled into SCENARIO_CARTS in lib/data/scenarios.ts.
 */

export { SCENARIO_CARTS } from "./data/scenarios";
