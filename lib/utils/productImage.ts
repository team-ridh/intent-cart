/**
 * productImage.ts
 *
 * Resolves a product image URL by product ID from the static productImages.json map.
 * Falls back to the product's own image field (e.g. existing Amazon CDN URL or empty string).
 *
 * The JSON is served as a static file from /public and cached by the browser.
 * This is a client-side singleton — fetched once on first call, then cached in memory.
 */

let imageMapCache: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

async function loadImageMap(): Promise<Record<string, string>> {
  if (imageMapCache) return imageMapCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/productImages.json")
    .then(r => r.json())
    .then((data: Record<string, string>) => {
      imageMapCache = data;
      return data;
    })
    .catch(() => {
      // Silently return empty map on any fetch failure — fallback handles it
      imageMapCache = {};
      return {};
    });

  return fetchPromise;
}

/**
 * Returns the best available image URL for a product.
 * @param productId  The product's `id` field (e.g. "bkf_001", "dry_003")
 * @param fallback   The image URL already stored on the CartItem (may be empty or a CDN URL)
 */
export async function resolveProductImage(
  productId: string,
  fallback: string
): Promise<string> {
  const map = await loadImageMap();
  return map[productId] || fallback;
}

/**
 * Synchronous version — only works after the map has been pre-loaded.
 * Use this in render paths after ensuring `preloadImageMap()` has been called.
 */
export function resolveProductImageSync(
  productId: string,
  fallback: string
): string {
  return imageMapCache?.[productId] || fallback;
}

/**
 * Preloads the image map — call this once near app startup (e.g. in layout or a top-level component).
 */
export function preloadImageMap(): void {
  loadImageMap();
}
