import { ArrowRight } from "lucide-react";
import { formatSignedRupees } from "@/utils/currency";

const DashboardBalanceCard = ({ wallet, walletLoading, onManageWallet }) => {
  return (
    <div className="dash-balance-card">
      <span className="dash-balance-label">Wallet balance</span>
      <strong className={`dash-balance-value ${wallet.balance < 0 ? "negative" : ""}`}>
        {walletLoading ? "—" : formatSignedRupees(wallet.balance)}
      </strong>
      <p className="dash-balance-note">
        {wallet.deactivated
          ? "Your account is deactivated until this balance is cleared."
          : wallet.balance < 0
            ? "In minus after return penalties. Pending commission will bring it back up."
            : "Available to withdraw every Monday or spend on your next order."}
      </p>
      <button type="button" className="dash-balance-btn" onClick={onManageWallet}>
        Manage wallet <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default DashboardBalanceCard;
