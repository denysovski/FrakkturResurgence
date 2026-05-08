import type { CartItem } from "@/lib/cart";
import { getStoredUser } from "@/lib/auth";
import type { CategoryKey } from "@/lib/catalog";
import { resolveImageUrl } from "@/lib/productsApi";

export type ShippingAddress = {
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutPaymentMethod = "bank_transfer" | "credit_card" | "cash_on_delivery";

export type OrderItem = {
  key: string;
  id: string;
  categoryKey: CategoryKey;
  categoryTitle: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type UserOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: "received" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentMethod: CheckoutPaymentMethod;
  currency: "EUR";
  subtotal: number;
  shipping: number;
  total: number;
  address: ShippingAddress;
  items: OrderItem[];
};

type CheckoutResult = {
  message: string;
  order?: UserOrder;
};

const getOrdersEndpoint = () => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php`;
};

const orderRequest = async (action: string, method: "GET" | "POST", body?: unknown) => {
  const response = await fetch(`${getOrdersEndpoint()}?action=${action}`, {
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

const emitOrdersUpdated = (orders: UserOrder[]) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("frakktur:orders-updated", { detail: orders }));
  }
};

const centsToEuros = (cents: number) => Number((cents / 100).toFixed(2));

const formatOrderItem = (item: {
  key: string;
  id: string;
  categoryKey: CategoryKey;
  categoryTitle: string;
  name: string;
  imageKey?: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}): OrderItem => ({
  key: item.key,
  id: item.id,
  categoryKey: item.categoryKey,
  categoryTitle: item.categoryTitle,
  name: item.name,
  image: item.imageKey ? resolveImageUrl(item.imageKey, item.categoryKey, item.id) : "",
  size: item.size,
  quantity: item.quantity,
  unitPrice: centsToEuros(item.unitPriceCents),
  lineTotal: centsToEuros(item.lineTotalCents),
});

const formatOrder = (order: {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: UserOrder["status"];
  paymentMethod: CheckoutPaymentMethod;
  currency: "EUR";
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  address: ShippingAddress;
  items: Array<Parameters<typeof formatOrderItem>[0]>;
}): UserOrder => ({
  id: order.orderNumber,
  orderNumber: order.orderNumber,
  createdAt: order.createdAt,
  status: order.status,
  paymentMethod: order.paymentMethod,
  currency: order.currency,
  subtotal: centsToEuros(order.subtotalCents),
  shipping: centsToEuros(order.shippingCents),
  total: centsToEuros(order.totalCents),
  address: order.address,
  items: order.items.map(formatOrderItem),
});

export const readOrders = async (): Promise<UserOrder[]> => {
  if (!getStoredUser()) {
    throw new Error("Please sign in to view orders.");
  }

  const response = await orderRequest("orders_get", "GET");
  const rawOrders = Array.isArray(response?.orders) ? response.orders : [];
  const orders = rawOrders.map(formatOrder).sort((a: UserOrder, b: UserOrder) => +new Date(b.createdAt) - +new Date(a.createdAt));
  emitOrdersUpdated(orders);
  return orders;
};

export const createOrderFromCart = async (params: {
  items: CartItem[];
  address: ShippingAddress;
  paymentMethod: CheckoutPaymentMethod;
}): Promise<CheckoutResult> => {
  if (!params.items.length) {
    throw new Error("Your cart is empty.");
  }

  const response = await orderRequest("checkout_place_order", "POST", {
    email: params.address.email,
    firstName: params.address.firstName,
    lastName: params.address.lastName,
    street: params.address.street,
    city: params.address.city,
    postalCode: params.address.postalCode,
    country: params.address.country,
    paymentMethod: params.paymentMethod,
    items: params.items.map((item) => ({
      categoryKey: item.categoryKey,
      productCode: item.id,
      size: item.size,
      quantity: item.quantity,
    })),
  });

  if (response?.order) {
    return {
      message: typeof response.message === "string" ? response.message : "Order placed successfully.",
      order: formatOrder(response.order),
    };
  }

  return {
    message: typeof response?.message === "string" ? response.message : "Vaše objednávka byla přijata.",
  };
};
