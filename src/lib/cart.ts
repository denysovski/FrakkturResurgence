import type { CategoryKey } from "@/lib/catalog";
import { getProductByCategoryAndId } from "@/lib/catalog";
import { getStoredUser } from "@/lib/auth";

export type CartItem = {
  key: string;
  id: string;
  categoryKey: CategoryKey;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

const emitCartUpdated = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("frakktur:cart-updated", { detail: items }));
  }
};

const getUserStorageKey = () => {
  const user = getStoredUser();
  if (!user) {
    throw new Error("Please sign in to use cart.");
  }

  return `frakktur_cart_${user.id}`;
};

const readLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const key = getUserStorageKey();
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

const writeLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
};

export const readCart = async (): Promise<CartItem[]> => {
  const items = readLocalCart();
  emitCartUpdated(items);
  return items;
};

export const addToCart = async (item: Omit<CartItem, "key">) => {
  const current = readLocalCart();
  const key = `${item.categoryKey}:${item.id}:${item.size}`;
  const existing = current.find((entry) => entry.key === key);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    current.push({ ...item, key });
  }

  writeLocalCart(current);
  emitCartUpdated(current);
  return current;
};

export const updateCartQuantity = async (key: string, quantity: number): Promise<CartItem[]> => {
  if (quantity <= 0) {
    return removeFromCart(key);
  }

  const current = readLocalCart();
  const next = current.map((item) => (item.key === key ? { ...item, quantity } : item));
  writeLocalCart(next);
  emitCartUpdated(next);
  return next;
};

export const removeFromCart = async (key: string): Promise<CartItem[]> => {
  const current = readLocalCart();
  const next = current.filter((item) => item.key !== key);
  writeLocalCart(next);
  emitCartUpdated(next);
  return next;
};

export const clearCart = async (): Promise<CartItem[]> => {
  writeLocalCart([]);
  emitCartUpdated([]);
  return [];
};
