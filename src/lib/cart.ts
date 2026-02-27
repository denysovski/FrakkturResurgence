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

const getAuthEndpoint = (action: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php?action=${action}`;
};

const cartRequest = async (action: string, method: "GET" | "POST", body?: unknown) => {
  const response = await fetch(getAuthEndpoint(action), {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `Request failed (${response.status})`);
  }

  return data;
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
  const response = await cartRequest("cart_get", "GET");
  const rawItems = Array.isArray(response?.items) ? response.items : [];

  const items: CartItem[] = rawItems.map((item: { key: string; id: string; categoryKey: CategoryKey; size: string; quantity: number }) => {
    const product = getProductByCategoryAndId(item.categoryKey, item.id);
    return {
      key: item.key,
      id: item.id,
      categoryKey: item.categoryKey,
      name: product?.name || item.id,
      price: product?.price || "€0.00",
      image: product?.image || "",
      size: item.size,
      quantity: item.quantity,
    };
  });

  writeLocalCart(items);
  emitCartUpdated(items);
  return items;
};

export const addToCart = async (item: Omit<CartItem, "key">) => {
  getUserStorageKey();
  await cartRequest("cart_add", "POST", {
    categoryKey: item.categoryKey,
    productCode: item.id,
    size: item.size,
    quantity: item.quantity,
  });

  return readCart();
};

export const updateCartQuantity = async (key: string, quantity: number): Promise<CartItem[]> => {
  if (quantity <= 0) {
    return removeFromCart(key);
  }

  getUserStorageKey();
  await cartRequest("cart_update", "POST", { key, quantity });
  return readCart();
};

export const removeFromCart = async (key: string): Promise<CartItem[]> => {
  getUserStorageKey();
  await cartRequest("cart_remove", "POST", { key });
  return readCart();
};

export const clearCart = async (): Promise<CartItem[]> => {
  const current = await readCart();
  for (const item of current) {
    await cartRequest("cart_remove", "POST", { key: item.key });
  }
  writeLocalCart([]);
  emitCartUpdated([]);
  return [];
};
