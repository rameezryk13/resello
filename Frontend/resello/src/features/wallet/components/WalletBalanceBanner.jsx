import { ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { formatRupees, formatSignedRupees } from "@/utils/currency";

const WalletBalanceBanner = ({
  wallet,
  loading,
  withdrawBlocked,
  formOpen,
  setFormOpen,
  amount,
  setAmount,
  submitting,
  onWithdrawRequest,
}) => {
  const { withdrawal } = wallet;

  return (
    <section className="wallet-banner">
      <div className="wallet-banner-main">
        <span className="wallet-banner-label">
          <WalletIcon size={15} aria-hidden="true" /> Current balance
        </span>
        <strong className={`wallet-banner-value ${wallet.balance < 0 ? "negative" : ""}`}>
          {loading ? "—" : formatSignedRupees(wallet.balance)}
        </strong>
        <p className="wallet-banner-note">
          {wallet.deactivated
            ? "Clear your negative balance to reactivate your account."
            : wallet.balance < 0
              ? "Your wallet is in minus. Withdrawal is disabled until balance is positive."
              : "Ready to request withdrawal. The payout window opens every Monday."}
        </p>
      </div>

      <div className="wallet-banner-side">
        <div className="wallet-banner-stat">
          <span>Pending commission</span>
          <strong>{loading ? "—" : formatRupees(wallet.pendingCommission)}</strong>
        </div>
        <div className="wallet-banner-stat">
          <span>Cleared</span>
          <strong>{loading ? "—" : formatRupees(wallet.clearedCommission)}</strong>
        </div>
        <div className="wallet-banner-stat">
          <span>Return penalties</span>
          <span className="wallet-stat-hint">Returned to vendor</span>
          <strong>
            {loading
              ? "—"
              : wallet.penaltyTotal > 0
                ? `− ${formatRupees(wallet.penaltyTotal)}`
                : formatRupees(0)}
          </strong>
        </div>
        <div className="wallet-banner-stat">
          <span>Shipping &amp; Return payment</span>
          <span className="wallet-stat-hint">Without commission</span>
          <strong>
            {loading
              ? "—"
              : formatRupees(wallet.shippingReturnPayment || 0)}
          </strong>
        </div>
        <div className="wallet-banner-actions">
          <button
            type="button"
            className="wallet-btn-solid"
            disabled={Boolean(withdrawBlocked)}
            onClick={() => setFormOpen((open) => !open)}
          >
            <ArrowUpRight size={16} /> {withdrawBlocked || "Withdraw"}
          </button>
        </div>
      </div>

      {formOpen && !withdrawBlocked && (
        <form className="wallet-withdraw-form" onSubmit={onWithdrawRequest}>
          <label htmlFor="withdraw-amount">
            Select amount to request withdrawal
            <small>Up to {formatRupees(withdrawal?.available || 0)}</small>
          </label>
          <div className="wallet-withdraw-row">
            <input
              id="withdraw-amount"
              type="number"
              min="1"
              max={withdrawal?.available || 0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount (e.g. 500)"
              required
            />
            <button type="submit" className="wallet-btn-solid" disabled={submitting}>
              {submitting ? "Sending Request…" : "Send Request to Admin"}
            </button>
            <button type="button" className="wallet-btn-ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default WalletBalanceBanner;
