import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { readCart } from "@/lib/cart";

const CartPage = () => {
  const navigate = useNavigate();
  const items = readCart();

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const value = Number.parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        return sum + value * item.quantity;
      }, 0),
    [items],
  );

  return (
    <PageLayout forceBlackNavbar={true}>
      <div className="pt-28 pb-20 px-6 md:px-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6">Cart</h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(`/product/${item.categoryKey}/${item.id}`)}
                  className="w-full text-left border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div>
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                      <p className="text-xs text-muted-foreground">{item.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm">Estimated total: €{total.toFixed(2)}</p>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;
