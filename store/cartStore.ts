import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, GeneratedCart, ParsedIntent, UrgencyMode } from "@/lib/types";
import { applyUrgencyMode } from "@/lib/ai/cartGenerator";

interface CartStore {
  // ─── Input state
  situationText: string;
  setSituationText: (t: string) => void;

  // ─── Intent
  intent: ParsedIntent | null;
  setIntent: (i: ParsedIntent) => void;

  // ─── Generated cart
  cart: GeneratedCart | null;
  setCart: (c: GeneratedCart) => void;

  // ─── Urgency mode
  urgencyMode: UrgencyMode;
  setUrgencyMode: (m: UrgencyMode) => void;

  // ─── Selected substitutes per item (itemId → substituteId)
  selectedSubstitutes: Record<string, string>;
  selectSubstitute: (itemId: string, subId: string) => void;

  // ─── Cart item quantity adjustments
  adjustQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;

  // ─── Loading state
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // ─── Reset
  reset: () => void;

  // ─── Computed
  getFinalItems: () => CartItem[];
  getTotalPrice: () => number;
}

const initialState = {
  situationText: "",
  intent: null,
  cart: null,
  urgencyMode: "fastest" as UrgencyMode,
  selectedSubstitutes: {},
  isLoading: false,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSituationText: (t) => set({ situationText: t }),
      setIntent: (i) => set({ intent: i }),
      setIsLoading: (v) => set({ isLoading: v }),

      setCart: (c) => set({ cart: c }),

      setUrgencyMode: (m) => {
        const { cart } = get();
        if (!cart) return set({ urgencyMode: m });
        const reranked = applyUrgencyMode(cart.items, m);
        set({ urgencyMode: m, cart: { ...cart, items: reranked } });
      },

      selectSubstitute: (itemId, subId) =>
        set((s) => ({
          selectedSubstitutes: { ...s.selectedSubstitutes, [itemId]: subId },
        })),

      adjustQuantity: (itemId, delta) =>
        set((s) => {
          if (!s.cart) return s;
          const items = s.cart.items
            .map((i) =>
              i.id === itemId
                ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                : i
            )
            .filter((i) => i.quantity > 0);
          const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { cart: { ...s.cart, items, totalPrice } };
        }),

      removeItem: (itemId) =>
        set((s) => {
          if (!s.cart) return s;
          const items = s.cart.items.filter((i) => i.id !== itemId);
          const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          return { cart: { ...s.cart, items, totalPrice, itemCount: items.length } };
        }),

      reset: () => set(initialState),

      getFinalItems: () => {
        const { cart, selectedSubstitutes } = get();
        if (!cart) return [];
        return cart.items.map((item) => {
          const subId = selectedSubstitutes[item.id];
          if (!subId) return item;
          const sub = item.substitutes.find((s) => s.id === subId);
          if (!sub) return item;
          return {
            ...item,
            name: sub.name,
            brand: sub.brand,
            price: sub.price,
            eta: sub.eta,
            image: sub.image,
          };
        });
      },

      getTotalPrice: () => {
        const { cart, selectedSubstitutes } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => {
          const subId = selectedSubstitutes[item.id];
          const sub = subId ? item.substitutes.find((s) => s.id === subId) : null;
          const price = sub ? sub.price : item.price;
          return sum + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "amazon-now-os-cart",
      partialize: (s) => ({
        situationText: s.situationText,
        intent: s.intent,
        cart: s.cart,
        urgencyMode: s.urgencyMode,
        selectedSubstitutes: s.selectedSubstitutes,
      }),
    }
  )
);
