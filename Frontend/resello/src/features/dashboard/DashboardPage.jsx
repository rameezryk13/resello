import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import AccountAlert from "@/components/sections/AccountAlert";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import useWallet from "@/features/wallet/useWallet";
import DashboardBalanceCard from "./components/DashboardBalanceCard";
import DashboardMetricStrip from "./components/DashboardMetricStrip";
import DashboardActivitySection from "./components/DashboardActivitySection";
import DashboardQuickActions from "./components/DashboardQuickActions";
import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [totals, setTotals] = useState({ ordersCount: 0, itemsSold: 0, totalProfit: 0 });
  const [shopCount, setShopCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  // The wallet loads on its own clock — the balance rail should not sit blank
  // waiting on the followed-shops call it has nothing to do with.
  const { wallet, loading: walletLoading } = useWallet();

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

        <AccountAlert wallet={wallet} />

        <div className="dash-layout">
          {/* Left rail: wallet balance + headline numbers */}
          <aside className="dash-rail">
            <DashboardBalanceCard
              wallet={wallet}
              walletLoading={walletLoading}
              onManageWallet={() => navigate("/wallet")}
            />
            <DashboardMetricStrip
              totals={totals}
              loading={loading}
              wallet={wallet}
              walletLoading={walletLoading}
            />
          </aside>

          {/* Right column: activity rows then the quick-action grid */}
          <div className="dash-main">
            <DashboardActivitySection
              totals={totals}
              shopCount={shopCount}
              loading={loading}
              onNavigate={navigate}
            />
            <DashboardQuickActions onNavigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
