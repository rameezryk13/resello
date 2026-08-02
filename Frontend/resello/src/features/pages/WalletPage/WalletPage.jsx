import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  Receipt,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import Header from "../../../components/Header/Header.jsx";
import AccountHero from "../../../components/PageSections/AccountHero";
import { get } from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { useToast } from "../../../components/Toast/useToast";
import { formatRupees } from "../../../utils/currency";
import "./WalletPage.css";

// No wallet ledger exists on the backend yet, so balances stay at zero and
// the history panel shows its empty state until those endpoints land.
const BALANCE = 0;
const PENDING = 0;
const TRANSACTIONS = [];

const LEDGER_FILTERS = ["All", "Deposits", "Withdrawals"];

const WalletPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [lifetimeProfit, setLifetimeProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadProfit = async () => {
      try {
        const data = await get(endpoints.profitSummary);
        setLifetimeProfit(data?.totals?.totalProfit || 0);
      } catch (error) {
        // Lifetime profit stays at 0 on failure, which is indistinguishable
        // from a genuine zero balance without this message.
        toast.error(error?.message || "Could not load your wallet summary.");
      } finally {
        setLoading(false);
      }
    };

    loadProfit();
  }, [toast]);

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Wallet"
          description="Track your balance, deposit funds, and withdraw earnings to your own account."
        />

        {/* Balance banner: one wide bar instead of a card grid */}
        <section className="wallet-banner">
          <div className="wallet-banner-main">
            <span className="wallet-banner-label">
              <WalletIcon size={15} aria-hidden="true" /> Current balance
            </span>
            <strong className="wallet-banner-value">{formatRupees(BALANCE)}</strong>
            <p className="wallet-banner-note">Ready to withdraw or spend on your next order.</p>
          </div>

          <div className="wallet-banner-side">
            <div className="wallet-banner-stat">
              <span>Pending clearance</span>
              <strong>{formatRupees(PENDING)}</strong>
            </div>
            <div className="wallet-banner-stat">
              <span>Lifetime profit</span>
              <strong>{loading ? "—" : formatRupees(lifetimeProfit)}</strong>
            </div>
            <div className="wallet-banner-actions">
              <button type="button" className="wallet-btn-solid">
                <Plus size={16} /> Deposit
              </button>
              <button type="button" className="wallet-btn-ghost">
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>
          </div>
        </section>

        <div className="wallet-layout">
          {/* Ledger */}
          <section className="account-section wallet-ledger">
            <div className="wallet-ledger-head">
              <div>
                <h2>Transaction history</h2>
                <p>Every deposit, withdrawal and order payout in one place.</p>
              </div>
              <div className="wallet-filter-row">
                {LEDGER_FILTERS.map((filter) => (
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

            {TRANSACTIONS.length === 0 ? (
              <div className="wallet-ledger-empty">
                <span className="wallet-ledger-empty-icon">
                  <Receipt size={24} />
                </span>
                <strong>No transactions yet</strong>
                <p>Once funds move in or out of your wallet, you will see every entry listed here.</p>
                <button type="button" className="btn-outline" onClick={() => navigate("/my-orders")}>
                  View your orders
                </button>
              </div>
            ) : (
              <div className="wallet-ledger-list">
                {TRANSACTIONS.map((entry) => (
                  <div key={entry.id} className="wallet-ledger-row">
                    <span className={`wallet-ledger-icon ${entry.direction}`}>
                      {entry.direction === "in" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                    </span>
                    <span className="wallet-ledger-text">
                      <strong>{entry.title}</strong>
                      <small>{entry.date}</small>
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

          {/* Side rail: payout method + safety note */}
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
              <button type="button" className="btn-primary wallet-payout-btn" onClick={() => navigate("/profit-account")}>
                Add payout method
              </button>
            </section>

            <section className="account-section wallet-note">
              <span className="wallet-note-icon">
                <ShieldCheck size={19} />
              </span>
              <div>
                <strong>Withdrawals are verified</strong>
                <p>
                  Payouts are released to your saved account within 1–2 working days after your order profit clears.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
