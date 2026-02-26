import type { CategoryKey } from "@/lib/catalog";
import { getAllProducts, getCategoryData, getProductByCategoryAndId } from "@/lib/catalog";

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

const mapCatalogProduct = (
  categoryKey: CategoryKey,
  categoryTitle: string,
  product: {
    id: string;
    name: string;
    price: string;
    sizes: string[];
    description: string;
    material: string;
    sustainability: string;
  },
  dbId: number,
): DbProduct => ({
  dbId,
  id: product.id,
  categoryKey,
  categoryTitle,
  name: product.name,
  price: product.price,
  description: product.description,
  material: product.material,
  sustainability: product.sustainability,
  imageKey: product.id,
  sizes: product.sizes,
});

export const fetchProductByCategoryAndId = async (categoryKey: CategoryKey, productId: string) => {
  const category = getCategoryData(categoryKey);
  const product = getProductByCategoryAndId(categoryKey, productId);
  if (!category || !product) {
    throw new Error("Product not found.");
  }

  const index = category.products.findIndex((item) => item.id === productId);
  return mapCatalogProduct(categoryKey, category.title, product, index + 1);
};

export const fetchProductsByCategory = async (categoryKey: CategoryKey) => {
  const category = getCategoryData(categoryKey);
  if (!category) {
    return [];
  }

  return category.products.map((product, index) => mapCatalogProduct(categoryKey, category.title, product, index + 1));
};

export const searchProducts = async (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  return getAllProducts()
    .filter((product) => product.name.toLowerCase().includes(q) || product.categoryTitle.toLowerCase().includes(q))
    .map((product, index) =>
      mapCatalogProduct(product.categoryKey, product.categoryTitle, product, index + 1),
    );
};
