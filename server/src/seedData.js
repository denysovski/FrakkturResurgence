export const CATEGORIES = [
  {
    slug: "tshirts",
    title: "T-Shirts",
    description: "Clean-cut tee built for everyday layering and bold streetwear styling.",
    material: "100% combed cotton jersey",
    sustainability: "Dyed with low-impact pigments and shipped in recyclable packaging",
    hasSizes: true,
    codesPrefix: "ts",
    names: [
      "Essential White Tee","Urban Black Tee","Graphic Print Tee","Oversized Grey Tee","Minimalist Cream Tee","Classic Black Tee","Vintage Blue Tee","Streetwear Tee","Premium Cotton Tee","Signature Tee","Limited Edition Tee","Comfort Fit Tee","Designer Tee","Casual Crew Tee","Premium Blend Tee"
    ],
    prices: [49,49,59,54,49,49,59,64,54,49,69,49,79,49,59],
  },
  {
    slug: "hoodies",
    title: "Hoodies",
    description: "Relaxed hoodie silhouette with premium weight for structured comfort.",
    material: "Heavyweight brushed cotton fleece",
    sustainability: "Produced in audited facilities with reduced water usage",
    hasSizes: true,
    codesPrefix: "h",
    names: [
      "Essential Hoodie","Oversized Hoodie","Graphic Hoodie","Premium Fleece","Classic Black Hoodie","Urban Hoodie","Minimalist Design","Streetwear Hoodie","Tech Hoodie","Comfort Fit Hoodie","Limited Edition","Premium Quality","Signature Style","Casual Hoodie","Designer Hoodie"
    ],
    prices: [89,99,89,109,89,94,89,99,104,89,119,99,89,94,129],
  },
  {
    slug: "caps",
    title: "Caps",
    description: "Structured cap profile made to complete clean and functional street outfits.",
    material: "Organic cotton twill with inner sweatband",
    sustainability: "Small-batch production and plastic-free shipping materials",
    hasSizes: false,
    codesPrefix: "c",
    names: [
      "Stealth Cap","Classic Baseball Cap","Urban Street Cap","Premium Cotton Cap","Logo Cap","Vintage Wash Cap","Minimalist Cap","Heritage Cap","Adjustable Cap","Casual Cap","Limited Edition Cap","Premium Flex Cap","Designer Cap","Snapback Cap","Signature Cap"
    ],
    prices: [35,39,42,39,39,39,35,44,39,35,49,42,59,39,44],
  },
  {
    slug: "belts",
    title: "Belts",
    description: "Statement belt hardware with clean lines and daily durability.",
    material: "Full-grain leather and metal buckle",
    sustainability: "Sourced from traceable tanneries and packaged without single-use plastics",
    hasSizes: true,
    codesPrefix: "b",
    names: [
      "Leather Belt","Canvas Belt","Premium Leather Belt","Street Belt","Classic Black Belt","Brown Leather Belt","Minimalist Belt","Heritage Belt","Silver Buckle Belt","Casual Belt","Limited Edition Belt","Premium Belt","Designer Belt","Urban Belt","Signature Belt"
    ],
    prices: [59,44,79,49,54,64,44,69,54,44,89,74,99,59,69],
  },
  {
    slug: "pants",
    title: "Pants",
    description: "Tailored street pants balancing movement, structure, and everyday wearability.",
    material: "Cotton twill with added stretch",
    sustainability: "Made in limited runs to reduce overproduction waste",
    hasSizes: true,
    codesPrefix: "p",
    names: [
      "Classic Denim","Slim Fit Jeans","Cargo Pants","Black Trousers","Minimalist Pants","Street Jeans","Heritage Denim","Comfort Fit Pants","Urban Trousers","Casual Pants","Limited Edition Jeans","Premium Denim","Designer Pants","Signature Jeans","Tech Pants"
    ],
    prices: [79,74,89,84,74,79,89,79,84,74,99,94,119,84,89],
  },
  {
    slug: "knitwear",
    title: "Knitwear",
    description: "Soft knit textures with modern proportions for transitional weather.",
    material: "Wool blend yarn with anti-pilling finish",
    sustainability: "Responsibly sourced fibers and low-impact finishing process",
    hasSizes: true,
    codesPrefix: "k",
    names: [
      "Wool Sweater","Cable Knit","Merino Wool","Oversized Knit","Turtleneck","V-Neck Sweater","Minimalist Knit","Heritage Sweater","Cardigan Sweater","Casual Knit","Limited Edition","Premium Wool","Designer Sweater","Urban Knit","Signature Sweater"
    ],
    prices: [89,94,99,104,79,84,89,99,94,79,119,109,139,94,99],
  },
  {
    slug: "leather-jackets",
    title: "Leather Jackets",
    description: "Outerwear built to age well, with strong silhouettes and durable construction.",
    material: "Premium leather / mixed technical shell depending on model",
    sustainability: "Durability-first production with repair-friendly component choices",
    hasSizes: true,
    codesPrefix: "j",
    names: [
      "Leather Jacket","Bomber Jacket","Denim Jacket","Varsity Jacket","Classic Leather","Street Jacket","Minimalist Jacket","Heritage Leather","Premium Jacket","Urban Jacket","Limited Edition","Designer Jacket","Signature Leather","Executive Jacket","Casual Jacket"
    ],
    prices: [199,149,119,169,189,139,129,209,159,144,229,249,219,179,134],
  },
];

const SIZE_POOL = ["S", "M", "L", "XL", "XXL"];

export const randomSizesForProduct = () => {
  const selected = SIZE_POOL.filter(() => Math.random() > 0.35);
  if (!selected.length) {
    selected.push(SIZE_POOL[Math.floor(Math.random() * SIZE_POOL.length)]);
  }
  return selected;
};
