import type { CategoryKey } from "@/lib/catalog";
import { apiFetch } from "@/lib/api/client";
import { getProductByCategoryAndId } from "@/lib/catalog";

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

export const readCart = async (): Promise<CartItem[]> => {
  const response = await apiFetch("/api/cart");
  const items = ((response.items || []) as CartItem[]).map((item) => {
    const product = getProductByCategoryAndId(item.categoryKey as CategoryKey, item.id);
    return {
      ...item,
      image: product?.image || item.image,
    };
  });
  emitCartUpdated(items);
  return items;
};

export const addToCart = async (item: Omit<CartItem, "key">) => {
  await apiFetch("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({
      categoryKey: item.categoryKey,
      productCode: item.id,
      size: item.size,
      quantity: item.quantity,
    }),
  });

  return readCart();
};

export const updateCartQuantity = async (key: string, quantity: number): Promise<CartItem[]> => {
  if (quantity <= 0) {
    return removeFromCart(key);
  }

  await apiFetch(`/api/cart/items/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

  return readCart();
};

export const removeFromCart = async (key: string): Promise<CartItem[]> => {
  await apiFetch(`/api/cart/items/${key}`, {
    method: "DELETE",
  });

  return readCart();
};