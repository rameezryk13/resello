import { formatRupees } from "@/utils/currency";

const DashboardMetricStrip = ({ totals, loading, wallet, walletLoading }) => {
  return (
    <div className="dash-metric-strip">
      <div className="dash-metric">
        <span>Orders placed</span>
        <strong>{loading ? "—" : totals.ordersCount}</strong>
      </div>
      <div className="dash-metric">
        <span>Items sold</span>
        <strong>{loading ? "—" : totals.itemsSold}</strong>
      </div>
      <div className="dash-metric">
        <span>Pending commission</span>
        <strong>{walletLoading ? "—" : formatRupees(wallet.pendingCommission)}</strong>
      </div>
      <div className="dash-metric">
        <div className="dash-metric-text-group">
          <span>Return penalties</span>
          <small className="dash-metric-hint">Returned to vendor</small>
        </div>
        <strong className={wallet.penaltyTotal > 0 ? "negative" : ""}>
          {walletLoading
            ? "—"
            : wallet.penaltyTotal > 0
              ? `− ${formatRupees(wallet.penaltyTotal)}`
              : formatRupees(0)}
        </strong>
      </div>
      <div className="dash-metric">
        <div className="dash-metric-text-group">
          <span>Shipping &amp; return payment</span>
          <small className="dash-metric-hint">Without commission</small>
        </div>
        <strong>
          {walletLoading
            ? "—"
            : formatRupees(wallet.shippingReturnPayment || 0)}
        </strong>
      </div>
      <div className="dash-metric">
        <span>Profit earned</span>
        <strong>{loading ? "—" : formatRupees(totals.totalProfit)}</strong>
      </div>
    </div>
  );
};

export default DashboardMetricStrip;
