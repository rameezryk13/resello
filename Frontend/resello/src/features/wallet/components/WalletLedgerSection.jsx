import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { formatRupees } from "@/utils/currency";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

const WalletLedgerSection = ({
  activeFilter,
  setActiveFilter,
  filterNames,
  visible,
  totalTransactionsCount,
  onNavigate,
}) => {
  return (
    <section className="account-section wallet-ledger">
      <div className="wallet-ledger-head">
        <div>
          <h2>Transaction history</h2>
          <p>Every commission, shipping &amp; return and withdrawal in one place.</p>
        </div>
        <div className="wallet-filter-row">
          {filterNames.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`wallet-filter ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="wallet-ledger-empty">
          <span className="wallet-ledger-empty-icon">
            <Receipt size={24} />
          </span>
          {totalTransactionsCount === 0 ? (
            <>
              <strong>No transactions yet</strong>
              <p>
                Your commission lands here the moment an order is marked delivered. Place an order to
                get the first entry.
              </p>
              <button type="button" className="btn-outline" onClick={() => onNavigate("/my-orders")}>
                View your orders
              </button>
            </>
          ) : (
            <>
              <strong>Nothing under {activeFilter}</strong>
              <p>You have wallet activity, but none of it is {activeFilter.toLowerCase()}.</p>
              <button type="button" className="btn-outline" onClick={() => setActiveFilter("All")}>
                Show everything
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="wallet-ledger-list">
          {visible.map((entry) => (
            <div key={entry.id} className="wallet-ledger-row">
              <span className={`wallet-ledger-icon ${entry.direction}`}>
                {entry.direction === "in" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
              </span>
              <span className="wallet-ledger-text">
                <strong>
                  {entry.type === "penalty"
                    ? (entry.title?.includes("vendor") ? entry.title : "Return to vendor penalty")
                    : entry.type === "shipping-return"
                      ? (entry.title || "Shipping & return payment")
                      : entry.title}
                </strong>
                <small>
                  {formatDate(entry.createdAt)}
                  {entry.orderId ? ` · ${entry.orderId}` : ""}
                </small>
              </span>
              <span className={`wallet-ledger-amount ${entry.direction}`}>
                {entry.direction === "in" ? "+" : "−"}
                {formatRupees(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WalletLedgerSection;
