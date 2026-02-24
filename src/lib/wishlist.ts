import { apiFetch } from "@/lib/api/client";

export type WishlistItem = {
  key: string;
  id: string;
  categoryKey: string;
  categoryTitle: string;
  name: string;
  price: string;
  image: string;
};

export const readWishlist = async (): Promise<WishlistItem[]> => {
  const response = await apiFetch("/api/wishlist");
  return response.items || [];
};

export const addToWishlist = async (categoryKey: string, productCode: string) => {
  await apiFetch("/api/wishlist/items", {
    method: "POST",
    body: JSON.stringify({ categoryKey, productCode }),
  });
};

export const removeFromWishlist = async (wishlistItemId: string) => {
  await apiFetch(`/api/wishlist/items/${wishlistItemId}`, {
    method: "DELETE",
  });
};
