import type { CategoryKey } from "@/lib/catalog";

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

const CART_COOKIE = "frakktur_cart";

export const readCart = (): CartItem[] => {
  if (typeof document === "undefined") {
    return [];
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CART_COOKIE}=`));

  if (!cookieValue) {
    return [];
  }

  const serialized = cookieValue.split("=").slice(1).join("=");

  try {
    const parsed = JSON.parse(decodeURIComponent(serialized));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeCart = (items: CartItem[]) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=2592000; SameSite=Lax`;
};

export const addToCart = (item: Omit<CartItem, "key">) => {
  const current = readCart();
  const key = `${item.categoryKey}:${item.id}:${item.size}`;
  const existing = current.find((cartItem) => cartItem.key === key);

  const updated = existing
    ? current.map((cartItem) =>
        cartItem.key === key
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem,
      )
    : [{ ...item, key }, ...current];

  writeCart(updated);
  return updated;
};
