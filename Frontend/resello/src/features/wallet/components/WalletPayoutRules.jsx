import { CalendarClock, CreditCard } from "lucide-react";
import { formatRupees } from "@/utils/currency";

const WalletPayoutRules = ({ wallet, onNavigate }) => {
  return (
    <aside className="wallet-side">
      <section className="account-section wallet-payout">
        <span className="wallet-side-label">Default payout method</span>
        <div className="wallet-payout-empty">
          <span className="wallet-payout-icon">
            <CreditCard size={20} />
          </span>
          <div>
            <strong>No payout method added</strong>
            <p>Add a JazzCash, EasyPaisa or bank account to receive withdrawals.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary wallet-payout-btn"
          onClick={() => onNavigate("/profit-account")}
        >
          Add payout method
        </button>
      </section>

      <section className="account-section wallet-note">
        <span className="wallet-note-icon">
          <CalendarClock size={19} />
        </span>
        <div>
          <strong>How your wallet works</strong>
          <p>
            Commission stays pending until the order is delivered, then clears into your balance. An
            order returned to vendor costs a {formatRupees(wallet.returnPenalty)} penalty. Broken or
            wrong items qualify for shipping &amp; return payment (without commission). Withdrawals are released on
            Mondays after admin approval.
          </p>
        </div>
      </section>
    </aside>
  );
};

export default WalletPayoutRules;
