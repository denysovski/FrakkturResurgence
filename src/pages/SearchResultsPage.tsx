import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { catalogCategories, getAllProducts } from "@/lib/catalog";
import SEO from "@/components/SEO";
import { addToWishlist } from "@/lib/wishlist";
import { getStoredUser, type AuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { searchProducts, type DbProduct } from "@/lib/productsApi";
import { getCollectionImageByIndex } from "@/lib/collectionImages";

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [productResults, setProductResults] = useState<Array<DbProduct & { image: string }>>([]);
  const { toast } = useToast();

  const normalized = initial.trim().toLowerCase();

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  const categoryResults = useMemo(
    () => catalogCategories.filter((category) => category.title.toLowerCase().includes(normalized)),
    [normalized],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!normalized) {
        setProductResults([]);
        return;
      }

      try {
        const items = await searchProducts(normalized);
        if (!cancelled) {
          if (items.length > 0) {
            setProductResults(items);
            return;
          }

          const fallback = getAllProducts()
            .filter((product) => {
              const haystack = `${product.name} ${product.categoryTitle}`.toLowerCase();
              return haystack.includes(normalized);
            })
            .slice(0, 24)
            .map((product, index) => ({
              dbId: index + 1,
              id: product.id,
              categoryKey: product.categoryKey,
              categoryTitle: product.categoryTitle,
              name: product.name,
              price: product.price,
              description: product.description,
              material: product.material,
              sustainability: product.sustainability,
              imageKey: product.id,
              sizes: product.sizes,
              image: product.image || getCollectionImageByIndex(product.categoryKey, index),
            }));

          setProductResults(fallback);
        }
      } catch {
        if (!cancelled) {
          const fallback = getAllProducts()
            .filter((product) => {
              const haystack = `${product.name} ${product.categoryTitle}`.toLowerCase();
              return haystack.includes(normalized);
            })
            .slice(0, 24)
            .map((product, index) => ({
              dbId: index + 1,
              id: product.id,
              categoryKey: product.categoryKey,
              categoryTitle: product.categoryTitle,
              name: product.name,
              price: product.price,
              description: product.description,
              material: product.material,
              sustainability: product.sustainability,
              imageKey: product.id,
              sizes: product.sizes,
              image: product.image || getCollectionImageByIndex(product.categoryKey, index),
            }));
          setProductResults(fallback);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [normalized]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

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

  const handleAddToWishlist = async (categoryKey: string, productId: string, name: string) => {
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

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title={query ? `Search Results for "${query}"` : "Search"}
        description={query ? `Search results for "${query}" on Frakktur. Find premium luxury streetwear products.` : "Search Frakktur's luxury streetwear collection including t-shirts, hoodies, caps, and more."}
        canonicalUrl={`https://frakktur.com/search?q=${encodeURIComponent(query)}`}
      />
      <div className="pt-28 pb-20 px-6 md:px-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6 animate-fade-in-up">Search</h1>

        <form onSubmit={onSubmit} className="max-w-2xl mb-10 animate-fade-in-up-1">
          <label className="relative block">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories or products"
              className="w-full border border-border bg-background px-4 py-3 pr-24 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 border border-border px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
            >
              Search
            </button>
          </label>
        </form>

        {normalized.length === 0 ? (
          <p className="text-muted-foreground animate-fade-in-up-2">Type a keyword and press Enter to search.</p>
        ) : (
          <div className="space-y-12">
            <section className="animate-fade-in-up-1">
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              {categoryResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category matches.</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryResults.map((category) => (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => navigate(`/collections/${category.key}`)}
                      className="text-left border border-border px-4 py-4 hover:bg-secondary transition-colors"
                    >
                      <p className="text-sm font-medium">{category.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{category.products.length} products</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="animate-fade-in-up-2">
              <h2 className="text-lg font-medium mb-4">Products</h2>
              {productResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products found for “{initial}”.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {productResults.map((product, idx) => (
                    <div
                      key={`${product.categoryKey}-${product.id}`}
                      className="text-left group animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${product.categoryKey}/${product.id}`)}
                        className="w-full text-left"
                      >
                        <div className="aspect-square bg-secondary overflow-hidden mb-2">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <p className="text-sm leading-tight">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.categoryTitle} · {product.price}</p>
                      </button>

                      {currentUser && (
                        <button
                          type="button"
                          onClick={() => void handleAddToWishlist(product.categoryKey, product.id, product.name)}
                          className="mt-2 text-xs underline underline-offset-4 hover:opacity-70"
                        >
                          Add to wishlist
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchResultsPage;
