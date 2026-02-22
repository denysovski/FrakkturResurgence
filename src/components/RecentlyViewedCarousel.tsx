import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type RecentlyViewedItem = {
  key: string;
  id: string;
  categoryKey: string;
  categoryTitle: string;
  name: string;
  price: string;
  image: string;
};

type RecentlyViewedCarouselProps = {
  items: RecentlyViewedItem[];
};

export default function RecentlyViewedCarousel({ items }: RecentlyViewedCarouselProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(items.length > 4);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Recently viewed</p>
        <div className="flex gap-2">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="p-1 hover:bg-secondary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="p-1 hover:bg-secondary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
            className="flex-shrink-0 w-[160px] text-left group"
          >
            <div className="aspect-square overflow-hidden bg-secondary mb-2">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="text-xs leading-tight line-clamp-2 group-hover:opacity-70 transition-opacity">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
