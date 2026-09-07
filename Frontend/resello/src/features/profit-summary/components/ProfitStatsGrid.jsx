import { Package, Receipt, Truck, Wallet } from "lucide-react";

const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const ProfitStatsGrid = ({ totals, wallet, walletLoading }) => {
  return (
    <section className="ps-stats">
      <div className="ps-stat">
        <span className="ps-stat-icon">
          <Receipt size={16} aria-hidden="true" />
        </span>
        <span className="ps-stat-label">Orders</span>
        <strong>{totals.completedOrders}</strong>
      </div>
      <div className="ps-stat">
        <span className="ps-stat-icon">
          <Package size={16} aria-hidden="true" />
        </span>
        <span className="ps-stat-label">Items sold</span>
        <strong>{totals.itemsSold}</strong>
      </div>
      <div className="ps-stat">
        <span className="ps-stat-icon">
          <Truck size={16} aria-hidden="true" />
        </span>
        <span className="ps-stat-label">Shipping</span>
        <strong>PKR {formatPKR(totals.shipping)}</strong>
      </div>
      <div className="ps-stat">
        <span className="ps-stat-icon">
          <Wallet size={16} aria-hidden="true" />
        </span>
        <span className="ps-stat-label">Wallet balance</span>
        <strong className={wallet.balance < 0 ? "is-negative" : ""}>
          {walletLoading
            ? "—"
            : `${wallet.balance < 0 ? "− " : ""}PKR ${formatPKR(Math.abs(wallet.balance))}`}
        </strong>
      </div>
    </section>
  );
};

export default ProfitStatsGrid;
