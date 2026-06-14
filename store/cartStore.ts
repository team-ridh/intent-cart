import { create } from "zustand";
import type { CartItem, GeneratedCart, ParsedIntent, UrgencyMode } from "@/lib/types";

// ─── Store shape ──────────────────────────────────────────────────
interface CartStore {
  // Input state
  situationText: string;
  setSituationText: (t: string) => void;
  photoS3Key: string | null;
  setPhotoS3Key: (key: string | null) => void;

  // Intent
  intent: ParsedIntent | null;
  setIntent: (i: ParsedIntent) => void;

  // Generated cart
  cart: GeneratedCart | null;
  setCart: (c: GeneratedCart) => void;

  // Urgency mode
  urgencyMode: UrgencyMode;
  setUrgencyMode: (m: UrgencyMode) => void;

  // Selected substitutes: itemId → substituteId
  selectedSubstitutes: Record<string, string>;
  selectSubstitute: (itemId: string, subId: string) => void;
  setSelectedSubstitutes: (subs: Record<string, string>) => void; // bulk setter for auto-selection

  // Cart mutations — these also call the server API
  adjustQuantity: (itemId: string, delta: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  // Loading / error
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  // Server sync
  loadFromServer: () => Promise<void>;
  syncUrgencyMode: (mode: UrgencyMode) => Promise<void>;
  syncSubstitute: (itemId: string, subId: string) => Promise<void>;

  // Computed
  getFinalItems: () => CartItem[];
  getTotalPrice: () => number;

  // Reset
  reset: () => void;
}

// ─── Helper: PATCH /api/cart ──────────────────────────────────────
async function patchCart(body: Record<string, unknown>): Promise<{ cart: GeneratedCart; urgencyMode: UrgencyMode; selectedSubstitutes: Record<string, string> }> {
  const res = await fetch("/api/cart", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error ?? "Failed to update cart");
  }

  return res.json();
}

// ─── Initial state ────────────────────────────────────────────────
const INITIAL: Pick<
  CartStore,
  "situationText" | "photoS3Key" | "intent" | "cart" | "urgencyMode" | "selectedSubstitutes" | "isLoading" | "error"
> = {
  situationText: "",
  photoS3Key: null,
  intent: null,
  cart: null,
  urgencyMode: "fastest",
  selectedSubstitutes: {},
  isLoading: false,
  error: null,
};

// ─── Store (no persistence — DynamoDB is the source of truth) ────
export const useCartStore = create<CartStore>((set, get) => ({
  ...INITIAL,

  setSituationText: (t) => set({ situationText: t }),
  setPhotoS3Key: (key) => set({ photoS3Key: key }),
  setIntent: (i) => set({ intent: i }),
  setCart: (c) => set({ cart: c }),
  setIsLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  setUrgencyMode: (m) => {
    // Optimistically update UI; server sync via syncUrgencyMode
    set({ urgencyMode: m });
  },

  selectSubstitute: (itemId, subId) => {
    set((s) => ({
      selectedSubstitutes: { ...s.selectedSubstitutes, [itemId]: subId },
    }));
  },

  setSelectedSubstitutes: (subs) => set({ selectedSubstitutes: subs }),

  // ─── Load cart from DynamoDB via GET /api/cart ────────────────
  loadFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart", { credentials: "include" });

      if (res.status === 401 || res.status === 404) {
        // No session or session not found → redirect to home
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load cart" }));
        throw new Error(err.error ?? "Failed to load cart");
      }

      const data = await res.json() as {
        situationText: string;
        intent: ParsedIntent;
        cart: GeneratedCart | null;
        urgencyMode: UrgencyMode;
        selectedSubstitutes: Record<string, string>;
      };

      set({
        situationText: data.situationText,
        intent: data.intent,
        cart: data.cart,
        urgencyMode: data.urgencyMode,
        selectedSubstitutes: data.selectedSubstitutes,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load cart";
      set({ error: message, isLoading: false });
    }
  },

  // ─── Sync urgency mode change to server ───────────────────────
  syncUrgencyMode: async (mode) => {
    const prev = get().urgencyMode;
    const prevSubs = get().selectedSubstitutes;
    set({ urgencyMode: mode }); // optimistic
    try {
      const data = await patchCart({ urgencyMode: mode });
      set({
        cart: data.cart,
        urgencyMode: data.urgencyMode,
        selectedSubstitutes: data.selectedSubstitutes, // apply auto-selections from server
      });
    } catch (err) {
      set({ urgencyMode: prev, selectedSubstitutes: prevSubs }); // rollback both
      const message = err instanceof Error ? err.message : "Failed to update urgency";
      set({ error: message });
    }
  },


  // ─── Sync substitute selection to server ─────────────────────
  syncSubstitute: async (itemId, subId) => {
    const prev = get().selectedSubstitutes;
    set((s) => ({
      selectedSubstitutes: { ...s.selectedSubstitutes, [itemId]: subId },
    })); // optimistic

    try {
      const data = await patchCart({ selectedSubstitutes: { [itemId]: subId } });
      set({ selectedSubstitutes: data.selectedSubstitutes });
    } catch (err) {
      set({ selectedSubstitutes: prev }); // rollback
      const message = err instanceof Error ? err.message : "Failed to save substitute";
      set({ error: message });
    }
  },

  // ─── Adjust item quantity (optimistic + server sync) ─────────
  adjustQuantity: async (itemId, delta) => {
    const { cart } = get();
    if (!cart) return;

    // Optimistic update
    const items = cart.items
      .map((i) =>
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      )
      .filter((i) => i.quantity > 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const estimatedEta = items.length > 0 ? Math.max(...items.map((i) => i.eta)) : 0;
    const optimisticCart = { ...cart, items, totalPrice, itemCount: items.length, estimatedEta };
    set({ cart: optimisticCart });

    try {
      const data = await patchCart({ adjustItem: { itemId, delta } });
      set({ cart: data.cart });
    } catch (err) {
      set({ cart }); // rollback
      const message = err instanceof Error ? err.message : "Failed to update quantity";
      set({ error: message });
    }
  },

  // ─── Remove item (optimistic + server sync) ───────────────────
  removeItem: async (itemId) => {
    const { cart } = get();
    if (!cart) return;

    const items = cart.items.filter((i) => i.id !== itemId);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const estimatedEta = items.length > 0 ? Math.max(...items.map((i) => i.eta)) : 0;
    const optimisticCart = { ...cart, items, totalPrice, itemCount: items.length, estimatedEta };
    set({ cart: optimisticCart });

    try {
      const data = await patchCart({ removeItem: itemId });
      set({ cart: data.cart });
    } catch (err) {
      set({ cart }); // rollback
      const message = err instanceof Error ? err.message : "Failed to remove item";
      set({ error: message });
    }
  },

  // ─── Computed ─────────────────────────────────────────────────
  getFinalItems: () => {
    const { cart, selectedSubstitutes } = get();
    if (!cart) return [];
    return cart.items.map((item) => {
      const subId = selectedSubstitutes[item.id];
      if (!subId) return item;
      const sub = item.substitutes.find((s) => s.id === subId);
      if (!sub) return item;
      return { ...item, name: sub.name, brand: sub.brand, price: sub.price, eta: sub.eta, image: sub.image };
    });
  },

  getTotalPrice: () => {
    const { cart, selectedSubstitutes } = get();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => {
      const subId = selectedSubstitutes[item.id];
      const sub = subId ? item.substitutes.find((s) => s.id === subId) : null;
      return sum + (sub ? sub.price : item.price) * item.quantity;
    }, 0);
  },

  reset: () => set(INITIAL),
}));
