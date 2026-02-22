import { withCollectionImages } from "@/lib/collectionImages";

export type CategoryKey =
  | "tshirts"
  | "hoodies"
  | "caps"
  | "belts"
  | "pants"
  | "knitwear"
  | "leather-jackets";

export type CatalogProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  sizes: string[];
  description: string;
  material: string;
  sustainability: string;
};

type CatalogCategory = {
  key: CategoryKey;
  title: string;
  description: string;
  products: CatalogProduct[];
};

const createProducts = (
  prefix: string,
  names: string[],
  prices: string[],
  description: string,
  material: string,
  sustainability: string,
): CatalogProduct[] =>
  names.map((name, index) => ({
    id: `${prefix}${index + 1}`,
    name,
    price: prices[index] || prices[prices.length - 1] || "€49.00",
    image: "",
    sizes: ["XS", "S", "M", "L", "XL"],
    description,
    material,
    sustainability,
  }));

const baseCategories: CatalogCategory[] = [
  {
    key: "tshirts",
    title: "T-Shirts",
    description: "Discover our curated collection of premium t-shirts, from classic essentials to statement pieces.",
    products: createProducts(
      "ts",
      [
        "Essential White Tee",
        "Urban Black Tee",
        "Graphic Print Tee",
        "Oversized Grey Tee",
        "Minimalist Cream Tee",
        "Classic Black Tee",
        "Vintage Blue Tee",
        "Streetwear Tee",
        "Premium Cotton Tee",
        "Signature Tee",
        "Limited Edition Tee",
        "Comfort Fit Tee",
        "Designer Tee",
        "Casual Crew Tee",
        "Premium Blend Tee",
      ],
      [
        "€49.00",
        "€49.00",
        "€59.00",
        "€54.00",
        "€49.00",
        "€49.00",
        "€59.00",
        "€64.00",
        "€54.00",
        "€49.00",
        "€69.00",
        "€49.00",
        "€79.00",
        "€49.00",
        "€59.00",
      ],
      "Clean-cut tee built for everyday layering and bold streetwear styling.",
      "100% combed cotton jersey",
      "Dyed with low-impact pigments and shipped in recyclable packaging",
    ),
  },
  {
    key: "hoodies",
    title: "Hoodies",
    description: "Stylish and comfortable hoodies for every season. From classic designs to contemporary styles.",
    products: createProducts(
      "h",
      [
        "Essential Hoodie",
        "Oversized Hoodie",
        "Graphic Hoodie",
        "Premium Fleece",
        "Classic Black Hoodie",
        "Urban Hoodie",
        "Minimalist Design",
        "Streetwear Hoodie",
        "Tech Hoodie",
        "Comfort Fit Hoodie",
        "Limited Edition",
        "Premium Quality",
        "Signature Style",
        "Casual Hoodie",
        "Designer Hoodie",
      ],
      [
        "€89.00",
        "€99.00",
        "€89.00",
        "€109.00",
        "€89.00",
        "€94.00",
        "€89.00",
        "€99.00",
        "€104.00",
        "€89.00",
        "€119.00",
        "€99.00",
        "€89.00",
        "€94.00",
        "€129.00",
      ],
      "Relaxed hoodie silhouette with premium weight for structured comfort.",
      "Heavyweight brushed cotton fleece",
      "Produced in audited facilities with reduced water usage",
    ),
  },
  {
    key: "caps",
    title: "Caps",
    description: "Stylish caps for any occasion. From classic designs to modern interpretations of street style.",
    products: createProducts(
      "c",
      [
        "Stealth Cap",
        "Classic Baseball Cap",
        "Urban Street Cap",
        "Premium Cotton Cap",
        "Logo Cap",
        "Vintage Wash Cap",
        "Minimalist Cap",
        "Heritage Cap",
        "Adjustable Cap",
        "Casual Cap",
        "Limited Edition Cap",
        "Premium Flex Cap",
        "Designer Cap",
        "Snapback Cap",
        "Signature Cap",
      ],
      [
        "€35.00",
        "€39.00",
        "€42.00",
        "€39.00",
        "€39.00",
        "€39.00",
        "€35.00",
        "€44.00",
        "€39.00",
        "€35.00",
        "€49.00",
        "€42.00",
        "€59.00",
        "€39.00",
        "€44.00",
      ],
      "Structured cap profile made to complete clean and functional street outfits.",
      "Organic cotton twill with inner sweatband",
      "Small-batch production and plastic-free shipping materials",
    ),
  },
  {
    key: "belts",
    title: "Belts",
    description: "Essential belts that combine style and functionality. From classic leather to contemporary designs.",
    products: createProducts(
      "b",
      [
        "Leather Belt",
        "Canvas Belt",
        "Premium Leather Belt",
        "Street Belt",
        "Classic Black Belt",
        "Brown Leather Belt",
        "Minimalist Belt",
        "Heritage Belt",
        "Silver Buckle Belt",
        "Casual Belt",
        "Limited Edition Belt",
        "Premium Belt",
        "Designer Belt",
        "Urban Belt",
        "Signature Belt",
      ],
      [
        "€59.00",
        "€44.00",
        "€79.00",
        "€49.00",
        "€54.00",
        "€64.00",
        "€44.00",
        "€69.00",
        "€54.00",
        "€44.00",
        "€89.00",
        "€74.00",
        "€99.00",
        "€59.00",
        "€69.00",
      ],
      "Statement belt hardware with clean lines and daily durability.",
      "Full-grain leather and metal buckle",
      "Sourced from traceable tanneries and packaged without single-use plastics",
    ),
  },
  {
    key: "pants",
    title: "Pants",
    description: "Premium pants collection featuring jeans, cargo pants, and trousers for every occasion.",
    products: createProducts(
      "p",
      [
        "Classic Denim",
        "Slim Fit Jeans",
        "Cargo Pants",
        "Black Trousers",
        "Minimalist Pants",
        "Street Jeans",
        "Heritage Denim",
        "Comfort Fit Pants",
        "Urban Trousers",
        "Casual Pants",
        "Limited Edition Jeans",
        "Premium Denim",
        "Designer Pants",
        "Signature Jeans",
        "Tech Pants",
      ],
      [
        "€79.00",
        "€74.00",
        "€89.00",
        "€84.00",
        "€74.00",
        "€79.00",
        "€89.00",
        "€79.00",
        "€84.00",
        "€74.00",
        "€99.00",
        "€94.00",
        "€119.00",
        "€84.00",
        "€89.00",
      ],
      "Tailored street pants balancing movement, structure, and everyday wearability.",
      "Cotton twill with added stretch",
      "Made in limited runs to reduce overproduction waste",
    ),
  },
  {
    key: "knitwear",
    title: "Knitwear",
    description: "Cozy and stylish knitwear collection. From wool sweaters to cable knits for every season.",
    products: createProducts(
      "k",
      [
        "Wool Sweater",
        "Cable Knit",
        "Merino Wool",
        "Oversized Knit",
        "Turtleneck",
        "V-Neck Sweater",
        "Minimalist Knit",
        "Heritage Sweater",
        "Cardigan Sweater",
        "Casual Knit",
        "Limited Edition",
        "Premium Wool",
        "Designer Sweater",
        "Urban Knit",
        "Signature Sweater",
      ],
      [
        "€89.00",
        "€94.00",
        "€99.00",
        "€104.00",
        "€79.00",
        "€84.00",
        "€89.00",
        "€99.00",
        "€94.00",
        "€79.00",
        "€119.00",
        "€109.00",
        "€139.00",
        "€94.00",
        "€99.00",
      ],
      "Soft knit textures with modern proportions for transitional weather.",
      "Wool blend yarn with anti-pilling finish",
      "Responsibly sourced fibers and low-impact finishing process",
    ),
  },
  {
    key: "leather-jackets",
    title: "Leather Jackets",
    description: "Premium leather jackets collection. Iconic styles that never go out of fashion.",
    products: createProducts(
      "j",
      [
        "Leather Jacket",
        "Bomber Jacket",
        "Denim Jacket",
        "Varsity Jacket",
        "Classic Leather",
        "Street Jacket",
        "Minimalist Jacket",
        "Heritage Leather",
        "Premium Jacket",
        "Urban Jacket",
        "Limited Edition",
        "Designer Jacket",
        "Signature Leather",
        "Executive Jacket",
        "Casual Jacket",
      ],
      [
        "€199.00",
        "€149.00",
        "€119.00",
        "€169.00",
        "€189.00",
        "€139.00",
        "€129.00",
        "€209.00",
        "€159.00",
        "€144.00",
        "€229.00",
        "€249.00",
        "€219.00",
        "€179.00",
        "€134.00",
      ],
      "Outerwear built to age well, with strong silhouettes and durable construction.",
      "Premium leather / mixed technical shell depending on model",
      "Durability-first production with repair-friendly component choices",
    ),
  },
];

const categoriesWithImages: CatalogCategory[] = baseCategories.map((category) => ({
  ...category,
  products: withCollectionImages(category.key, category.products),
}));

export const catalogCategories = categoriesWithImages;

export const getCategoryData = (key: CategoryKey) =>
  catalogCategories.find((category) => category.key === key) || null;

export const getAllProducts = () =>
  catalogCategories.flatMap((category) =>
    category.products.map((product) => ({ ...product, categoryKey: category.key, categoryTitle: category.title })),
  );

export const getProductByCategoryAndId = (categoryKey: CategoryKey, id: string) => {
  const category = getCategoryData(categoryKey);
  if (!category) {
    return null;
  }

  const product = category.products.find((item) => item.id === id);
  if (!product) {
    return null;
  }

  return { ...product, categoryTitle: category.title };
};
