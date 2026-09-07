import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  PackageCheck,
  PackageSearch,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import Header from "@/components/layout/Header/Header.jsx";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import AccountHero from "@/components/sections/AccountHero";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import { STATUS_PROGRESS, STATUS_TONE } from "@/constants/orderStatus";
import { formatRupees } from "@/utils/currency";
import "./TrackOrderPage.css";

const TRACKING_STEPS = [
  { key: "placed", label: "Order placed", detail: "We received your order.", icon: ClipboardCheck },
  { key: "confirmed", label: "Confirmed", detail: "Seller accepted the order.", icon: PackageSearch },
  { key: "packed", label: "Packed", detail: "Parcel handed to the courier.", icon: PackageCheck },
  { key: "transit", label: "In transit", detail: "On the way to the address.", icon: Truck },
  { key: "delivered", label: "Delivered", detail: "Handed over to the customer.", icon: CheckCircle2 },
];

const COURIERS = ["Leopards Courier", "TCS Express", "M&P Logistics", "Post Express"];

// Deterministic courier + tracking number so a refresh never changes them.
const getCourier = (orderId) => {
  const source = String(orderId || "");
  let total = 0;
  for (let index = 0; index < source.length; index += 1) total += source.charCodeAt(index) * (index + 1);
  return COURIERS[total % COURIERS.length];
};

const getTrackingNumber = (orderId) => {
  const digits = String(orderId || "").replace(/\D/g, "").slice(-9).padStart(9, "0");
  return `RS${digits}PK`;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "—";

// Steps are spaced a day apart from the order date so the rail shows
// plausible timestamps for the stages already completed.
const getStepDate = (createdAt, stepIndex) => {
  const base = new Date(createdAt);
  if (Number.isNaN(base.getTime())) return "";
  base.setDate(base.getDate() + stepIndex);
  return base.toLocaleDateString("en-US", { dateStyle: "medium" });
};

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.orders);
        const loaded = data.orders || [];
        setOrders(loaded);
        if (loaded.length > 0) setSelectedId(loaded[0].orderId);
      } catch (err) {
        setError(err?.message || "Unable to load your orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.orderId === selectedId) || null,
    [orders, selectedId],
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const needle = query.trim().toLowerCase();

    if (!needle) {
      setSearchError("Enter an order ID or tracking number to search.");
      return;
    }

    const match = orders.find(
      (order) =>
        order.orderId.toLowerCase().includes(needle) ||
        getTrackingNumber(order.orderId).toLowerCase().includes(needle),
    );

    if (!match) {
      setSearchError("No order matches that ID or tracking number.");
      return;
    }

    setSearchError("");
    setSelectedId(match.orderId);
  };

  const reachedSteps = selectedOrder ? STATUS_PROGRESS[selectedOrder.status] || 1 : 0;
  const isCancelled = selectedOrder?.status === "Cancelled";
  const isVerificationFailed = selectedOrder?.status === "Verification Failed";
  const isReturned = selectedOrder?.status === "Returned";

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Track Order"
          description="Look up any order by its ID or tracking number and follow the parcel from checkout to doorstep."
        />

        <section className="account-section track-search-card">
          <form className="track-search-form" onSubmit={submitSearch}>
            <div className="track-search-field">
              <Search size={18} aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchError("");
                }}
                placeholder="Order ID or tracking number (e.g. order-1712… / RS000123456PK)"
                aria-label="Order ID or tracking number"
              />
            </div>
            <button type="submit" className="btn-primary">
              Track
            </button>
          </form>
          {searchError ? <p className="track-search-error">{searchError}</p> : null}
        </section>

        {loading ? <EmptyState variant="loading" title="Loading your orders…" /> : null}
        {error ? (
          <EmptyState variant="error" title="Could not load your orders" description={error} />
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nothing to track yet"
            description="Once you place an order it will show up here with live delivery stages."
            action={
              <button type="button" className="btn-primary" onClick={() => navigate("/")}>
                Start shopping
              </button>
            }
          />
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div className="track-layout">
            {/* Order picker — a compact list so users rarely need the search box */}
            <aside className="account-section track-picker">
              <h2 className="track-picker-title">Your orders</h2>
              <div className="track-picker-list">
                {orders.map((order) => (
                  <button
                    key={order.orderId}
                    type="button"
                    className={`track-picker-item ${order.orderId === selectedId ? "active" : ""}`}
                    onClick={() => setSelectedId(order.orderId)}
                  >
                    <span className="track-picker-id">{order.orderId}</span>
                    <span className="track-picker-meta">
                      {order.itemCount} items · {formatRupees(order.totalAmount)}
                    </span>
                    <span className={`track-tone track-tone-${STATUS_TONE[order.status]}`}>
                      {order.status}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {selectedOrder ? (
              <div className="track-detail">
                <section className="account-section track-summary">
                  <div className="track-summary-head">
                    <div>
                      <span className="track-summary-label">Tracking number</span>
                      <strong className="track-code">{getTrackingNumber(selectedOrder.orderId)}</strong>
                    </div>
                    <span className={`track-tone track-tone-${STATUS_TONE[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="track-summary-grid">
                    <div>
                      <span>Order ID</span>
                      <strong>{selectedOrder.orderId}</strong>
                    </div>
                    <div>
                      <span>Courier</span>
                      <strong className="track-courier">{getCourier(selectedOrder.orderId)}</strong>
                    </div>
                    <div>
                      <span>Placed on</span>
                      <strong>{formatDate(selectedOrder.createdAt)}</strong>
                    </div>
                    <div>
                      <span>Order total</span>
                      <strong>{formatRupees(selectedOrder.totalAmount)}</strong>
                    </div>
                  </div>

                  <div className="track-address">
                    <span className="track-address-icon">
                      <MapPin size={17} />
                    </span>
                    <div>
                      <strong>{selectedOrder.address?.name || "Delivery address"}</strong>
                      <p>
                        {[
                          selectedOrder.address?.line1,
                          selectedOrder.address?.line2,
                          selectedOrder.address?.city,
                        ]
                          .filter(Boolean)
                          .join(", ") || "No address on this order."}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="account-section">
                  <h2 className="track-panel-title">Delivery progress</h2>

                  {isCancelled ? (
                    <div className="track-alert track-alert-danger">
                      <XCircle size={18} />
                      <span>This order was cancelled, so it will not move any further.</span>
                    </div>
                  ) : null}
                  {isVerificationFailed ? (
                    <div className="track-alert track-alert-danger">
                      <XCircle size={18} />
                      <span>This order failed verification and will not move any further.</span>
                    </div>
                  ) : null}
                  {isReturned ? (
                    <div className="track-alert track-alert-return">
                      <PackageCheck size={18} />
                      <span>
                        This parcel was returned and is on its way back to the seller. A return penalty
                        was charged to your wallet — see Payment Summary for the amount.
                      </span>
                    </div>
                  ) : null}

                  <ol className="track-steps">
                    {TRACKING_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const stepNumber = index + 1;
                      const isDone = stepNumber < reachedSteps;
                      const isCurrent = stepNumber === reachedSteps;
                      const state = isDone ? "done" : isCurrent ? "current" : "pending";

                      return (
                        <li key={step.key} className={`track-step track-step-${state}`}>
                          <span className="track-step-marker">
                            <Icon size={17} />
                          </span>
                          <div className="track-step-body">
                            <strong>{step.label}</strong>
                            <small>{step.detail}</small>
                            <em>{isDone || isCurrent ? getStepDate(selectedOrder.createdAt, index) : "Pending"}</em>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                <section className="account-section">
                  <h2 className="track-panel-title">Items in this shipment</h2>
                  <div className="track-items">
                    {selectedOrder.cart?.map((item) => (
                      <div key={item.itemId} className="track-item-row">
                        <span className="track-item-name">{item.product?.name}</span>
                        <span className="track-item-qty">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="track-detail-actions">
                    <button type="button" className="btn-outline" onClick={() => navigate("/my-orders")}>
                      Open in My Orders
                    </button>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrackOrderPage;
