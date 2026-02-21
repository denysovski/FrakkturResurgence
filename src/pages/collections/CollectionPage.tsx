import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, ArrowUpDown, Grid2x2, Grid3x3, ChevronDown } from "lucide-react";

interface CollectionProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage?: string;
}

interface CollectionPageProps {
  title: string;
  description?: string;
  products: CollectionProduct[];
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;

const CollectionPage = ({
  title,
  description,
  products,
  itemsPerPage = ITEMS_PER_PAGE,
}: CollectionPageProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [gridCols, setGridCols] = useState(4); // 4 items per row by default
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "popular":
        // Assuming products at start are more popular
        return products.indexOf(a) - products.indexOf(b);
      case "newest":
        // Assuming newer products are at the end
        return products.indexOf(b) - products.indexOf(a);
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
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

  // Generate page numbers to display (1, 2, 3, ... or 1, 2, 3, ..., n)
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pt-24 pb-16 px-6 md:px-10">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
      </div>

      {/* CONTROLS BAR - Filter, Sort, Grid Toggle, Item Count */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border">
        {/* Left: Item Count and Grid Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{sortedProducts.length}</span> items
          </div>
          
          {/* Grid Toggle */}
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

        {/* Right: Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors rounded-sm text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Sort: {sortBy === "alphabetical" ? "A-Z" : sortBy === "popular" ? "Popular" : sortBy === "newest" ? "Newest" : sortBy === "price-asc" ? "Price ↑" : "Price ↓"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Sort Menu */}
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
                <span>🆕</span> Newest
              </button>
              <button
                onClick={() => {
                  setSortBy("popular");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "popular" ? "bg-secondary" : ""}`}
              >
                <span>⭐</span> Most Popular
              </button>
              <button
                onClick={() => {
                  setSortBy("alphabetical");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "alphabetical" ? "bg-secondary" : ""}`}
              >
                <span>🔤</span> Alphabetically
              </button>
              <button
                onClick={() => {
                  setSortBy("price-asc");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "price-asc" ? "bg-secondary" : ""}`}
              >
                <span>📈</span> Price: Low to High
              </button>
              <button
                onClick={() => {
                  setSortBy("price-desc");
                  setSortMenuOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-3 ${sortBy === "price-desc" ? "bg-secondary" : ""}`}
              >
                <span>📉</span> Price: High to Low
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
          <a key={product.id} href="#" className="group">
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
          </a>
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
    </div>
  );
};

export default CollectionPage;
