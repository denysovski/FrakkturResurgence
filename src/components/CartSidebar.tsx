import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, Trash2 } from "lucide-react";
import { readCart, updateCartQuantity, type CartItem } from "@/lib/cart";
import { useCurrency } from "@/lib/currencyContext";
import { useI18n } from "@/lib/i18nContext";
import { formatLocalizedPrice, parseEurPrice } from "@/lib/price";

type CartSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { t } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<{ key: string; name: string } | null>(null);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const value = parseEurPrice(item.price) || 0;
        return sum + value * item.quantity;
      }, 0),
    [items],
  );

  const handleQuantityChange = async (key: string, quantity: number, itemName: string) => {
    if (quantity === 0) {
      setRemoveConfirm(key);
      setItemToRemove({ key, name: itemName });
    } else {
      const updated = await updateCartQuantity(key, quantity);
      setItems(updated);
    }
  };

  const confirmRemoval = async () => {
    if (removeConfirm) {
      const updated = await updateCartQuantity(removeConfirm, 0);
      setItems(updated);
      setRemoveConfirm(null);
      setItemToRemove(null);
    }
  };

  const cancelRemoval = () => {
    setRemoveConfirm(null);
    setItemToRemove(null);
  };

  const handleItemClick = (categoryKey: string, id: string) => {
    navigate(`/product/${categoryKey}/${id}`);
    onOpenChange(false);
  };

  const openShopping = () => {
    onOpenChange(false);
    navigate("/collections/tshirts");
  };

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const sync = async () => {
      try {
        const data = await readCart();
        setItems(data);
      } catch {
        setItems([]);
      }
    };

    if (open) {
      void sync();
    }
  }, [open]);

  useEffect(() => {
    const onCartUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail);
        return;
      }
      void readCart().then(setItems).catch(() => setItems([]));
    };

    window.addEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
    return () => {
      window.removeEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
    };
  }, []);

  return (
    <>
      {mounted && (
        <div className="fixed inset-0 z-[60]" onClick={() => onOpenChange(false)}>
          <div
            className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-all duration-200 ease-out ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            className={`absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-background flex flex-col transition-transform duration-200 ease-out shadow-2xl ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Shopping Cart</span>
              <button onClick={() => onOpenChange(false)} aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <p className="text-muted-foreground text-sm">{t.cart.empty}</p>
                <button
                  type="button"
                  onClick={openShopping}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-[1.02] hover:opacity-90"
                >
                  {t.cart.continueShopping}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-4 px-6 py-5">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {items.map((item) => (
                    <div key={item.key} className="relative rounded-2xl border border-border p-3 pr-12 hover:bg-secondary transition-colors">
                      <button
                        onClick={() => handleItemClick(item.categoryKey, item.id)}
                        className="w-full text-left mb-3 flex gap-3 hover:opacity-70 transition-opacity"
                      >
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover flex-shrink-0 rounded-xl" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Size {item.size}</p>
                          <p className="text-xs text-muted-foreground">{formatLocalizedPrice(item.price, currency)}</p>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">Quantity: {item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.key, 0, item.name)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t.cart.estimatedTotal}:</span>
                    <span className="text-lg font-light">{formatLocalizedPrice(`€${total.toFixed(2)}`, currency)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      navigate("/cart");
                    }}
                    className="w-full rounded-full bg-foreground text-background py-2 text-sm hover:opacity-90 transition-opacity"
                  >
                    {t.cart.checkout}
                  </button>
                  <button
                    onClick={openShopping}
                    className="w-full border border-border py-2 text-sm hover:bg-secondary transition-colors rounded-full inline-flex items-center justify-center gap-2"
                  >
                    {t.cart.continueShopping}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {removeConfirm && itemToRemove && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-4" onClick={cancelRemoval}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{t.cart.removeItem}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to remove <strong>{itemToRemove.name}</strong> from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelRemoval} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors">
                {t.cart.keepIt}
              </button>
              <button onClick={confirmRemoval} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors">
                {t.cart.remove}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );}