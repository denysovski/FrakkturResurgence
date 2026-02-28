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

export type AdminAssetItem = {
  category: CategoryKey;
  fileName: string;
  imageKey: string;
};

const CATEGORY_PREFIX_TO_KEY: Record<string, CategoryKey> = {
  t: "tshirts",
  h: "hoodies",
  c: "caps",
  b: "belts",
  p: "pants",
  k: "knitwear",
  j: "leather-jackets",
};

const GET_CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const categoryProductsCache = new Map<CategoryKey, ReturnType<typeof mapDbProduct>[]>();

const getEndpoint = (action: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}auth.php?action=${action}`;
};

const normalizeImageKey = (imageKey: string) => {
  const cleaned = imageKey.trim().replace(/^\.?\//, "");
  if (!cleaned) {
    return "";
  }

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const baseSegment = normalizedBase.replace(/^\//, "").replace(/\/$/, "");

  const assetsIndex = cleaned.indexOf("assets/");
  if (assetsIndex >= 0) {
    return cleaned.slice(assetsIndex);
  }

  if (baseSegment && cleaned.startsWith(`${baseSegment}/`)) {
    const withoutBase = cleaned.slice(baseSegment.length + 1);
    if (withoutBase) {
      return withoutBase;
    }
  }

  if (cleaned.startsWith("assets/")) {
    return cleaned;
  }

  if (cleaned.startsWith("uploads/products/")) {
    return `assets/${cleaned.slice("uploads/products/".length)}`;
  }

  if (cleaned.startsWith("products/")) {
    return `assets/${cleaned.slice("products/".length)}`;
  }

  if (/^[a-z-]+\/[A-Za-z0-9._-]+$/.test(cleaned)) {
    return `assets/${cleaned}`;
  }

  if (/^[a-z][0-9]+\.(jpg|jpeg|png|webp|gif)$/i.test(cleaned)) {
    const category = CATEGORY_PREFIX_TO_KEY[cleaned.charAt(0).toLowerCase()];
    if (category) {
      return `${category}/${cleaned}`;
    }
  }

  return `assets/${cleaned}`;
};

export const resolveImageUrl = (imageKey: string | undefined, categoryKey: CategoryKey, fallbackId: string) => {
  if (imageKey && /^https?:\/\//i.test(imageKey)) {
    return imageKey;
  }

  if (imageKey && imageKey.trim()) {
    const normalizedImageKey = normalizeImageKey(imageKey);
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}${normalizedImageKey}`;
  }

  const fromCatalog = getAllProducts().find((product) => product.categoryKey === categoryKey && product.id === fallbackId);
  if (fromCatalog?.image) {
    return fromCatalog.image;
  }

  return getCollectionImageByIndex(categoryKey, 0) || "";
};

const request = async <T>(action: string, init?: RequestInit): Promise<T> => {
  const method = (init?.method || "GET").toUpperCase();
  const cacheKey = `${method}:${action}`;

  if (method === "GET") {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return (await inFlight) as T;
    }
  }

  const task = (async () => {
    const response = await fetch(getEndpoint(action), {
      credentials: "include",
      ...init,
    });

    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) {
      throw new Error(typeof data.error === "string" ? data.error : `Request failed (${response.status})`);
    }

    if (method === "GET") {
      responseCache.set(cacheKey, { expiresAt: Date.now() + GET_CACHE_TTL_MS, data });
    } else {
      responseCache.clear();
    }

    return data;
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, task as Promise<unknown>);
    try {
      return await task;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  return task;
};

const mapDbProduct = (product: DbProduct) => ({
  ...product,
  name: product.name,
  image: resolveImageUrl(product.imageKey, product.categoryKey, product.id),
});

export const fetchProductByCategoryAndId = async (categoryKey: CategoryKey, productId: string) => {
  const cachedCategoryProducts = categoryProductsCache.get(categoryKey);
  if (cachedCategoryProducts) {
    const cachedProduct = cachedCategoryProducts.find((item) => item.id === productId);
    if (cachedProduct) {
      return cachedProduct;
    }
  }

  const data = await request<{ product: DbProduct }>(`product_get&category=${encodeURIComponent(categoryKey)}&id=${encodeURIComponent(productId)}`);
  return mapDbProduct(data.product);
};

export const fetchProductsByCategory = async (categoryKey: CategoryKey) => {
  const data = await request<{ products: DbProduct[] }>(`products_by_category&category=${encodeURIComponent(categoryKey)}`);
  const mapped = data.products.map(mapDbProduct);
  categoryProductsCache.set(categoryKey, mapped);
  return mapped;
};

export const getCachedProductsByCategory = (categoryKey: CategoryKey) => {
  return categoryProductsCache.get(categoryKey) || [];
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
  dbId?: number;
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

export const uploadAdminProductImage = async (category: CategoryKey, file: File) => {
  return uploadAdminAsset(category, file);
};

export const fetchAdminAssets = async (category: "all" | CategoryKey = "all") => {
  const query = `admin_assets_list&category=${encodeURIComponent(category)}`;
  return request<{ items: AdminAssetItem[] }>(query);
};

export const uploadAdminAsset = async (category: CategoryKey, file: File) => {
  const form = new FormData();
  form.append("category", category);
  form.append("image", file);
  return request<{ ok: boolean; imageKey: string }>("admin_asset_upload", {
    method: "POST",
    body: form,
  });
};

export const deleteAdminAsset = async (imageKey: string) => {
  return request<{ ok: boolean; deleted: boolean }>("admin_asset_delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageKey }),
  });
};
