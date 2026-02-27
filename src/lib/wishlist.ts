import { getStoredUser } from "@/lib/auth";
import { getProductByCategoryAndId } from "@/lib/catalog";
import type { CategoryKey } from "@/lib/catalog";

export type WishlistItem = {
  key: string;
  id: string;
  categoryKey: string;
  categoryTitle: string;
  name: string;
  price: string;
  image: string;
};

const getUserStorageKey = () => {
  const user = getStoredUser();
  if (!user) {
    throw new Error("Please sign in to use wishlist.");
  }

  return `frakktur_wishlist_${user.id}`;
};

const getAuthEndpoint = (action: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php?action=${action}`;
};

const wishlistRequest = async (action: string, method: "GET" | "POST", body?: unknown) => {
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

const readLocalWishlist = (): WishlistItem[] => {
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
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
};

const writeLocalWishlist = (items: WishlistItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
};

const emitWishlistUpdated = (items: WishlistItem[]) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("frakktur:wishlist-updated", { detail: items }));
  }
};

export const readWishlist = async (): Promise<WishlistItem[]> => {
  const response = await wishlistRequest("wishlist_get", "GET");
  const rawItems = Array.isArray(response?.items) ? response.items : [];

  const items: WishlistItem[] = rawItems.map((item: { key: string; id: string; categoryKey: string }) => {
    const product = getProductByCategoryAndId(item.categoryKey as CategoryKey, item.id);
    return {
      key: item.key,
      id: item.id,
      categoryKey: item.categoryKey,
      categoryTitle: product?.categoryTitle || item.categoryKey,
      name: product?.name || item.id,
      price: product?.price || "€0.00",
      image: product?.image || "",
    };
  });

  writeLocalWishlist(items);
  emitWishlistUpdated(items);
  return items;
};

export const addToWishlist = async (categoryKey: string, productCode: string) => {
  getUserStorageKey();
  await wishlistRequest("wishlist_add", "POST", { categoryKey, productCode });
  await readWishlist();
};

export const removeFromWishlist = async (wishlistItemId: string) => {
  getUserStorageKey();
  await wishlistRequest("wishlist_remove", "POST", { key: wishlistItemId });
  await readWishlist();
};
