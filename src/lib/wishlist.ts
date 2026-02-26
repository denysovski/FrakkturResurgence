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
  const items = readLocalWishlist();
  emitWishlistUpdated(items);
  return items;
};

export const addToWishlist = async (categoryKey: string, productCode: string) => {
  const existing = readLocalWishlist();
  const itemKey = `${categoryKey}:${productCode}`;
  if (existing.some((item) => item.key === itemKey)) {
    emitWishlistUpdated(existing);
    return;
  }

  const product = getProductByCategoryAndId(categoryKey as CategoryKey, productCode);
  const nextItem: WishlistItem = {
    key: itemKey,
    id: productCode,
    categoryKey,
    categoryTitle: product?.categoryTitle || categoryKey,
    name: product?.name || productCode,
    price: product?.price || "€0.00",
    image: product?.image || "",
  };

  const next = [nextItem, ...existing];
  writeLocalWishlist(next);
  emitWishlistUpdated(next);
};

export const removeFromWishlist = async (wishlistItemId: string) => {
  const current = readLocalWishlist();
  const next = current.filter((item) => item.key !== wishlistItemId);
  writeLocalWishlist(next);
  emitWishlistUpdated(next);
};
