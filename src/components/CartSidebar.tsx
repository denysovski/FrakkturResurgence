import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { readCart, updateCartQuantity } from "@/lib/cart";

type CartSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState(readCart());

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const value = Number.parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        return sum + value * item.quantity;
      }, 0),
    [items],
  );

  const handleQuantityChange = (key: string, quantity: number) => {
    const updated = updateCartQuantity(key, quantity);
    setItems(updated);
  };

  const handleItemClick = (categoryKey: string, id: string) => {
    navigate(`/product/${categoryKey}/${id}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <button
                    onClick={() => handleItemClick(item.categoryKey, item.id)}
                    className="w-full text-left mb-3 flex gap-3 hover:opacity-70 transition-opacity"
                  >
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size {item.size}</p>
                      <p className="text-xs text-muted-foreground">{item.price}</p>
                    </div>
                  </button>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Qty:</span>
                    <div className="flex gap-1 flex-wrap">
                      {[0, 1, 2, 3, 4].map((qty) => (
                        <button
                          key={qty}
                          onClick={() => handleQuantityChange(item.key, qty)}
                          className={`px-2 py-1 text-xs border transition-colors ${
                            item.quantity === qty
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          {qty === 0 ? "✕" : qty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Checkout */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Estimated Total:</span>
                <span className="text-lg font-light">€{total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-foreground text-background py-2 text-sm hover:opacity-90 transition-opacity">
                Checkout
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full border border-border py-2 text-sm hover:bg-secondary transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
