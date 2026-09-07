import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import Header from "@/components/layout/Header/Header.jsx";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import AccountAlert from "@/components/sections/AccountAlert";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import { CLEARED_STATUS, DEAD_STATUSES } from "@/constants/orderStatus";
import useWallet from "@/features/wallet/useWallet";
import ProfitHeadlineCard from "./components/ProfitHeadlineCard";
import ProfitTrendChart from "./components/ProfitTrendChart";
import ProfitStatsGrid from "./components/ProfitStatsGrid";
import ProfitPenaltiesSection from "./components/ProfitPenaltiesSection";
import ProfitPayoutsSection from "./components/ProfitPayoutsSection";
import "./ProfitSummaryPage.css";

const SALES_RANGES = ["All time", "This month"];
const PAYOUT_TABS = ["Pending", "Paid"];
const TREND_MONTHS = 6;

const getPaymentStatus = (order) => {
  if (order?.status === CLEARED_STATUS) return "Paid";
  if (DEAD_STATUSES.includes(order?.status)) return null;
  return "Pending";
};

const isThisMonth = (value) => {
  const created = new Date(value);
  const now = new Date();

  if (Number.isNaN(created.getTime())) return false;

  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth()
  );
};

const buildTrend = (orders) => {
  const now = new Date();
  const months = [];

  for (let back = TREND_MONTHS - 1; back >= 0; back -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - back, 1);
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      profit: 0,
    });
  }

  orders.forEach((order) => {
    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) return;

    const slot = months.find(
      (entry) =>
        entry.year === created.getFullYear() && entry.month === created.getMonth()
    );

    if (slot) slot.profit += Number(order.profit) || 0;
  });

  return months;
};

const ProfitSummaryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesRange, setSalesRange] = useState("All time");
  const [payoutTab, setPayoutTab] = useState("Pending");
  const { wallet, loading: walletLoading } = useWallet();

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.orders);

        if (!ignore) {
          setOrders(
            (data.orders || []).map((order) => ({
              ...order,
              paymentStatus: getPaymentStatus(order),
            }))
          );
        }
      } catch (err) {
        if (!ignore) {
          setOrders([]);
          setError(err?.message || "Unable to load your earnings");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const rangedOrders = useMemo(
    () =>
      salesRange === "This month"
        ? orders.filter((order) => isThisMonth(order.createdAt))
        : orders,
    [orders, salesRange]
  );

  const totals = useMemo(
    () =>
      rangedOrders.reduce(
        (accumulator, order) => ({
          totalSales: accumulator.totalSales + (Number(order.totalAmount) || 0),
          completedOrders: accumulator.completedOrders + 1,
          totalProfit: accumulator.totalProfit + (Number(order.profit) || 0),
          itemsSold: accumulator.itemsSold + (Number(order.itemCount) || 0),
          shipping: accumulator.shipping + (Number(order.shippingCharge) || 0),
        }),
        {
          totalSales: 0,
          completedOrders: 0,
          totalProfit: 0,
          itemsSold: 0,
          shipping: 0,
        }
      ),
    [rangedOrders]
  );

  const margin =
    totals.totalSales > 0 ? (totals.totalProfit / totals.totalSales) * 100 : 0;

  const avgProfitPerOrder =
    totals.completedOrders > 0 ? totals.totalProfit / totals.completedOrders : 0;

  const trend = useMemo(() => buildTrend(orders), [orders]);
  const trendPeak = Math.max(...trend.map((entry) => entry.profit), 0);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === "Pending"),
    [orders]
  );

  const payoutOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === payoutTab),
    [orders, payoutTab]
  );

  const upcomingPayout = wallet.pendingCommission;
  const hasOrders = orders.length > 0;

  return (
    <div className="ps-page animate-fade-in">
      <Header />
      <div className="container ps-wrap">
        <div className="ps-topbar">
          <button
            type="button"
            className="ps-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div className="ps-topbar-text">
            <h1>Earnings</h1>
            <p>What you&apos;ve made, and what&apos;s still on its way.</p>
          </div>

          <div className="ps-range-toggle" role="group" aria-label="Date range">
            {SALES_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={salesRange === range ? "active" : ""}
                aria-pressed={salesRange === range}
                onClick={() => setSalesRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <AccountAlert wallet={wallet} />

        {error ? (
          <EmptyState
            variant="error"
            title="Could not load your earnings"
            description={error}
          />
        ) : null}

        {loading ? <EmptyState variant="loading" title="Loading earnings..." /> : null}

        {!loading && !error && !hasOrders ? (
          <EmptyState
            icon={Wallet}
            title="No earnings yet"
            description="Once an order is placed from your reseller account, your profit and payouts will show up here."
          />
        ) : null}

        {!loading && !error && hasOrders ? (
          <div className="ps-grid">
            <ProfitHeadlineCard
              salesRange={salesRange}
              totals={totals}
              margin={margin}
              avgProfitPerOrder={avgProfitPerOrder}
            />

            <ProfitTrendChart
              trend={trend}
              trendPeak={trendPeak}
              trendMonths={TREND_MONTHS}
            />

            <ProfitStatsGrid
              totals={totals}
              wallet={wallet}
              walletLoading={walletLoading}
            />

            <ProfitPenaltiesSection wallet={wallet} />

            <ProfitPayoutsSection
              payoutTab={payoutTab}
              setPayoutTab={setPayoutTab}
              payoutTabs={PAYOUT_TABS}
              pendingOrders={pendingOrders}
              payoutOrders={payoutOrders}
              upcomingPayout={upcomingPayout}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProfitSummaryPage;
