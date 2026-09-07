import { useEffect, useState } from "react";
import { PackageSearch, Star, Store, TriangleAlert } from "lucide-react";
import { get, put } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import ReviewModal from "@/components/ui/ReviewModal/ReviewModal";
import { ORDER_STATUSES, PENALTY_STATUS } from "@/constants/orderStatus";
import { useToast } from "@/context/ToastContext";
import { formatRupees, formatSignedRupees, parsePrice } from "@/utils/currency";
import "./OrdersPage.css";

// Orders split across suppliers each carry their own status, so they can land in
// different tabs. "All" is the default so a checkout that became three orders is
// visible in one place instead of scattered across the filters.
const ALL_STATUSES = "All";
const STATUS_TABS = [ALL_STATUSES, ...ORDER_STATUSES];

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(ALL_STATUSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);
  const [penalty, setPenalty] = useState(100);
  const [reviewOrder, setReviewOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.orders);
        setOrders(data.orders || []);
      } catch (err) {
        setError(err?.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Flips an order's status and reports what it did to the wallet.
  //
  // A real deployment would get these transitions from a courier webhook. This
  // switcher stands in for that so the commission and penalty rules can be
  // walked through without waiting on a delivery.
  const changeStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const data = await put(endpoints.orderStatus(orderId), { status });
      setOrders((current) =>
        current.map((order) => (order.orderId === orderId ? data.order : order))
      );
      if (data.wallet) {
        setPenalty(data.wallet.returnPenalty ?? penalty);
        toast.success(
          `${orderId} is now ${status}. Wallet balance ${formatSignedRupees(data.wallet.balance)}.`
        );
      }
    } catch (err) {
      toast.error(err?.message || "Could not update that order.");
    } finally {
      setUpdating(null);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (activeStatus !== ALL_STATUSES && order.status !== activeStatus) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      order.orderId,
      order.shopName,
      order.address?.name,
      order.address?.line1,
      order.address?.line2,
      order.address?.city,
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
        <AccountHero title="My Orders" description="Track every order placed from your reseller account. Items from different suppliers ship as separate orders, each with its own total, profit, and shipping." />

        <section className="account-section">
          <div className="orders-toolbar">
            <div className="orders-status-tabs" role="tablist" aria-label="Order status filters">
              {STATUS_TABS.map((status) => (
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
                placeholder="Order ID, Supplier, Customer Name/Address..."
                aria-label="Search orders"
              />
              <span className="orders-search-icon" aria-hidden="true">
                {"\u2315"}
              </span>
            </div>
          </div>

          {loading ? <EmptyState variant="loading" title="Loading orders..." /> : null}
          {error ? (
            <EmptyState
              variant="error"
              title="Could not load your orders"
              description={error}
            />
          ) : null}
          {!loading && !error && orders.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No orders yet"
              description="Place an order from checkout and it will appear here."
            />
          ) : null}
          {!loading && !error && orders.length > 0 && filteredOrders.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No matching orders"
              description="No orders found for this status or search."
            />
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
                    {order.shopName ? (
                      <div className="order-supplier-row">
                        <span className="order-supplier-name">
                          <Store size={15} aria-hidden="true" />
                          {order.shopName}
                        </span>
                        {order.supplierCount > 1 ? (
                          <span className="order-split-badge">
                            Order {order.supplierIndex} of {order.supplierCount} from this checkout
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="account-card-subtitle">
                      {order.address?.name} • {order.address?.city}
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

                    {order.status === PENALTY_STATUS ? (
                      <p className="order-penalty-note">
                        <TriangleAlert size={15} aria-hidden="true" />
                        {formatMoney(penalty)} return penalty charged to your wallet, and the
                        commission on this order was reversed.
                      </p>
                    ) : null}
                  </div>

                  <div className="account-side">
                    <strong>{formatMoney(order.totalAmount)}</strong>
                    <span>Total paid</span>
                    <span>Profit {formatMoney(order.profit)}</span>

                    {order.status === "Delivered" && (
                      <button
                        type="button"
                        className="order-review-btn"
                        onClick={() => setReviewOrder(order)}
                      >
                        <Star size={14} /> ★ Leave Review & Photo
                      </button>
                    )}

                    {/* Stands in for a courier webhook — see changeStatus. */}
                    <label className="order-status-switcher">
                      <span>Demo: set status</span>
                      <select
                        value={order.status}
                        disabled={updating === order.orderId}
                        onChange={(event) => changeStatus(order.orderId, event.target.value)}
                        aria-label={`Set status for order ${order.orderId}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <ReviewModal
          open={Boolean(reviewOrder)}
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
        />
      </div>
    </div>
  );
};

export default OrdersPage;
