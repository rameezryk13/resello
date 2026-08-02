import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Layers,
  Package,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import { formatRupees } from "@/utils/currency";
import "./DashboardPage.css";

// The backend keeps no wallet ledger yet, so the balance rail renders a
// zero state until deposits/withdrawals exist server-side.
const WALLET_BALANCE = 0;

const QUICK_ACTIONS = [
  { label: "Browse products", hint: "Find new items to resell", path: "/", icon: ShoppingBag },
  { label: "My orders", hint: "Every order you placed", path: "/my-orders", icon: Package },
  { label: "Track order", hint: "See where a parcel is", path: "/track-order", icon: Truck },
  { label: "Bulk order", hint: "Order in wholesale volume", path: "/?section=more", icon: Layers },
  { label: "Followed shops", hint: "Shops you keep an eye on", path: "/followed-shops", icon: Store },
  { label: "Wallet", hint: "Balance and payouts", path: "/wallet", icon: Wallet },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [totals, setTotals] = useState({ ordersCount: 0, itemsSold: 0, totalProfit: 0 });
  const [shopCount, setShopCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, shopsData] = await Promise.all([
          get(endpoints.profitSummary),
          get(endpoints.followedShops),
        ]);
        setTotals({
          ordersCount: summaryData?.totals?.ordersCount || 0,
          itemsSold: summaryData?.totals?.itemsSold || 0,
          totalProfit: summaryData?.totals?.totalProfit || 0,
        });
        setShopCount((shopsData?.followedShops || []).length);
      } catch (error) {
        // The cards fall back to their zero state, so the toast is the only
        // signal that these are stale numbers rather than real ones.
        toast.error(error?.message || "Could not load your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [toast]);

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Your dashboard"
          description="A single view of your wallet, your orders and the shops you follow — jump straight to whatever needs you next."
        />

        <div className="dash-layout">
          {/* Left rail: wallet balance + headline numbers */}
          <aside className="dash-rail">
            <div className="dash-balance-card">
              <span className="dash-balance-label">Wallet balance</span>
              <strong className="dash-balance-value">{formatRupees(WALLET_BALANCE)}</strong>
              <p className="dash-balance-note">Available to withdraw or spend on your next order.</p>
              <button type="button" className="dash-balance-btn" onClick={() => navigate("/wallet")}>
                Manage wallet <ArrowRight size={16} />
              </button>
            </div>

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
                <span>Profit earned</span>
                <strong>{loading ? "—" : formatRupees(totals.totalProfit)}</strong>
              </div>
            </div>
          </aside>

          {/* Right column: activity rows then the quick-action grid */}
          <div className="dash-main">
            <section className="account-section dash-activity">
              <div className="dash-section-head">
                <h2>Activity</h2>
                <p>Where your account stands right now.</p>
              </div>

              <button type="button" className="dash-activity-row" onClick={() => navigate("/my-orders")}>
                <span className="dash-activity-icon">
                  <Package size={20} />
                </span>
                <span className="dash-activity-text">
                  <strong>Your orders</strong>
                  <small>
                    {loading
                      ? "Loading your orders…"
                      : totals.ordersCount > 0
                        ? `${totals.ordersCount} order${totals.ordersCount === 1 ? "" : "s"} to track and manage.`
                        : "You have not placed an order yet."}
                  </small>
                </span>
                <span className="dash-activity-cta">View all <ArrowRight size={15} /></span>
              </button>

              <button type="button" className="dash-activity-row" onClick={() => navigate("/track-order")}>
                <span className="dash-activity-icon">
                  <Truck size={20} />
                </span>
                <span className="dash-activity-text">
                  <strong>Track a delivery</strong>
                  <small>Follow a parcel step by step with its order ID.</small>
                </span>
                <span className="dash-activity-cta">Track <ArrowRight size={15} /></span>
              </button>

              <button type="button" className="dash-activity-row" onClick={() => navigate("/followed-shops")}>
                <span className="dash-activity-icon">
                  <Store size={20} />
                </span>
                <span className="dash-activity-text">
                  <strong>Followed shops</strong>
                  <small>
                    {loading
                      ? "Loading your shops…"
                      : shopCount > 0
                        ? `You follow ${shopCount} shop${shopCount === 1 ? "" : "s"}.`
                        : "You are not following any shop yet."}
                  </small>
                </span>
                <span className="dash-activity-cta">Open <ArrowRight size={15} /></span>
              </button>
            </section>

            <section className="account-section">
              <div className="dash-section-head">
                <h2>Quick actions</h2>
                <p>Shortcuts to the things resellers do most.</p>
              </div>
              <div className="dash-action-grid">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="dash-action-tile"
                      onClick={() => navigate(action.path)}
                    >
                      <span className="dash-action-icon">
                        <Icon size={19} />
                      </span>
                      <strong>{action.label}</strong>
                      <small>{action.hint}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
