import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import PageLayout from "@/pages/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getCategoryData, getProductByCategoryAndId, type CategoryKey } from "@/lib/catalog";
import { pushRecentlyViewed, readRecentlyViewed } from "@/lib/recentlyViewed";
import { addToCart } from "@/lib/cart";
import RecentlyViewedCarousel from "@/components/RecentlyViewedCarousel";
import { useToast } from "@/hooks/use-toast";

const ProductDetailPage = () => {
  const { categoryKey, productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const safeCategory = categoryKey as CategoryKey | undefined;
  const product = safeCategory && productId ? getProductByCategoryAndId(safeCategory, productId) : null;
  const category = safeCategory ? getCategoryData(safeCategory) : null;

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[2] || "M");
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

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

  const similarProducts = useMemo(() => {
    if (!category || !product || !safeCategory) {
      return [];
    }

    return category.products
      .filter((item) => item.id !== product.id)
      .slice(0, 4)
      .map((item) => ({ ...item, categoryKey: safeCategory }));
  }, [category, product, safeCategory]);

  const recentOtherProducts = useMemo(() => {
    if (!product || !safeCategory) {
      return recentlyViewed;
    }

    return recentlyViewed.filter((item) => item.key !== `${safeCategory}:${product.id}`);
  }, [recentlyViewed, product, safeCategory]);

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

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      categoryKey: safeCategory,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}) × ${quantity} added to your cart.`,
    });
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <div className="pt-28">
        {/* Desktop: Fixed image on left, content on right */}
        <div className="hidden md:grid md:grid-cols-[800px_1fr]">
          {/* Fixed image column - left side */}
          <div className="fixed left-0 top-28 w-[800px] h-[calc(100vh-112px)] bg-secondary flex items-center justify-center z-40 border-r border-border overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-8 animate-fade-in-image" />
          </div>

          {/* Content column - right side with padding for fixed image */}
          <div className="ml-auto w-full pb-20 px-10" style={{ maxWidth: "calc(100% - 800px)" }}>
            <div className="mt-10">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2 animate-fade-in-up">{product.name}</h1>
              <p className="text-xl text-muted-foreground mb-5 animate-fade-in-up-1">{product.price}</p>

            <div className="mb-6 animate-fade-in-up-2">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="text-sm underline underline-offset-4 mb-6 animate-fade-in-up-2"
            >
              Size chart
            </button>

            <div className="space-y-4 mb-6 text-sm leading-relaxed text-muted-foreground animate-fade-in-up-3">
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

            <div className="mb-5 animate-fade-in-up-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate-fade-in-up-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Added to wishlist",
                    description: `${product.name} added to your wishlist.`,
                  })
                }
                className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
              >
                <Heart className="w-4 h-4" />
                Add to wishlist
              </button>
            </div>

            <div className="mb-8 animate-fade-in-up-2">
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
                    <div className="aspect-square overflow-hidden bg-secondary mb-2">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-xs leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up-4">
              <RecentlyViewedCarousel items={recentOtherProducts.slice(0, 4)} />
            </div>
            </div>
          </div>
        </div>

        {/* Mobile: Image above content */}
        <div className="md:hidden px-6 pb-20">
          <div className="bg-secondary flex items-center justify-center animate-fade-in-image rounded-sm mb-6 overflow-hidden" style={{ height: "500px" }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-6" />
          </div>

          <h1 className="text-3xl font-light tracking-tight mb-2 animate-fade-in-up">{product.name}</h1>
          <p className="text-xl text-muted-foreground mb-5 animate-fade-in-up-1">{product.price}</p>

          <div className="mb-6 animate-fade-in-up-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    selectedSize === size
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSizeChartOpen(true)}
            className="text-sm underline underline-offset-4 mb-6 animate-fade-in-up-2"
          >
            Size chart
          </button>

          <div className="space-y-4 mb-6 text-sm leading-relaxed text-muted-foreground animate-fade-in-up-3">
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

          <div className="mb-5 animate-fade-in-up-3">
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
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to cart
            </button>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Added to wishlist",
                  description: `${product.name} added to your wishlist.`,
                })
              }
              className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
            >
              <Heart className="w-4 h-4" />
              Add to wishlist
            </button>
          </div>

          <div className="mb-8 animate-fade-in-up-2">
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
                  <div className="aspect-square overflow-hidden bg-secondary mb-2">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-xs leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.price}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="animate-fade-in-up-4">
            <RecentlyViewedCarousel items={recentOtherProducts.slice(0, 4)} />
          </div>
        </div>

        {/* Full width recently viewed at bottom */}
        <div className="w-full px-6 md:px-10 py-16 border-t border-border bg-secondary/30">
          <h2 className="text-2xl font-light tracking-tight mb-8 animate-fade-in-up">Recently Viewed</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {recentOtherProducts.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                className="flex-shrink-0 w-[200px] text-left group animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden bg-background mb-3 rounded-sm">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm leading-tight line-clamp-2 group-hover:opacity-70 transition-opacity">{item.name}</p>
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
