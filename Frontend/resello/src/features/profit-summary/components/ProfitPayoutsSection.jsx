import { CheckCircle2, Clock, Wallet } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ProfitPayoutsSection = ({
  payoutTab,
  setPayoutTab,
  payoutTabs,
  pendingOrders,
  payoutOrders,
  upcomingPayout,
}) => {
  return (
    <section className="ps-payouts">
      <div className="ps-section-head">
        <h2>Payouts</h2>
        <div className="ps-tabs" role="tablist" aria-label="Payout status">
          {payoutTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={payoutTab === tab}
              className={`ps-tab ${payoutTab === tab ? "active" : ""}`}
              onClick={() => setPayoutTab(tab)}
            >
              {tab === "Pending" ? (
                <Clock size={15} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={15} aria-hidden="true" />
              )}
              {tab}
              {tab === "Pending" && pendingOrders.length > 0 ? (
                <span className="ps-tab-badge">{pendingOrders.length}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="ps-payout-banner">
        <div>
          <span className="ps-payout-label">On its way to you</span>
          <div className="ps-payout-amount">
            PKR {formatPKR(upcomingPayout)}
          </div>
        </div>
        <p className="ps-payout-desc">
          Released once delivery is confirmed
          {pendingOrders.length > 0
            ? ` — ${pendingOrders.length} order${
                pendingOrders.length === 1 ? "" : "s"
              } awaiting`
            : ""}
          .
        </p>
      </div>

      <div className="ps-list">
        {payoutOrders.length ? (
          payoutOrders.map((order) => (
            <article className="ps-list-item" key={order.orderId}>
              <span
                className={`ps-list-icon ${
                  payoutTab === "Paid" ? "is-paid" : ""
                }`}
              >
                {payoutTab === "Pending" ? (
                  <Clock size={17} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={17} aria-hidden="true" />
                )}
              </span>
              <div className="ps-list-main">
                <strong>Order #{order.orderId}</strong>
                <span>
                  {formatDate(order.createdAt)} · {order.itemCount || 0} item
                  {order.itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="ps-list-figures">
                <span
                  className={`ps-list-amount ${
                    payoutTab === "Paid" ? "positive" : ""
                  }`}
                >
                  PKR {formatPKR(order.profit)}
                </span>
                <span className="ps-list-sub">
                  of PKR {formatPKR(order.totalAmount)}
                </span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon={Wallet}
            title={`No ${payoutTab.toLowerCase()} payouts`}
            description={
              payoutTab === "Pending"
                ? "Every payout has been released."
                : "Nothing has been paid out yet."
            }
          />
        )}
      </div>
    </section>
  );
};

export default ProfitPayoutsSection;
