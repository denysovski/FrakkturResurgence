import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import PageLayout from "@/pages/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getCategoryData, type CategoryKey } from "@/lib/catalog";
import { pushRecentlyViewed, readRecentlyViewed } from "@/lib/recentlyViewed";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { fetchProductByCategoryAndId, fetchProductsByCategory } from "@/lib/productsApi";
import { addToWishlist } from "@/lib/wishlist";
import { getStoredUser, type AuthUser } from "@/lib/auth";
import { getCollectionImageByIndex } from "@/lib/collectionImages";

const CATEGORY_SIZE_OPTIONS: Record<string, string[]> = {
  tshirts: ["XS", "S", "M", "L", "XL", "XXL"],
  hoodies: ["XS", "S", "M", "L", "XL", "XXL"],
  belts: ["UNI"],
  pants: ["XS", "S", "M", "L", "XL", "XXL"],
  knitwear: ["XS", "S", "M", "L", "XL", "XXL"],
  "leather-jackets": ["XS", "S", "M", "L", "XL", "XXL"],
  caps: ["UNI"],
};

const UNIVERSAL_SIZE_CATEGORIES = new Set<CategoryKey>(["caps", "belts"]);

const defaultSizeOptionsForCategory = (category: CategoryKey | undefined) => {
  if (!category) {
    return ["S", "M", "L", "XL"];
  }

  return CATEGORY_SIZE_OPTIONS[category] || ["S", "M", "L", "XL"];
};

const ProductDetailPage = () => {
  const { categoryKey, productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const safeCategory = categoryKey as CategoryKey | undefined;
  const category = safeCategory ? getCategoryData(safeCategory) : null;

  const [product, setProduct] = useState<null | {
    id: string;
    name: string;
    price: string;
    image: string;
    categoryTitle: string;
    description: string;
    material: string;
    sustainability: string;
  }>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [selectedSize, setSelectedSize] = useState("UNI");
  const [dbSizes, setDbSizes] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Array<{ id: string; name: string; price: string; image: string; categoryKey: CategoryKey }>>([]);
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryKey, productId]);

  useEffect(() => {
    const loadProductFromDb = async () => {
      if (!safeCategory || !productId) {
        setIsLoadingProduct(false);
        return;
      }

      try {
        const dbProduct = await fetchProductByCategoryAndId(safeCategory, productId);
        const sameCategory = await fetchProductsByCategory(safeCategory);
        setImageError(false);
        setProduct({
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
          image: dbProduct.image,
          categoryTitle: dbProduct.categoryTitle,
          description: dbProduct.description,
          material: dbProduct.material,
          sustainability: dbProduct.sustainability,
        });
        setRelatedProducts(
          sameCategory
            .filter((item) => item.id !== dbProduct.id)
            .slice(0, 8)
            .map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              categoryKey: item.categoryKey,
            })),
        );
        const sizes = dbProduct.sizes.filter(Boolean);
        setDbSizes(sizes);
        if (safeCategory && UNIVERSAL_SIZE_CATEGORIES.has(safeCategory)) {
          setSelectedSize("UNI");
        } else if (sizes.length) {
          const firstWearableSize = sizes.find((size) => size !== "UNI") || sizes[0];
          setSelectedSize(firstWearableSize);
        } else {
          setSelectedSize("S");
        }
      } catch {
        setProduct(null);
        setDbSizes([]);
        setRelatedProducts([]);
        if (safeCategory && UNIVERSAL_SIZE_CATEGORIES.has(safeCategory)) {
          setSelectedSize("UNI");
        } else {
          setSelectedSize("S");
        }
      } finally {
        setIsLoadingProduct(false);
      }
    };

    void loadProductFromDb();
  }, [safeCategory, productId]);

  const fallbackImage = safeCategory ? getCollectionImageByIndex(safeCategory, 0) : "";
  const productImage = !imageError && product?.image ? product.image : fallbackImage;

  useEffect(() => {
    const syncAuth = () => setCurrentUser(getStoredUser());
    syncAuth();

    window.addEventListener("frakktur:auth-updated", syncAuth as EventListener);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("frakktur:auth-updated", syncAuth as EventListener);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  const recentlyViewed = useMemo(() => {
    if (!product || !safeCategory) {
      return readRecentlyViewed();
    }

    return pushRecentlyViewed({
      id: product.id,
      categoryKey: safeCategory,
      categoryTitle: product.categoryTitle,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }, [product, safeCategory]);

  const similarProducts = useMemo(() => relatedProducts.slice(0, 4), [relatedProducts]);

  const recentOtherProducts = useMemo(() => {
    if (!product || !safeCategory) {
      return recentlyViewed;
    }

    const filtered = recentlyViewed.filter((item) => item.key !== `${safeCategory}:${product.id}`);
    if (filtered.length > 0) {
      return filtered;
    }

    return relatedProducts.slice(0, 4).map((item) => ({
      key: `${item.categoryKey}:${item.id}`,
      id: item.id,
      categoryKey: item.categoryKey,
      categoryTitle: category?.title || "Collection",
      name: item.name,
      price: item.price,
      image: item.image,
    }));
  }, [recentlyViewed, product, safeCategory, relatedProducts, category]);

  if (isLoadingProduct) {
    return (
      <PageLayout forceBlackNavbar={true}>
        <div className="pt-32 pb-20 px-6 md:px-10">
          <h1 className="text-3xl font-light mb-4">Loading product...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!product || !safeCategory) {
    return (
      <PageLayout forceBlackNavbar={true}>
        <div className="pt-32 pb-20 px-6 md:px-10">
          <h1 className="text-3xl font-light mb-4">Product not found</h1>
          <button onClick={() => navigate(-1)} className="text-sm underline underline-offset-4">
            Go back
          </button>
        </div>
      </PageLayout>
    );
  }

  const availableSizes = dbSizes;
  const availableSizeSet = new Set(availableSizes);
  const isUniversalProduct = !!safeCategory && UNIVERSAL_SIZE_CATEGORIES.has(safeCategory);
  const sizeOptions = isUniversalProduct
    ? ["UNI"]
    : [...new Set([...defaultSizeOptionsForCategory(safeCategory), ...availableSizes.filter((size) => size !== "UNI")])];
  const canAddSelectedSize = isUniversalProduct ? true : availableSizeSet.has(selectedSize);

  const handleAddToCart = async () => {
    if (!canAddSelectedSize) {
      toast({
        title: "Size unavailable",
        description: "This size is currently unavailable.",
      });
      return;
    }

    try {
      await addToCart({
        id: product.id,
        categoryKey: safeCategory,
        name: product.name,
        price: product.price,
        image: product.image,
        size: isUniversalProduct ? "UNI" : selectedSize,
        quantity,
      });

      toast({
        title: "Added to cart",
        description: isUniversalProduct
          ? `${product.name} × ${quantity} added to your cart.`
          : `${product.name} (${selectedSize}) × ${quantity} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Sign in required",
        description: error instanceof Error ? error.message : "Please sign in to add items to cart.",
      });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(safeCategory, product.id);
      toast({
        title: "Added to wishlist",
        description: `${product.name} added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Sign in required",
        description: error instanceof Error ? error.message : "Please sign in to add items to wishlist.",
      });
    }
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title={product?.name || "Product"}
        description={product?.description ? `${product.description} | ${product.material}` : "High-quality luxury streetwear product"}
        canonicalUrl={`https://frakktur.com/product/${categoryKey}/${productId}`}
        ogImage={productImage}
      />
      <div className="min-h-screen bg-background">
        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 max-w-7xl mx-auto px-10 py-20">
          {/* Image column - left side */}
          <div className="flex items-start justify-center lg:sticky lg:top-32 h-fit">
            <div className="w-full aspect-square bg-secondary rounded-sm overflow-hidden flex items-center justify-center animate-fade-in-image">
              <img
                src={productImage}
                alt={`${product?.name || "Product"} - Premium luxury streetwear`}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>

          {/* Content column - right side */}
          <div className="pt-0">
            <h1 className="text-4xl font-light tracking-tight mb-2 animate-fade-in-up">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in-up-1">{product.price}</p>

            {!isUniversalProduct && (
            <div className="mb-8 animate-fade-in-up-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isAvailable = availableSizeSet.has(size);
                  return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      !isAvailable
                        ? "border-border/70 text-muted-foreground/60 bg-muted/20 cursor-not-allowed"
                        : selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {size}
                  </button>
                  );
                })}
              </div>
            </div>
            )}

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="text-sm underline underline-offset-4 mb-8 animate-fade-in-up-2"
            >
              Size chart
            </button>

            <div className="space-y-4 mb-8 text-sm leading-relaxed text-muted-foreground animate-fade-in-up-3">
              <p>
                <span className="font-medium text-foreground">Description:</span> {product.description}
              </p>
              <p>
                <span className="font-medium text-foreground">Material:</span> {product.material}
              </p>
              <p>
                <span className="font-medium text-foreground">Sustainability:</span> {product.sustainability}
              </p>
            </div>

            <div className="mb-8 animate-fade-in-up-3">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 animate-fade-in-up-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddSelectedSize}
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to cart
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Add to wishlist
                </button>
              )}
            </div>

            <div className="border-t border-border pt-8 mb-8 animate-fade-in-up-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">FAQ</p>
              <Accordion type="single" collapsible>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-sm">Shipping & Returns</AccordionTrigger>
                  <AccordionContent>
                    Standard shipping takes 3-7 business days. You can return unworn items within 30 days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger className="text-sm">Product Care</AccordionTrigger>
                  <AccordionContent>
                    Wash inside out at 30°C, avoid bleach, and air dry to preserve print, fit, and fabric quality.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Tablet: Similar layout but smaller image */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 lg:hidden max-w-5xl mx-auto px-6 py-16">
          {/* Image column */}
          <div className="flex items-start justify-center md:sticky md:top-32 h-fit">
            <div className="w-full aspect-square bg-secondary rounded-sm overflow-hidden flex items-center justify-center animate-fade-in-image">
              <img src={productImage} alt={product.name} onError={() => setImageError(true)} className="w-full h-full object-contain p-6" />
            </div>
          </div>

          {/* Content column */}
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2 animate-fade-in-up">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in-up-1">{product.price}</p>

            {!isUniversalProduct && (
            <div className="mb-6 animate-fade-in-up-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isAvailable = availableSizeSet.has(size);
                  return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      !isAvailable
                        ? "border-border/70 text-muted-foreground/60 bg-muted/20 cursor-not-allowed"
                        : selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {size}
                  </button>
                  );
                })}
              </div>
            </div>
            )}

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="text-sm underline underline-offset-4 mb-6 animate-fade-in-up-2"
            >
              Size chart
            </button>

            <div className="space-y-3 mb-6 text-sm leading-relaxed text-muted-foreground animate-fade-in-up-3">
              <p>
                <span className="font-medium text-foreground">Description:</span> {product.description}
              </p>
              <p>
                <span className="font-medium text-foreground">Material:</span> {product.material}
              </p>
              <p>
                <span className="font-medium text-foreground">Sustainability:</span> {product.sustainability}
              </p>
            </div>

            <div className="mb-6 animate-fade-in-up-3">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-in-up-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddSelectedSize}
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to cart
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Add to wishlist
                </button>
              )}
            </div>

            <div className="animate-fade-in-up-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">FAQ</p>
              <Accordion type="single" collapsible>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-sm">Shipping & Returns</AccordionTrigger>
                  <AccordionContent>
                    Standard shipping takes 3-7 business days. You can return unworn items within 30 days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger className="text-sm">Product Care</AccordionTrigger>
                  <AccordionContent>
                    Wash inside out at 30°C, avoid bleach, and air dry to preserve print, fit, and fabric quality.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden px-6 py-12 max-w-md mx-auto">
          <div className="flex items-center justify-center animate-fade-in-image rounded-sm mb-8 overflow-hidden bg-secondary aspect-square">
            <img src={productImage} alt={product.name} onError={() => setImageError(true)} className="w-full h-full object-contain p-6" />
          </div>
          <h1 className="text-2xl font-light tracking-tight mb-2 animate-fade-in-up">{product.name}</h1>
          <p className="text-lg text-muted-foreground mb-6 animate-fade-in-up-1">{product.price}</p>

          {!isUniversalProduct && (
          <div className="mb-6 animate-fade-in-up-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => {
                const isAvailable = availableSizeSet.has(size);
                return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    !isAvailable
                      ? "border-border/70 text-muted-foreground/60 bg-muted/20 cursor-not-allowed"
                      : selectedSize === size
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {size}
                </button>
                );
              })}
            </div>
          </div>
          )}

          <button
            type="button"
            onClick={() => setIsSizeChartOpen(true)}
            className="text-sm underline underline-offset-4 mb-6 animate-fade-in-up-2"
          >
            Size chart
          </button>

          <div className="space-y-3 mb-6 text-sm leading-relaxed text-muted-foreground animate-fade-in-up-3">
            <p>
              <span className="font-medium text-foreground">Description:</span> {product.description}
            </p>
            <p>
              <span className="font-medium text-foreground">Material:</span> {product.material}
            </p>
            <p>
              <span className="font-medium text-foreground">Sustainability:</span> {product.sustainability}
            </p>
          </div>

          <div className="mb-6 animate-fade-in-up-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Quantity</p>
            <div className="inline-flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 hover:bg-secondary transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-2 hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-8 animate-fade-in-up-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddSelectedSize}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to cart
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={handleAddToWishlist}
                className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
              >
                <Heart className="w-4 h-4" />
                Add to wishlist
              </button>
            )}
          </div>

          <div className="border-t border-border pt-6 mb-8 animate-fade-in-up-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">FAQ</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm">Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  Standard shipping takes 3-7 business days. You can return unworn items within 30 days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-sm">Product Care</AccordionTrigger>
                <AccordionContent>
                  Wash inside out at 30°C, avoid bleach, and air dry to preserve print, fit, and fabric quality.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mb-8 animate-fade-in-up-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Similar piece of clothing</p>
            <div className="grid grid-cols-2 gap-3">
              {similarProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                  className="text-left group"
                >
                  <div className="aspect-square overflow-hidden bg-secondary mb-2 rounded-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-xs leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.price}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Similar products section - all devices */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t border-border">
          <h2 className="text-2xl font-light tracking-tight mb-8 animate-fade-in-up">Similar pieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarProducts.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                className="text-left group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden bg-secondary mb-3 rounded-sm">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-sm leading-tight group-hover:opacity-70 transition-opacity">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recently viewed section - all devices */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t border-border">
          <h2 className="text-2xl font-light tracking-tight mb-8 animate-fade-in-up">Recently viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {recentOtherProducts.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                className="text-left group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden bg-secondary mb-3 rounded-sm">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm leading-tight group-hover:opacity-70 transition-opacity">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.price}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={isSizeChartOpen} onOpenChange={setIsSizeChartOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Size chart</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">Exact size scheme for {product.name}.</p>
            <div className="border border-border">
              <div className="grid grid-cols-4 text-xs uppercase tracking-[0.12em] border-b border-border">
                <div className="p-2">Size</div>
                <div className="p-2">Chest</div>
                <div className="p-2">Length</div>
                <div className="p-2">Shoulder</div>
              </div>
              {[
                ["XS", "50 cm", "66 cm", "42 cm"],
                ["S", "53 cm", "69 cm", "44 cm"],
                ["M", "56 cm", "72 cm", "46 cm"],
                ["L", "59 cm", "75 cm", "48 cm"],
                ["XL", "62 cm", "78 cm", "50 cm"],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-4 text-sm border-b border-border last:border-b-0">
                  <div className="p-2">{row[0]}</div>
                  <div className="p-2">{row[1]}</div>
                  <div className="p-2">{row[2]}</div>
                  <div className="p-2">{row[3]}</div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default ProductDetailPage;
