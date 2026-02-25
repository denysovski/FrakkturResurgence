import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";
import { getStoredUser } from "@/lib/auth";
import { readWishlist, removeFromWishlist, type WishlistItem } from "@/lib/wishlist";
import { useToast } from "@/hooks/use-toast";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!getStoredUser()) {
      navigate("/auth/login?mode=signup");
      return;
    }

    readWishlist().then(setItems).catch(() => setItems([]));
  }, [navigate]);

  const onRemove = async (key: string) => {
    try {
      await removeFromWishlist(key);
      const next = await readWishlist();
      setItems(next);
      toast({
        title: "Removed",
        description: "Item removed from wishlist.",
      });
    } catch (error) {
      toast({
        title: "Unable to remove",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="Wishlist"
        description="Your Frakktur wishlist items."
        canonicalUrl="https://frakktur.com/wishlist"
      />
      <div className="pt-28 pb-20 px-6 md:px-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6">Wishlist</h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No wishlist items yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {items.map((item) => (
              <div key={item.key} className="text-left">
                <button
                  type="button"
                  onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                  className="w-full text-left group"
                >
                  <div className="aspect-square bg-secondary overflow-hidden mb-2">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.categoryTitle} · {item.price}</p>
                </button>

                <button
                  type="button"
                  onClick={() => void onRemove(item.key)}
                  className="mt-2 text-xs underline underline-offset-4 hover:opacity-70"
                >
                  Remove from wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default WishlistPage;
