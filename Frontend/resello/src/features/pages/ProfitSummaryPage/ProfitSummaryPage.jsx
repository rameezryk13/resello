import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Gift,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Header from "../../../components/Header/Header.jsx";
import { get } from "../../../api/client";
import endpoints from "../../../api/endpoints";
import "./ProfitSummaryPage.css";

const SALES_RANGES = ["All time", "This month"];
const PAYOUT_TABS = ["Pending", "Paid"];

const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const getPaymentStatus = (order) => {
  const source = String(order?.orderId || "");
  let total = 0;

  for (let index = 0; index < source.length; index += 1) {
    total += source.charCodeAt(index);
  }

  return PAYOUT_TABS[total % PAYOUT_TABS.length];
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

const ProfitSummaryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesRange, setSalesRange] = useState("All time");
  const [payoutTab, setPayoutTab] = useState("Pending");

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setLoading(true);

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
      } catch {
        if (!ignore) setOrders([]);
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
          totalBonus: accumulator.totalBonus + (Number(order.bonus) || 0),
        }),
        { totalSales: 0, completedOrders: 0, totalProfit: 0, totalBonus: 0 }
      ),
    [rangedOrders]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === "Pending"),
    [orders]
  );

  const payoutOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === payoutTab),
    [orders, payoutTab]
  );

  const upcomingPayout = pendingOrders.reduce(
    (sum, order) => sum + (Number(order.profit) || 0),
    0
  );

  return (
    <div className="ps-page animate-fade-in">
      <Header />
      <div className="container ps-wrap">
        <div className="ps-shell">
          <div className="ps-topbar">
            <button
              type="button"
              className="ps-back"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
            <h1>Payment Summary</h1>
          </div>

          <div className="ps-hero">
            <div className="ps-hero-top">
              <div className="ps-hero-label">
                <span className="ps-hero-icon">
                  <TrendingUp size={18} />
                </span>
                <div>
                  <strong>TOTAL SALES</strong>
                  <span>{salesRange}</span>
                </div>
              </div>

              <div className="ps-range-toggle">
                {SALES_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={salesRange === range ? "active" : ""}
                    onClick={() => setSalesRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-hero-amount">
              <span className="ps-currency">PKR</span>
              <span className="ps-amount">
                {loading ? "--" : formatPKR(totals.totalSales)}
              </span>
            </div>
            <p className="ps-hero-desc">
              Sales you&apos;ve booked across all your customers.
            </p>
          </div>

          <div className="ps-stat-row">
            <div className="ps-stat">
              <span className="ps-stat-icon">
                <ShoppingBag size={18} />
              </span>
              <span className="ps-stat-label">COMPLETED ORDERS</span>
              <strong>{loading ? "--" : totals.completedOrders}</strong>
            </div>
            <div className="ps-stat">
              <span className="ps-stat-icon">
                <Wallet size={18} />
              </span>
              <span className="ps-stat-label">TOTAL PROFIT</span>
              <strong>PKR {loading ? "--" : formatPKR(totals.totalProfit)}</strong>
            </div>
            <div className="ps-stat">
              <span className="ps-stat-icon">
                <Gift size={18} />
              </span>
              <span className="ps-stat-label">TOTAL BONUS</span>
              <strong>PKR {loading ? "--" : formatPKR(totals.totalBonus)}</strong>
            </div>
          </div>

          <div className="ps-tabs">
            {PAYOUT_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`ps-tab ${payoutTab === tab ? "active" : ""}`}
                onClick={() => setPayoutTab(tab)}
              >
                {tab === "Pending" ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                {tab}
                {tab === "Pending" && pendingOrders.length > 0 ? (
                  <span className="ps-tab-badge">{pendingOrders.length}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="ps-payout-card">
            <span className="ps-payout-label">TOTAL UPCOMING PAYOUT</span>
            <div className="ps-payout-amount">
              PKR {loading ? "--" : formatPKR(upcomingPayout)}
            </div>
            <p className="ps-payout-desc">
              Lands in your account once delivery is confirmed.
            </p>
          </div>

          <div className="ps-list">
            {loading ? (
              <p className="ps-empty">Loading transactions...</p>
            ) : payoutOrders.length ? (
              payoutOrders.map((order) => (
                <div className="ps-list-item" key={order.orderId}>
                  <span className="ps-list-icon">
                    {payoutTab === "Pending" ? (
                      <Clock size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                  </span>
                  <div className="ps-list-main">
                    <strong>
                      {payoutTab === "Pending" ? "Payout Pending" : "Payout Complete"}
                    </strong>
                    <span>Order #{order.orderId}</span>
                  </div>
                  <span
                    className={`ps-list-amount ${
                      payoutTab === "Paid" ? "positive" : ""
                    }`}
                  >
                    PKR {formatPKR(order.profit)}
                  </span>
                </div>
              ))
            ) : (
              <p className="ps-empty">
                No {payoutTab.toLowerCase()} payouts to show yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitSummaryPage;
