import type { CategoryKey } from "@/lib/catalog";
import { getAllProducts } from "@/lib/catalog";
import { getCollectionImageByIndex } from "@/lib/collectionImages";

export type DbProduct = {
  dbId: number;
  id: string;
  categoryKey: CategoryKey;
  categoryTitle: string;
  name: string;
  price: string;
  description: string;
  material: string;
  sustainability: string;
  imageKey?: string;
  sizes: string[];
};

export type AdminProduct = {
  dbId: number;
  id: string;
  categoryKey: CategoryKey;
  categoryTitle: string;
  name: string;
  description: string;
  stockTotal: number;
  priceCents: number;
  material: string;
  sustainability: string;
  imageKey?: string;
  isActive: boolean;
  sizeStocks: Record<string, number>;
};

const getEndpoint = (action: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php?action=${action}`;
};

const toImageUrl = (imageKey: string | undefined, categoryKey: CategoryKey, fallbackId: string) => {
  if (imageKey && /^https?:\/\//i.test(imageKey)) {
    return imageKey;
  }

  if (imageKey && imageKey.trim()) {
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}${imageKey.replace(/^\//, "")}`;
  }

  const fromCatalog = getAllProducts().find((product) => product.categoryKey === categoryKey && product.id === fallbackId);
  if (fromCatalog?.image) {
    return fromCatalog.image;
  }

  return getCollectionImageByIndex(categoryKey, 0) || "";
};

const request = async <T>(action: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(getEndpoint(action), {
    credentials: "include",
    ...init,
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Request failed (${response.status})`);
  }
  return data;
};

const mapDbProduct = (product: DbProduct) => ({
  ...product,
  image: toImageUrl(product.imageKey, product.categoryKey, product.id),
});

export const fetchProductByCategoryAndId = async (categoryKey: CategoryKey, productId: string) => {
  const data = await request<{ product: DbProduct }>(`product_get&category=${encodeURIComponent(categoryKey)}&id=${encodeURIComponent(productId)}`);
  return mapDbProduct(data.product);
};

export const fetchProductsByCategory = async (categoryKey: CategoryKey) => {
  const data = await request<{ products: DbProduct[] }>(`products_by_category&category=${encodeURIComponent(categoryKey)}`);
  return data.products.map(mapDbProduct);
};

export const searchProducts = async (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const data = await request<{ products: DbProduct[] }>(`search&q=${encodeURIComponent(q)}`);
  return data.products.map(mapDbProduct);
};

export const fetchAdminProducts = async () => {
  return request<{ products: AdminProduct[] }>("admin_products_get");
};

export const fetchAdminOptions = async () => {
  return request<{ descriptions: string[]; sustainability: string[] }>("admin_options");
};

export const saveAdminProduct = async (input: {
  id?: string;
  categoryKey: CategoryKey;
  name: string;
  description: string;
  material: string;
  sustainability: string;
  imageKey?: string;
  isActive: boolean;
  priceCents: number;
  sizeStocks: Record<string, number>;
}) => {
  return request<{ ok: boolean; productId: number; productCode: string }>("admin_product_save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
};

export const deleteAdminProduct = async (id: string) => {
  return request<{ ok: boolean }>("admin_product_delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
};

export const uploadAdminProductImage = async (file: File) => {
  const form = new FormData();
  form.append("image", file);
  return request<{ ok: boolean; imageKey: string }>("admin_upload_image", {
    method: "POST",
    body: form,
  });
};
