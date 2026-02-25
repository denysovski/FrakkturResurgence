import type { CartItem } from "@/lib/cart";
import { getStoredUser } from "@/lib/auth";

export type ShippingAddress = {
  fullName: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderItem = CartItem;

export type UserOrder = {
  id: string;
  createdAt: string;
  status: "processing" | "shipped" | "delivered";
  trackingCode: string;
  currency: "EUR";
  total: number;
  address: ShippingAddress;
  items: OrderItem[];
};

const getOrdersStorageKey = () => {
  const user = getStoredUser();
  if (!user) {
    throw new Error("Please sign in to view orders.");
  }

  return `frakktur_orders_${user.id}`;
};

const readLocalOrders = (): UserOrder[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const key = getOrdersStorageKey();
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserOrder[]) : [];
  } catch {
    return [];
  }
};

const writeLocalOrders = (orders: UserOrder[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const key = getOrdersStorageKey();
  localStorage.setItem(key, JSON.stringify(orders));
};

const emitOrdersUpdated = (orders: UserOrder[]) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("frakktur:orders-updated", { detail: orders }));
  }
};

const parsePrice = (price: string) => {
  const value = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isNaN(value) ? 0 : value;
};

const createTrackingCode = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FRK-${random}`;
};

const createOrderId = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${Date.now()}-${random}`;
};

export const readOrders = async (): Promise<UserOrder[]> => {
  const orders = readLocalOrders().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  emitOrdersUpdated(orders);
  return orders;
};

export const createOrderFromCart = async (params: { items: CartItem[]; address: ShippingAddress }) => {
  if (!params.items.length) {
    throw new Error("Your cart is empty.");
  }

  const total = params.items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  const nextOrder: UserOrder = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    status: "processing",
    trackingCode: createTrackingCode(),
    currency: "EUR",
    total,
    address: params.address,
    items: params.items,
  };

  const current = readLocalOrders();
  const next = [nextOrder, ...current];
  writeLocalOrders(next);
  emitOrdersUpdated(next);
  return nextOrder;
};
