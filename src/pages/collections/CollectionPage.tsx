import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Sparkles, TrendingUp, Star, DollarSign, ChevronDown, Grid2x2, Grid3x3, Type, Heart, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface CollectionProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage?: string;
  sizes?: string[];
  description?: string;
  material?: string;
  sustainability?: string;
}

interface CollectionPageProps {
  title: string;
  description?: string;
  products: CollectionProduct[];
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;
const RECENTLY_VIEWED_COOKIE = "frakktur_recently_viewed";

type RecentlyViewedItem = {
  key: string;
  id: string;
  collection: string;
  name: string;
  price: string;
  image: string;
};

const parsePriceValue = (price: string) => {
  const numeric = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const readRecentlyViewed = (): RecentlyViewedItem[] => {
  if (typeof document === "undefined") {
    return [];
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${RECENTLY_VIEWED_COOKIE}=`));

  if (!cookieValue) {
    return [];
  }

  const serialized = cookieValue.split("=").slice(1).join("=");

  try {
    const parsed = JSON.parse(decodeURIComponent(serialized));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRecentlyViewed = (items: RecentlyViewedItem[]) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${RECENTLY_VIEWED_COOKIE}=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=2592000; SameSite=Lax`;
};

const CollectionPage = ({
  title,
  description,
  products,
  itemsPerPage = ITEMS_PER_PAGE,
}: CollectionPageProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [gridCols, setGridCols] = useState(4);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<CollectionProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => readRecentlyViewed());
  const { toast } = useToast();

  const enrichProduct = (product: CollectionProduct): CollectionProduct => ({
    ...product,
    sizes: product.sizes ?? ["XS", "S", "M", "L", "XL"],
    description:
      product.description ??
      `A versatile ${title.toLowerCase()} piece designed for daily rotation and layered streetwear looks.`,
    material: product.material ?? "100% premium cotton blend with reinforced seams",
    sustainability:
      product.sustainability ??
      "Produced in small batches with lower-impact dyes and recyclable packaging.",
  });

  const openProduct = (product: CollectionProduct) => {
    const enriched = enrichProduct(product);
    setActiveProduct(enriched);
    setSelectedSize(enriched.sizes?.[2] || "M");

    const itemKey = `${title}:${enriched.id}`;
    const nextItem: RecentlyViewedItem = {
      key: itemKey,
      id: enriched.id,
      collection: title,
      name: enriched.name,
      price: enriched.price,
      image: enriched.image,
    };

    const updated = [nextItem, ...readRecentlyViewed().filter((item) => item.key !== itemKey)].slice(0, 8);
    writeRecentlyViewed(updated);
    setRecentlyViewed(updated);
  };

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "popular":
        return products.indexOf(a) - products.indexOf(b);
      case "newest":
        return products.indexOf(b) - products.indexOf(a);
      case "price-asc":
        return parsePriceValue(a.price) - parsePriceValue(b.price);
      case "price-desc":
        return parsePriceValue(b.price) - parsePriceValue(a.price);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const similarProducts = useMemo(() => {
    if (!activeProduct) {
      return [];
    }

    return sortedProducts.filter((item) => item.id !== activeProduct.id).slice(0, 4);
  }, [activeProduct, sortedProducts]);

  const recentOtherProducts = useMemo(() => {
    if (!activeProduct) {
      return recentlyViewed;
    }

    return recentlyViewed.filter((item) => item.key !== `${title}:${activeProduct.id}`);
  }, [activeProduct, recentlyViewed, title]);

  return (
    <div className="pt-24 pb-16 px-6 md:px-10">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{sortedProducts.length}</span> items
          </div>

          <div className="flex items-center gap-2 border border-border rounded-sm p-1">
            <button
              onClick={() => setGridCols(4)}
              className={`p-2 transition-colors ${gridCols === 4 ? "bg-foreground text-background" : "hover:bg-secondary"}`}
              aria-label="4 items per row"
              title="4 items per row"
            >
              <Grid2x2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-2 transition-colors ${gridCols === 3 ? "bg-foreground text-background" : "hover:bg-secondary"}`}
              aria-label="3 items per row"
              title="3 items per row"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-sm text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Sort: {sortBy === "alphabetical" ? "A-Z" : sortBy === "popular" ? "Popular" : sortBy === "newest" ? "Newest" : sortBy === "price-asc" ? "Price ↑" : "Price ↓"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {sortMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-sm z-[50] rounded-sm overflow-hidden">
              <button
                onClick={() => {
                  setSortBy("newest");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "newest" ? "bg-secondary" : ""}`}
              >
                <Sparkles className="w-4 h-4" /> Newest
              </button>
              <button
                onClick={() => {
                  setSortBy("popular");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "popular" ? "bg-secondary" : ""}`}
              >
                <Star className="w-4 h-4" /> Most Popular
              </button>
              <button
                onClick={() => {
                  setSortBy("alphabetical");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "alphabetical" ? "bg-secondary" : ""}`}
              >
                <Type className="w-4 h-4" /> Alphabetically
              </button>
              <button
                onClick={() => {
                  setSortBy("price-asc");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "price-asc" ? "bg-secondary" : ""}`}
              >
                <TrendingUp className="w-4 h-4" /> Price: Low to High
              </button>
              <button
                onClick={() => {
                  setSortBy("price-desc");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "price-desc" ? "bg-secondary" : ""}`}
              >
                <DollarSign className="w-4 h-4" /> Price: High to Low
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid gap-6 md:gap-8 mb-16 ${
        gridCols === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
      }`}>
        {visibleProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => openProduct(product)}
            className="group text-left"
          >
            <div className="aspect-square overflow-hidden bg-secondary mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="text-sm font-normal mb-2 group-hover:opacity-70 transition-opacity">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.price}</p>
          </button>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                page === currentPage
                  ? "bg-foreground text-background"
                  : "border border-border hover:bg-secondary"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <Dialog
        open={Boolean(activeProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveProduct(null);
            setIsSizeChartOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-0">
          {activeProduct && (
            <div className="grid md:grid-cols-2">
              <div className="bg-secondary">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover min-h-[420px]"
                />
              </div>

              <div className="p-6 md:p-8">
                <DialogTitle className="text-3xl font-light tracking-tight mb-2">
                  {activeProduct.name}
                </DialogTitle>
                <p className="text-xl text-muted-foreground mb-5">{activeProduct.price}</p>

                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Available sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.sizes?.map((size) => (
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
                  className="text-sm underline underline-offset-4 mb-6"
                >
                  Size chart
                </button>

                <div className="space-y-4 mb-6 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Description:</span> {activeProduct.description}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Material:</span> {activeProduct.material}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Sustainability:</span> {activeProduct.sustainability}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Added to cart",
                        description: `${activeProduct.name} (${selectedSize}) added to your cart.`,
                      })
                    }
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
                        description: `${activeProduct.name} added to your wishlist.`,
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm hover:bg-secondary transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Add to wishlist
                  </button>
                </div>

                <div className="mb-8">
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

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Similar piece of clothing</p>
                  <div className="grid grid-cols-2 gap-3">
                    {similarProducts.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openProduct(item)}
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

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Recently viewed</p>
                  {recentOtherProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You didn't check any piece yet. Big mistake</p>
                  ) : (
                    <div className="space-y-2">
                      {recentOtherProducts.slice(0, 4).map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            openProduct({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                            })
                          }
                          className="w-full text-left border border-border p-2 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover" />
                            <div>
                              <p className="text-xs">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">{item.collection} · {item.price}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={isSizeChartOpen} onOpenChange={setIsSizeChartOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Size chart</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Exact size scheme for {activeProduct?.name || "this piece"}.
            </p>
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
    </div>
  );
};

export default CollectionPage;
