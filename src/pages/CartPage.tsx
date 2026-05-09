import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";
import { clearCart, readCart, type CartItem } from "@/lib/cart";
import { createOrderFromCart } from "@/lib/orders";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { CheckoutPaymentMethod } from "@/lib/orders";
import { useCurrency } from "@/lib/currencyContext";
import { formatLocalizedPrice, parseEurPrice } from "@/lib/price";

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

const namePattern = /^[A-Za-z\s'-]+$/;
const streetPattern = /^[A-Za-z0-9\s,.'/-]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postalPattern = /^\d{3}\s\d{2}$/;

type CheckoutErrors = Partial<Record<"firstName" | "lastName" | "email" | "street" | "city" | "postalCode" | "country", string>>;

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutErrors>({});
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
    const syncCart = async () => {
      try {
        const current = await readCart();
        setItems(current);
      } catch {
        setItems([]);
      }
    };

    void syncCart();

    const onCartUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail);
        return;
      }
      void syncCart();
    };

    window.addEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
    window.addEventListener("frakktur:auth-updated", syncCart as EventListener);
    window.addEventListener("focus", syncCart);

    return () => {
      window.removeEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
      window.removeEventListener("frakktur:auth-updated", syncCart as EventListener);
      window.removeEventListener("focus", syncCart);
    };
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
        const value = parseEurPrice(item.price) || 0;
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

  const validateCheckout = () => {
    const nextErrors: CheckoutErrors = {};

    if (!checkout.firstName.trim()) nextErrors.firstName = "First name is required.";
    else if (!namePattern.test(checkout.firstName.trim())) nextErrors.firstName = "Use letters only.";

    if (!checkout.lastName.trim()) nextErrors.lastName = "Last name is required.";
    else if (!namePattern.test(checkout.lastName.trim())) nextErrors.lastName = "Use letters only.";

    if (!checkout.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailPattern.test(checkout.email.trim())) nextErrors.email = "Enter a valid email address.";

    if (!checkout.street.trim()) nextErrors.street = "Street address is required.";
    else if (!streetPattern.test(checkout.street.trim())) nextErrors.street = "Use only standard letters, numbers, spaces, commas, periods, hyphens, apostrophes, or slashes.";

    if (!checkout.city.trim()) nextErrors.city = "City is required.";

    if (!checkout.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    else if (!postalPattern.test(checkout.postalCode.trim())) nextErrors.postalCode = "Use the format 123 45.";

    if (!checkout.country.trim()) nextErrors.country = "Country is required.";

    setCheckoutErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckout()) {
      toast({
        title: "Check your details",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);

      // Re-read cart to avoid race where in-memory `items` is stale/empty
      const currentItems = await readCart();
      const checkoutItems = currentItems.length > 0 ? currentItems : items;
      if (!checkoutItems || checkoutItems.length === 0) {
        toast({
          title: "Unable to place order",
          description: "Your cart is empty.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await createOrderFromCart({
        items: checkoutItems,
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
      setOrderSuccessOpen(true);
    } catch (error) {
      toast({
        title: "Unable to place order",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
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
        <div className="mb-10 animate-fade-in-up">
          <h1 className="mb-3 text-3xl font-light tracking-tight md:text-5xl">Checkout</h1>
          <p className="max-w-2xl text-muted-foreground">Review your details on the left and your cart on the right, then complete the order in one smooth flow.</p>
        </div>

        {items.length === 0 ? (
          <div className="animate-fade-in-up rounded-3xl border border-border bg-secondary/30 p-8">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate("/collections/tshirts")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Continue shopping
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-in-up rounded-[32px] border border-border bg-background p-5 shadow-sm md:p-6">
              <h2 className="mb-4 text-base font-medium">Shipping details</h2>

              <div className="space-y-3">
                <div>
                  <input
                    value={checkout.email}
                    onChange={(event) => setCheckout((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                  />
                  {checkoutErrors.email && <p className="mt-1 text-xs text-red-600">{checkoutErrors.email}</p>}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <input
                      value={checkout.firstName}
                      onChange={(event) => setCheckout((prev) => ({ ...prev, firstName: event.target.value }))}
                      placeholder="First name"
                      className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                    />
                    {checkoutErrors.firstName && <p className="mt-1 text-xs text-red-600">{checkoutErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      value={checkout.lastName}
                      onChange={(event) => setCheckout((prev) => ({ ...prev, lastName: event.target.value }))}
                      placeholder="Last name"
                      className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                    />
                    {checkoutErrors.lastName && <p className="mt-1 text-xs text-red-600">{checkoutErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <input
                    value={checkout.street}
                    onChange={(event) => setCheckout((prev) => ({ ...prev, street: event.target.value }))}
                    placeholder="Street address"
                    className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                  />
                  {checkoutErrors.street && <p className="mt-1 text-xs text-red-600">{checkoutErrors.street}</p>}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <input
                      value={checkout.city}
                      onChange={(event) => setCheckout((prev) => ({ ...prev, city: event.target.value }))}
                      placeholder="City"
                      className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                    />
                    {checkoutErrors.city && <p className="mt-1 text-xs text-red-600">{checkoutErrors.city}</p>}
                  </div>
                  <div>
                    <input
                      value={checkout.postalCode}
                      onChange={(event) => setCheckout((prev) => ({ ...prev, postalCode: event.target.value }))}
                      placeholder="Postal code"
                      className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                    />
                    {checkoutErrors.postalCode && <p className="mt-1 text-xs text-red-600">{checkoutErrors.postalCode}</p>}
                  </div>
                  <div>
                    <input
                      value={checkout.country}
                      onChange={(event) => setCheckout((prev) => ({ ...prev, country: event.target.value }))}
                      placeholder="Country"
                      className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm"
                    />
                    {checkoutErrors.country && <p className="mt-1 text-xs text-red-600">{checkoutErrors.country}</p>}
                  </div>
                </div>

                <div className="space-y-2 pt-3">
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
                        className={`rounded-full border px-3 py-3 text-sm transition-colors ${
                          paymentMethod === option.value ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary"
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
                  className="w-full rounded-full bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? "Placing order..." : "Place order"}
                </button>
              </div>
            </div>

            <aside className="animate-fade-in-up-1 rounded-[32px] border border-border bg-secondary/25 p-5 shadow-sm md:p-6">
              <h2 className="mb-4 text-base font-medium">Cart contents</h2>
              <div className="mb-6 space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-3">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size {item.size}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">{formatLocalizedPrice(item.price, currency)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatLocalizedPrice(`€${subtotal.toFixed(2)}`, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Standard shipping</span>
                  <span>{formatLocalizedPrice(`€${SHIPPING_EUR.toFixed(2)}`, currency)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-base font-medium">
                  <span>Total</span>
                  <span>{formatLocalizedPrice(`€${total.toFixed(2)}`, currency)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {orderSuccessOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/50 px-4 backdrop-blur-sm">
          <div className="flex h-[350px] w-[650px] max-w-[calc(100vw-2rem)] flex-col items-center justify-center rounded-[32px] border border-border bg-background px-8 text-center shadow-2xl animate-fade-in-up">
            <CheckCircle2 className="mb-5 h-20 w-20 text-foreground" strokeWidth={1.6} />
            <p className="text-2xl font-light tracking-tight md:text-3xl">Your order was successfully received</p>
            <button
              type="button"
              onClick={() => {
                setOrderSuccessOpen(false);
                navigate("/collections/tshirts");
              }}
              className="mt-8 rounded-full border border-foreground bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CartPage;
