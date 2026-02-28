type CollectionKey =
  | "tshirts"
  | "hoodies"
  | "caps"
  | "hats"
  | "belts"
  | "shoes"
  | "pants"
  | "knitwear"
  | "leather-jackets";

type ProductLike = {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage?: string;
};

type ImageModuleMap = Record<string, { default: string }>;

const normalizeImages = (modules: ImageModuleMap) =>
  Array.from(
    Object.entries(modules)
      .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
      .reduce((map, [path, module]) => {
        const baseKey = path.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        const extension = path.split(".").pop()?.toLowerCase();
        const existing = map.get(baseKey);

        if (!existing || extension === "webp") {
          map.set(baseKey, { extension, url: module.default });
        }

        return map;
      }, new Map<string, { extension?: string; url: string }>())
      .values(),
  ).map((item) => item.url);

const collectionImages: Record<CollectionKey, string[]> = {
  tshirts: normalizeImages(
    import.meta.glob("../assets/collections/tshirts/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  hoodies: normalizeImages(
    import.meta.glob("../assets/collections/hoodies/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  caps: normalizeImages(
    import.meta.glob("../assets/collections/caps/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  hats: normalizeImages(
    import.meta.glob("../assets/collections/hats/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  belts: normalizeImages(
    import.meta.glob("../assets/collections/belts/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  shoes: normalizeImages(
    import.meta.glob("../assets/collections/shoes/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  pants: normalizeImages(
    import.meta.glob("../assets/collections/pants/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  knitwear: normalizeImages(
    import.meta.glob("../assets/collections/knitwear/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
  "leather-jackets": normalizeImages(
    import.meta.glob("../assets/collections/jackets/*.{jpg,jpeg,png,webp}", { eager: true }) as ImageModuleMap,
  ),
};

export const withCollectionImages = <T extends ProductLike>(collection: CollectionKey, products: T[]) => {
  const images = collectionImages[collection];

  if (!images.length) {
    return products;
  }

  return products.map((product, index) => ({
    ...product,
    image: images[index % images.length],
  }));
};

export const getCollectionImageByIndex = (collection: CollectionKey, index: number) => {
  const images = collectionImages[collection] || [];
  if (!images.length) {
    return "";
  }

  return images[Math.abs(index) % images.length];
};
