"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

// Key used in sessionStorage to mark that we've already attempted hydration
// this browser tab session. Cleared when the tab is closed (unlike localStorage).
const HYDRATED_KEY = "ic_cart_hydrated";

/**
 * CartHydrator — mounts once in the root layout.
 *
 * On the very first render of a new browser tab/session, if the Zustand store
 * has no cart, it calls loadFromServer() to rehydrate from DynamoDB. This
 * handles hard-refreshes, direct URL navigation to /cart or /checkout, and
 * the back-button scenario.
 *
 * It runs exactly once per tab session (tracked via sessionStorage) so it
 * does NOT conflict with the home page's reset() call — once the user navigates
 * to home and a new cart flow begins, the hydration guard is still respected.
 *
 * Renders nothing — it is a pure side-effect component.
 */
export function CartHydrator() {
  const loadFromServer = useCartStore((s) => s.loadFromServer);
  const cart = useCartStore((s) => s.cart);

  useEffect(() => {
    // If we've already hydrated this tab session, skip.
    if (sessionStorage.getItem(HYDRATED_KEY)) return;

    // Mark as hydrated so we don't run again (even after reset()).
    sessionStorage.setItem(HYDRATED_KEY, "1");

    // Only fetch from server if the store is still empty.
    // If the store was populated by the intent flow before this fires, skip.
    if (cart === null) {
      loadFromServer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
