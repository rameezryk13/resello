import { useEffect, useState } from "react";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import { formatRupees, parsePrice } from "@/utils/currency";
import "./OrdersPage.css";

const ORDER_STATUSES = ["In-progress", "Shipper's Advice", "Delivered", "Returned", "Cancelled"];

const computeItemProfitTotal = (item) => {
  const rawProfit = item?.profit;
  if (rawProfit !== undefined && rawProfit !== null && !Number.isNaN(Number(rawProfit))) {
    return Number(rawProfit);
  }

  const price = parsePrice(item?.product?.price);
  const original = parsePrice(item?.product?.originalPrice);
  return original > price ? Math.max(0, original - price) : 0;
};

const formatMoney = (value) => formatRupees(value);

const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getOrderStatus = (order) => {
  const source = String(order?.orderId || "");
  let total = 0;

  for (let index = 0; index < source.length; index += 1) {
    total += source.charCodeAt(index);
  }

  return ORDER_STATUSES[total % ORDER_STATUSES.length];
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("In-progress");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.orders);
        const enrichedOrders = (data.orders || []).map((order) => ({
          ...order,
          status: getOrderStatus(order),
        }));
        setOrders(enrichedOrders);
      } catch (err) {
        setError(err?.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (order.status !== activeStatus) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      order.orderId,
      order.address?.name,
      order.address?.line1,
      order.address?.line2,
      order.address?.city,
      order.address?.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero title="My Orders" description="Track every order placed from your reseller account, including totals, profit, and shipping details." />

        <section className="account-section">
          <div className="orders-toolbar">
            <div className="orders-status-tabs" role="tablist" aria-label="Order status filters">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={activeStatus === status}
                  className={`orders-status-tab ${activeStatus === status ? "active" : ""}`}
                  onClick={() => setActiveStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="orders-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Order ID, Customer Name/Address..."
                aria-label="Search orders"
              />
              <span className="orders-search-icon" aria-hidden="true">
                {"\u2315"}
              </span>
            </div>
          </div>

          {loading ? <p className="account-empty">Loading orders...</p> : null}
          {error ? <p className="account-empty">{error}</p> : null}
          {!loading && !error && orders.length === 0 ? (
            <p className="account-empty">No orders yet. Place an order from checkout and it will appear here.</p>
          ) : null}
          {!loading && !error && orders.length > 0 && filteredOrders.length === 0 ? (
            <p className="account-empty">No orders found for this status or search.</p>
          ) : null}

          {!loading && !error && filteredOrders.length > 0 ? (
            <div className="account-list">
              {filteredOrders.map((order) => (
                <article key={order.orderId} className="account-card">
                  <div className="account-card-main">
                    <div className="account-card-title account-card-title-row">
                      <span>{order.orderId}</span>
                      <span className={`order-status-badge status-${order.status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="account-card-subtitle">
                      {order.address?.name} • {order.address?.city}, {order.address?.country}
                    </div>
                    <div className="account-meta-row">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>{order.itemCount} items</span>
                      <span>Shipping {formatMoney(order.shippingCharge)}</span>
                    </div>
                    <div className="account-products">
                      {order.cart?.map((item) => (
                        <div key={item.itemId} className="account-product-row">
                          <span>{item.product?.name} x {item.quantity}</span>
                          <span>Profit {formatMoney(computeItemProfitTotal(item))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="account-side">
                    <strong>{formatMoney(order.totalAmount)}</strong>
                    <span>Total paid</span>
                    <span>Profit {formatMoney(order.profit)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default OrdersPage;
