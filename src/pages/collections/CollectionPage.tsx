import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: "smooth" });
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
        <p className="text-sm text-muted-foreground mt-4">
          Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, products.length)} of {products.length} products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
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
