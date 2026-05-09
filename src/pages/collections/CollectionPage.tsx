import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Filter, Sparkles, TrendingUp, Star, DollarSign, ChevronDown, Grid2x2, Grid3x3, Type, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import type { CategoryKey } from "@/lib/catalog";
import SEO from "@/components/SEO";
import { addToWishlist } from "@/lib/wishlist";
import { getStoredUser, type AuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { fetchProductByCategoryAndId, fetchProductsByCategory } from "@/lib/productsApi";
import { getCollectionImageByIndex } from "@/lib/collectionImages";
import { useCurrency } from "@/lib/currencyContext";
import { useI18n } from "@/lib/i18nContext";
import { formatLocalizedPrice } from "@/lib/price";

interface CollectionProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  sizes: string[];
}

interface CollectionPageProps {
  categoryKey: CategoryKey;
  title: string;
  description?: string;
  products?: CollectionProduct[];
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;

const CollectionPage = ({
  categoryKey,
  title,
  description,
  products = [],
  itemsPerPage = ITEMS_PER_PAGE,
}: CollectionPageProps) => {
  const { currency } = useCurrency();
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [gridCols, setGridCols] = useState(4);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [liveProducts, setLiveProducts] = useState<CollectionProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const sortButtonRef = useRef<HTMLButtonElement | null>(null);
  const [sortMenuStyle, setSortMenuStyle] = useState<React.CSSProperties>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoadingProducts(true);
      try {
        const dbProducts = await fetchProductsByCategory(categoryKey);
        if (cancelled) {
          return;
        }

        setLiveProducts(
          dbProducts
            .filter((product, index, arr) => arr.findIndex((candidate) => candidate.id === product.id) === index)
            .map((product, index) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image || getCollectionImageByIndex(categoryKey, index),
              sizes: product.sizes?.filter(Boolean) || [],
            })),
        );
      } catch {
        if (!cancelled) {
          setLiveProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  // Sort products based on selected option
  const sortedProducts = useMemo(() => {
    const withIndex = liveProducts.map((product, index) => ({ product, index }));

    withIndex.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.product.name.localeCompare(b.product.name);
        case "popular":
          return a.index - b.index;
        case "newest":
          return b.index - a.index;
        case "price-asc":
          return Number.parseFloat(a.product.price.replace(/[^\d.]/g, "")) - Number.parseFloat(b.product.price.replace(/[^\d.]/g, ""));
        case "price-desc":
          return Number.parseFloat(b.product.price.replace(/[^\d.]/g, "")) - Number.parseFloat(a.product.price.replace(/[^\d.]/g, ""));
        default:
          return 0;
      }
    });

    return withIndex.map((item) => item.product);
  }, [liveProducts, sortBy]);

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

  const handleAddToWishlist = async (productId: string, name: string) => {
    try {
      await addToWishlist(categoryKey, productId);
      toast({
        title: "Added to wishlist",
        description: `${name} added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Sign in required",
        description: error instanceof Error ? error.message : "Please sign in to add items to wishlist.",
      });
    }
  };

  useEffect(() => {
    if (!sortMenuOpen || typeof window === "undefined") {
      return;
    }

    const updatePosition = () => {
      const rect = sortButtonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const width = 192;
      const right = Math.max(16, window.innerWidth - rect.right);
      const left = Math.max(16, window.innerWidth - right - width);
      const maxTop = window.innerHeight - 16 - 260;
      const top = Math.min(rect.bottom + 8, Math.max(16, maxTop));

      setSortMenuStyle({
        position: "fixed",
        top,
        right,
        width,
        zIndex: 40,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [sortMenuOpen]);

  return (
    <div className="pt-24 pb-16 px-6 md:px-10">
      <SEO
        title={title}
        description={description || `Shop our exclusive ${title.toLowerCase()} collection featuring premium luxury streetwear.`}
        canonicalUrl={`https://frakktur.com/collections/${categoryKey}`}
      />
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-light mb-4 tracking-tight animate-fade-in-up">{title}</h1>
        {description && <p className="text-muted-foreground max-w-2xl animate-fade-in-up-1">{description}</p>}
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border animate-fade-in-up-1">
        <div className="flex items-center gap-4 animate-fade-in-up-2">
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

        <div className="relative z-[400] animate-fade-in-up-2">
          <button
            ref={sortButtonRef}
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-sm text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>{t.common.sort}: {sortBy === "alphabetical" ? "A-Z" : sortBy === "popular" ? "Popular" : sortBy === "newest" ? "Newest" : sortBy === "price-asc" ? "Price ↑" : "Price ↓"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {sortMenuOpen && typeof window !== "undefined" && createPortal(
            <div style={sortMenuStyle} className="bg-background border border-border shadow-lg rounded-sm overflow-hidden">
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
            , document.body
          )}
        </div>
      </div>

      {/* Product Grid */}
      {isLoadingProducts ? (
        <div className="text-sm text-muted-foreground mb-16">{t.common.loading}</div>
      ) : (
      <div className={`relative z-0 grid gap-6 md:gap-8 mb-16 ${
        gridCols === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
      }`}>
        {visibleProducts.map((product, idx) => (
          <div
            key={product.id}
            className="group text-left animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <button
              type="button"
              onClick={() =>
                navigate(`/product/${categoryKey}/${product.id}`, {
                  state: {
                    prefetchedProduct: product,
                  },
                })
              }
              onMouseEnter={() => {
                void fetchProductByCategoryAndId(categoryKey, product.id).catch(() => undefined);
              }}
              className="w-full text-left"
            >
              <div className="aspect-square overflow-hidden bg-secondary mb-4 animate-fade-in-image">
                <img
                  src={product.image}
                  alt={`${product.name} - ${title.toLowerCase()} for sale at Frakktur luxury streetwear`}
                  loading="lazy"
                  onError={(event) => {
                    const fallback = getCollectionImageByIndex(categoryKey, startIndex + idx);
                    if (!fallback || event.currentTarget.src === fallback) {
                      return;
                    }
                    event.currentTarget.src = fallback;
                  }}
                  onLoad={() => setLoadedImages((prev) => ({ ...prev, [product.id]: true }))}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                    loadedImages[product.id] ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-normal group-hover:opacity-70 transition-opacity flex-1">
                  {product.name}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/product/${categoryKey}/${product.id}`, {
                      state: {
                        prefetchedProduct: product,
                      },
                    })
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-200 hover:scale-105 hover:opacity-90 flex-shrink-0"
                  aria-label={`Go shopping ${product.name}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{formatLocalizedPrice(product.price, currency)}</p>

            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => void handleAddToWishlist(product.id, product.name)}
                className="mt-2 text-xs underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                {t.product.addToWishlist}
              </button>
            )}
          </div>
        ))}
      </div>
      )}

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
    </div>
  );
};

export default CollectionPage;
