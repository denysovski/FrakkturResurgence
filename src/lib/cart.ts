import type { CategoryKey } from "@/lib/catalog";
import { getStoredUser } from "@/lib/auth";
import { fetchProductByCategoryAndId, resolveImageUrl } from "@/lib/productsApi";

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

const GUEST_CART_KEY = "frakktur_cart_guest";
const LEGACY_GUEST_CART_KEYS = ["frakktur_cart"];

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
  return user ? `frakktur_cart_${user.id}` : GUEST_CART_KEY;
};

const parseCartPayload = (raw: string | null): CartItem[] => {
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

const readLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const key = getUserStorageKey();
  const primaryItems = parseCartPayload(localStorage.getItem(key));
  if (primaryItems.length > 0) {
    return primaryItems;
  }

  // Backward compatibility for older guest-cart key naming.
  if (key === GUEST_CART_KEY) {
    for (const legacyKey of LEGACY_GUEST_CART_KEYS) {
      const legacyItems = parseCartPayload(localStorage.getItem(legacyKey));
      if (legacyItems.length > 0) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(legacyItems));
        localStorage.removeItem(legacyKey);
        return legacyItems;
      }
    }
  }

  return [];
};

const writeLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
};

const isSignedIn = () => Boolean(getStoredUser());

export const readCart = async (): Promise<CartItem[]> => {
  if (!isSignedIn()) {
    const guestItems = readLocalCart();
    emitCartUpdated(guestItems);
    return guestItems;
  }

  const response = await cartRequest("cart_get", "GET");
  const rawItems = Array.isArray(response?.items) ? response.items : [];

  const items: CartItem[] = await Promise.all(
    rawItems.map(async (item: {
      key: string;
      id: string;
      categoryKey: CategoryKey;
      name?: string;
      priceCents?: number;
      imageKey?: string;
      size: string;
      quantity: number;
    }) => {
      if (item.name && typeof item.priceCents === "number") {
        return {
          key: item.key,
          id: item.id,
          categoryKey: item.categoryKey,
          name: item.name,
          price: `€${(item.priceCents / 100).toFixed(2)}`,
          image: item.imageKey ? resolveImageUrl(item.imageKey, item.categoryKey, item.id) : "",
          size: item.size,
          quantity: item.quantity,
        };
      }

      try {
        const product = await fetchProductByCategoryAndId(item.categoryKey, item.id);
        return {
          key: item.key,
          id: item.id,
          categoryKey: item.categoryKey,
          name: product.name,
          price: product.price,
          image: product.image,
          size: item.size,
          quantity: item.quantity,
        };
      } catch {
        return {
          key: item.key,
          id: item.id,
          categoryKey: item.categoryKey,
          name: item.name || item.id,
          price: typeof item.priceCents === "number" ? `€${(item.priceCents / 100).toFixed(2)}` : "€0.00",
          image: item.imageKey ? resolveImageUrl(item.imageKey, item.categoryKey, item.id) : "",
          size: item.size,
          quantity: item.quantity,
        };
      }
    }),
  );

  writeLocalCart(items);
  emitCartUpdated(items);
  return items;
};

export const addToCart = async (item: Omit<CartItem, "key">) => {
  if (!isSignedIn()) {
    const current = readLocalCart();
    const key = `${item.categoryKey}:${item.id}:${item.size}`;
    const existingIndex = current.findIndex((currentItem) => currentItem.key === key);
    const next = [...current];

    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + item.quantity,
      };
    } else {
      next.unshift({
        ...item,
        key,
      });
    }

    writeLocalCart(next);
    emitCartUpdated(next);
    return next;
  }

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

  if (!isSignedIn()) {
    const next = readLocalCart()
      .map((item) => (item.key === key ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeLocalCart(next);
    emitCartUpdated(next);
    return next;
  }

  await cartRequest("cart_update", "POST", { key, quantity });
  return readCart();
};

export const removeFromCart = async (key: string): Promise<CartItem[]> => {
  if (!isSignedIn()) {
    const next = readLocalCart().filter((item) => item.key !== key);
    writeLocalCart(next);
    emitCartUpdated(next);
    return next;
  }

  await cartRequest("cart_remove", "POST", { key });
  return readCart();
};

export const clearCart = async (): Promise<CartItem[]> => {
  if (!isSignedIn()) {
    writeLocalCart([]);
    emitCartUpdated([]);
    return [];
  }

  const current = await readCart();
  for (const item of current) {
    await cartRequest("cart_remove", "POST", { key: item.key });
  }
  writeLocalCart([]);
  emitCartUpdated([]);
  return [];
};
