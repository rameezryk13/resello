import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import AccountAlert from "@/components/sections/AccountAlert";
import { useToast } from "@/context/ToastContext";
import { formatRupees, formatSignedRupees } from "@/utils/currency";
import useWallet from "./useWallet";
import WalletDemoBar from "./components/WalletDemoBar";
import WalletBalanceBanner from "./components/WalletBalanceBanner";
import WalletRequestsSection from "./components/WalletRequestsSection";
import WalletLedgerSection from "./components/WalletLedgerSection";
import WalletPayoutRules from "./components/WalletPayoutRules";
import "./WalletPage.css";

const LEDGER_FILTERS = {
  All: null,
  Commission: ["commission", "commission-reversal"],
  Penalties: ["penalty", "penalty-reversal"],
  "Shipping & Return": ["shipping-return", "shipping-return-reversal", "shipping"],
  Withdrawals: ["withdrawal"],
};

const FILTER_NAMES = Object.keys(LEDGER_FILTERS);

const formatWindow = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : "Monday";

const WalletPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    wallet,
    loading,
    requestWithdraw,
    approveWithdrawal,
    rejectWithdrawal,
    setDemoDate,
  } = useWallet();

  const [activeFilter, setActiveFilter] = useState("All");
  const [amount, setAmount] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { withdrawal, transactions = [], withdrawalRequests = [] } = wallet;

  const visible = useMemo(() => {
    const types = LEDGER_FILTERS[activeFilter];
    return types ? transactions.filter((entry) => types.includes(entry.type)) : transactions;
  }, [transactions, activeFilter]);

  const withdrawBlocked = wallet.deactivated
    ? "Withdrawals paused"
    : wallet.balance < 0
      ? "Negative balance (Cannot withdraw)"
      : !withdrawal?.allowedToday
        ? `Opens ${formatWindow(withdrawal?.nextWindow)}`
        : (withdrawal?.available || 0) <= 0
          ? "Nothing to withdraw"
          : null;

  const handleWithdrawRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await requestWithdraw(amount);
      toast.success(`Withdrawal request of ${formatRupees(amount)} sent to admin.`);
      setAmount("");
      setFormOpen(false);
    } catch (error) {
      toast.error(error?.message || "Could not submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (requestId, reqAmount) => {
    try {
      await approveWithdrawal(requestId);
      toast.success(`Withdrawal request of ${formatRupees(reqAmount)} accepted by Admin! Amount cut from wallet.`);
    } catch (error) {
      toast.error(error?.message || "Could not approve request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectWithdrawal(requestId);
      toast.info("Withdrawal request rejected by Admin.");
    } catch (error) {
      toast.error(error?.message || "Could not reject request.");
    }
  };

  const handleDateChange = async (dateStr) => {
    try {
      await setDemoDate(dateStr || null);
      if (dateStr) {
        toast.info(`Demo date set to ${dateStr}`);
      } else {
        toast.info("Demo date reset to today.");
      }
    } catch (error) {
      toast.error(error?.message || "Could not set demo date.");
    }
  };

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Wallet"
          description="Your commission clears here once an order is delivered. Send a withdrawal request to admin on payout day (Mondays)."
        />

        {/* Demo Date Controller Bar */}
        <WalletDemoBar wallet={wallet} onDateChange={handleDateChange} />

        {/* Negative Balance Alert */}
        {wallet.balance < 0 && (
          <div className="wallet-negative-warning">
            <ShieldAlert size={20} />
            <p>
              <strong>Negative Wallet Balance ({formatSignedRupees(wallet.balance)}):</strong> You cannot withdraw money while your balance is in negative. Recover your balance as pending commissions clear.
            </p>
          </div>
        )}

        <AccountAlert wallet={wallet} />

        {/* Balance banner */}
        <WalletBalanceBanner
          wallet={wallet}
          loading={loading}
          withdrawBlocked={withdrawBlocked}
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          amount={amount}
          setAmount={setAmount}
          submitting={submitting}
          onWithdrawRequest={handleWithdrawRequest}
        />

        {/* Withdrawal Requests Section */}
        <WalletRequestsSection
          requests={withdrawalRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        <div className="wallet-layout">
          {/* Ledger */}
          <WalletLedgerSection
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            filterNames={FILTER_NAMES}
            visible={visible}
            totalTransactionsCount={transactions.length}
            onNavigate={navigate}
          />

          {/* Side rail */}
          <WalletPayoutRules wallet={wallet} onNavigate={navigate} />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
