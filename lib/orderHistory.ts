/**
 * Client-side order history stored in localStorage.
 * No auth / no server required — persists per browser.
 * Max 20 entries, newest first.
 */

export interface OrderHistoryEntry {
  sessionId: string;
  situationText: string;
  scenarioLabel: string;
  itemCount: number;
  totalPrice: number;
  estimatedEta: number;
  confirmedAt: number; // epoch ms
}

const KEY = "ic_order_history";
const MAX = 20;

/** Read all saved orders, newest first. */
export function getOrderHistory(): OrderHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OrderHistoryEntry[];
  } catch {
    return [];
  }
}

/** Prepend a new order entry, capping at MAX. */
export function saveOrderToHistory(entry: OrderHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getOrderHistory();
    // Deduplicate by sessionId — update in place if already present
    const filtered = existing.filter((e) => e.sessionId !== entry.sessionId);
    const updated = [entry, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota)
  }
}
