import type { OrderReceipt } from "@/types/order";

const STORAGE_KEY = "amerbari:last-order";

export function saveOrderReceipt(receipt: OrderReceipt): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(receipt));
}

export function loadOrderReceipt(): OrderReceipt | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderReceipt;
  } catch {
    return null;
  }
}

export function clearOrderReceipt(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
