/**
 * Featured items recommendation engine.
 * Generates "You may also like" suggestions based on the current cart scenario and items.
 */

import type { CartItem, Scenario } from "./types";
import { SCENARIO_CARTS } from "./data/scenarios";

export interface FeaturedItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp?: number;
  discount?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  asin?: string;
  reasonTag: string;
  eta: number;
}

/**
 * Returns up to `limit` featured items not already in the cart,
 * drawn from the current scenario's full catalog + neighboring scenarios.
 */
export function getFeaturedItems(
  currentCartItemIds: Set<string>,
  scenario: Scenario,
  limit = 8
): FeaturedItem[] {
  const featured: FeaturedItem[] = [];
  const seen = new Set<string>(currentCartItemIds);

  // Helper — convert CartItem → FeaturedItem
  const toFeatured = (item: CartItem): FeaturedItem => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    price: item.price,
    mrp: item.mrp,
    discount: item.discount,
    image: item.image,
    rating: item.rating,
    reviewCount: item.reviewCount,
    badge: item.badge,
    asin: item.asin,
    reasonTag: item.reasonTag,
    eta: item.eta,
  });

  // Scenario neighbour map — contextually related scenarios
  const NEIGHBOURS: Partial<Record<Scenario, Scenario[]>> = {
    hosting:      ["tea_break", "general", "cooking", "snacks", "beverages"],
    fever:        ["general", "travel", "baby_care"],
    pooja:        ["general", "cooking", "gifting"],
    rainy:        ["tea_break", "general", "cooking", "instant_food", "snacks"],
    travel:       ["general", "power_cut", "snacks", "personal_care"],
    power_cut:    ["travel", "general", "emergency"],
    school:       ["general", "home_repair", "office"],
    tea_break:    ["hosting", "general", "snacks", "beverages"],
    general:      ["cooking", "tea_break", "hosting", "staples", "dairy"],
    cooking:      ["general", "hosting", "staples", "condiments"],
    home_repair:  ["general", "school", "office"],
    gifting:      ["party", "snacks", "skincare", "personal_care"],
    electronics:  ["general", "home_repair", "travel", "office"],
    baby_care:    ["personal_care", "general", "dairy"],
    personal_care:["skincare", "general", "cleaning"],
    party:        ["gifting", "snacks", "beverages", "frozen_food"],
    pet_care:     ["general", "cleaning"],
    fitness:      ["general", "breakfast", "dairy", "staples"],
    cleaning:     ["personal_care", "general", "household"],
    breakfast:    ["dairy", "staples", "general", "beverages"],
    dairy:        ["breakfast", "staples", "general", "cooking"],
    frozen_food:  ["snacks", "instant_food", "general", "condiments"],
    condiments:   ["cooking", "staples", "snacks", "instant_food"],
    snacks:       ["tea_break", "hosting", "general", "beverages"],
    staples:      ["cooking", "dairy", "general", "condiments"],
    skincare:     ["personal_care", "general"],
    pest_control: ["cleaning", "general", "home_repair"],
    instant_food: ["general", "snacks", "rainy", "condiments"],
    office:       ["school", "home_repair", "general"],
  };

  const scenariosToSearch: Scenario[] = [
    scenario,
    ...(NEIGHBOURS[scenario] ?? []),
  ];

  for (const s of scenariosToSearch) {
    if (featured.length >= limit) break;
    const items = SCENARIO_CARTS[s] ?? [];
    for (const item of items) {
      if (featured.length >= limit) break;
      if (seen.has(item.id)) continue;
      // Skip items without images
      if (!item.image?.startsWith("http")) continue;
      seen.add(item.id);
      featured.push(toFeatured(item));
    }
  }

  // Sort by rating desc so the best items surface first
  return featured
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}
