import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";
import { getStoredUser } from "@/lib/auth";
import { readOrders, type UserOrder } from "@/lib/orders";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    if (!getStoredUser()) {
      navigate("/auth/login?mode=signup");
      return;
    }

    readOrders().then(setOrders).catch(() => setOrders([]));
  }, [navigate]);

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="My Orders"
        description="Track your Frakktur orders and delivery details."
        canonicalUrl="https://frakktur.com/orders"
      />
      <div className="pt-28 pb-20 px-6 md:px-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <p className="text-sm">Order {order.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 text-xs text-muted-foreground">
                  <div>
                    <p className="text-foreground text-sm mb-1">Tracking</p>
                    <p>Code: {order.trackingCode}</p>
                    <p>Status: {order.status}</p>
                  </div>
                  <div>
                    <p className="text-foreground text-sm mb-1">Shipping Address</p>
                    <p>{order.address.fullName}</p>
                    <p>{order.address.line1}</p>
                    <p>{order.address.postalCode} {order.address.city}</p>
                    <p>{order.address.country}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 text-xs">
                      <span>{item.name} · {item.size} · Qty {item.quantity}</span>
                      <span className="text-muted-foreground">{item.price}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm">Total: €{order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default OrdersPage;
