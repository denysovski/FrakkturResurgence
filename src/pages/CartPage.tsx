import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import { clearCart, readCart, type CartItem } from "@/lib/cart";
import SEO from "@/components/SEO";
import { createOrderFromCart } from "@/lib/orders";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { CheckoutPaymentMethod } from "@/lib/orders";

const SHIPPING_EUR = 11.99;

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("bank_transfer");
  const [checkout, setCheckout] = useState({
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    readCart().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      return;
    }

    const parts = splitFullName(user.fullName);
    setCheckout((prev) => ({
      ...prev,
      email: user.email,
      firstName: parts.firstName,
      lastName: parts.lastName,
    }));
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const value = Number.parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        return sum + value * item.quantity;
      }, 0),
    [items],
  );

  const total = subtotal + SHIPPING_EUR;

  const canCheckout =
    items.length > 0 &&
    checkout.email.trim() &&
    checkout.firstName.trim() &&
    checkout.lastName.trim() &&
    checkout.street.trim() &&
    checkout.city.trim() &&
    checkout.postalCode.trim() &&
    checkout.country.trim() &&
    paymentMethod;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      const result = await createOrderFromCart({
        items,
        paymentMethod,
        address: {
          email: checkout.email.trim(),
          firstName: checkout.firstName.trim(),
          lastName: checkout.lastName.trim(),
          street: checkout.street.trim(),
          city: checkout.city.trim(),
          postalCode: checkout.postalCode.trim(),
          country: checkout.country.trim(),
        },
      });

      await clearCart();
      setItems([]);

      if (result.order) {
        toast({
          title: "Order placed",
          description: `Order ${result.order.orderNumber} created successfully.`,
        });
        navigate("/orders");
        return;
      }

      toast({
        title: "Vaše objednávka byla přijata",
        description: result.message,
      });
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
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2 text-muted-foreground">
              <span>Standard shipping</span>
              <span>€{SHIPPING_EUR.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-6">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>

            <div className="border border-border p-4 md:p-5 space-y-3 max-w-2xl">
              <h2 className="text-base font-medium">Shipping details</h2>

              <input
                value={checkout.email}
                onChange={(event) => setCheckout((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <input
                value={checkout.firstName}
                onChange={(event) => setCheckout((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="First name"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <input
                value={checkout.lastName}
                onChange={(event) => setCheckout((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="Last name"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <input
                value={checkout.street}
                onChange={(event) => setCheckout((prev) => ({ ...prev, street: event.target.value }))}
                placeholder="Street address"
                className="w-full border border-border px-3 py-2 text-sm bg-background"
              />
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  value={checkout.city}
                  onChange={(event) => setCheckout((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="City"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
                <input
                  value={checkout.postalCode}
                  onChange={(event) => setCheckout((prev) => ({ ...prev, postalCode: event.target.value }))}
                  placeholder="Postal code"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
                <input
                  value={checkout.country}
                  onChange={(event) => setCheckout((prev) => ({ ...prev, country: event.target.value }))}
                  placeholder="Country"
                  className="w-full border border-border px-3 py-2 text-sm bg-background"
                />
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-base font-medium">Payment method</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {[
                    { value: "bank_transfer", label: "Bank transfer" },
                    { value: "credit_card", label: "Credit card" },
                    { value: "cash_on_delivery", label: "Cash on delivery" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPaymentMethod(option.value as CheckoutPaymentMethod)}
                      className={`border px-3 py-2 text-sm transition-colors ${
                        paymentMethod === option.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
