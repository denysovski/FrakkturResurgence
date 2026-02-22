import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { catalogCategories, getAllProducts } from "@/lib/catalog";

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);

  const normalized = initial.trim().toLowerCase();

  const categoryResults = useMemo(
    () => catalogCategories.filter((category) => category.title.toLowerCase().includes(normalized)),
    [normalized],
  );

  const productResults = useMemo(
    () =>
      getAllProducts().filter((product) => {
        const queryWords = normalized.split(/\s+/).filter(Boolean);
        if (!queryWords.length) {
          return false;
        }

        const haystack = `${product.name} ${product.categoryTitle}`.toLowerCase();
        return queryWords.every((word) => haystack.includes(word));
      }),
    [normalized],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageLayout forceBlackNavbar={true}>
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
                    <button
                      key={`${product.categoryKey}-${product.id}`}
                      type="button"
                      onClick={() => navigate(`/product/${product.categoryKey}/${product.id}`)}
                      className="text-left group animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <div className="aspect-square bg-secondary overflow-hidden mb-2">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-sm leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.categoryTitle} · {product.price}</p>
                    </button>
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
