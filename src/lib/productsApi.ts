import { apiFetch } from "@/lib/api/client";
import type { CategoryKey } from "@/lib/catalog";

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

export const fetchProductByCategoryAndId = async (categoryKey: CategoryKey, productId: string) => {
  const response = await apiFetch(`/api/products/${categoryKey}/${productId}`);
  return response.product as DbProduct;
};

export const fetchProductsByCategory = async (categoryKey: CategoryKey) => {
  const response = await apiFetch(`/api/categories/${categoryKey}/products`);
  return response.products as DbProduct[];
};

export const searchProducts = async (query: string) => {
  const response = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
  return response.products as DbProduct[];
};
