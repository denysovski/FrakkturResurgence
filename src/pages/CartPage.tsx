import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { clearCart, readCart, type CartItem } from "@/lib/cart";
import SEO from "@/components/SEO";
import { createOrderFromCart } from "@/lib/orders";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    readCart().then(setItems).catch(() => setItems([]));
  }, []);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const value = Number.parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        return sum + value * item.quantity;
      }, 0),
    [items],
  );

  const canCheckout = items.length > 0 &&
    address.fullName.trim() &&
    address.line1.trim() &&
    address.city.trim() &&
    address.postalCode.trim() &&
    address.country.trim();

  const handlePlaceOrder = async () => {
    if (!getStoredUser()) {
      toast({
        title: "Sign in required",
        description: "Please sign in before placing an order.",
      });
      navigate("/auth/login?mode=signup");
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await createOrderFromCart({
        items,
        address: {
          fullName: address.fullName.trim(),
          line1: address.line1.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode.trim(),
          country: address.country.trim(),
        },
      });

      await clearCart();
      setItems([]);
      toast({
        title: "Order placed",
        description: `Order ${order.id} created successfully.`,
      });
      navigate("/orders");
    } catch (error) {
      toast({
        title: "Unable to place order",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="Shopping Cart"
        description="View and manage your shopping cart at Frakktur. Review your selected luxury streetwear items and proceed to checkout."
        canonicalUrl="https://frakktur.com/cart"
      />
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
            <p className="text-sm mb-6">Estimated total: €{total.toFixed(2)}</p>

            <div className="border border-border p-4 md:p-5 space-y-3 max-w-2xl">
              <h2 className="text-base font-medium">Shipping details</h2>

              <input
                value={address.fullName}
                onChange={(event) => setAddress((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Full name"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <input
                value={address.line1}
                onChange={(event) => setAddress((prev) => ({ ...prev, line1: event.target.value }))}
                placeholder="Address line"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  value={address.city}
                  onChange={(event) => setAddress((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="City"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
                <input
                  value={address.postalCode}
                  onChange={(event) => setAddress((prev) => ({ ...prev, postalCode: event.target.value }))}
                  placeholder="Postal code"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
                <input
                  value={address.country}
                  onChange={(event) => setAddress((prev) => ({ ...prev, country: event.target.value }))}
                  placeholder="Country"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
              </div>

              <button
                type="button"
                onClick={() => void handlePlaceOrder()}
                disabled={!canCheckout || isSubmitting}
                className="bg-foreground text-background px-5 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;
