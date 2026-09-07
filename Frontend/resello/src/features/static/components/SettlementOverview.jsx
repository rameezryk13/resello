import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { formatRupees } from "@/utils/currency";

const SettlementOverview = ({
  totalAdminCleared,
  totalAdminPending,
  wallet,
  clearedOrdersCount,
  pendingOrdersCount,
}) => {
  return (
    <div className="admin-settlement-kpi-grid">
      <div className="admin-kpi-card cleared">
        <div className="kpi-icon-wrap cleared">
          <CheckCircle2 size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Total Cleared by Admin</span>
          <div className="kpi-value cleared">{formatRupees(totalAdminCleared)}</div>
          <span className="kpi-sub">
            Approved refunds &amp; cleared commissions credited to wallet
          </span>
        </div>
      </div>

      <div className="admin-kpi-card pending">
        <div className="kpi-icon-wrap pending">
          <Clock size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Total Pending from Admin</span>
          <div className="kpi-value pending">{formatRupees(totalAdminPending)}</div>
          <span className="kpi-sub">
            Awaiting QA defect verification or delivery clearance
          </span>
        </div>
      </div>

      <div className="admin-kpi-card stats">
        <div className="kpi-icon-wrap stats">
          <Wallet size={24} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Current Reseller Wallet</span>
          <div className="kpi-value stats">{formatRupees(wallet.balance)}</div>
          <span className="kpi-sub">
            {clearedOrdersCount} orders cleared · {pendingOrdersCount} orders pending
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettlementOverview;
