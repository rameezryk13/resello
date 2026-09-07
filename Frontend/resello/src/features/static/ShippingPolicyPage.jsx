import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  LogIn,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { get, put } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header";
import AccountHero from "@/components/sections/AccountHero";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/features/wallet/useWallet";
import ReturnProductModal from "./components/ReturnProductModal";
import EligibleOrdersPortal from "./components/EligibleOrdersPortal";
import ReturnClaimsView from "./components/ReturnClaimsView";
import SettlementOverview from "./components/SettlementOverview";
import SettlementOrdersList from "./components/SettlementOrdersList";
import ShippingTimelinePolicy from "./components/ShippingTimelinePolicy";
import "./ShippingPolicyPage.css";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const getDaysRemaining = (order) => {
  const deliveryTime = new Date(order.deliveredAt || order.createdAt).getTime();
  if (Number.isNaN(deliveryTime)) return 7;
  const elapsedMs = Math.max(0, Date.now() - deliveryTime);
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, 7 - elapsedDays);
};

const isDeliveredInLast7Days = (order) => {
  const status = String(order.status || "").toLowerCase();
  const isDelivered = status === "delivered" || status === "completed";
  if (!isDelivered) return false;

  const deliveryTime = new Date(order.deliveredAt || order.createdAt).getTime();
  if (Number.isNaN(deliveryTime)) return true;

  return Date.now() - deliveryTime <= SEVEN_DAYS_MS;
};

// Compute single settlement status & amounts per order
const computeOrderSettlement = (order, walletTransactions = []) => {
  const orderAmount = Number(order.totalAmount) || 0;
  const profit = Number(order.profit) || 0;
  const status = String(order.status || "").toLowerCase();
  const req = order.returnRequest;

  let clearedRefund = 0;
  let clearedCommission = 0;
  let isReversedInWallet = false;

  if (Array.isArray(walletTransactions)) {
    walletTransactions.forEach((tx) => {
      const matchOrder = tx.orderId === order.orderId || tx.referenceId === order.orderId;
      if (matchOrder) {
        const type = String(tx.type || "").toLowerCase();
        if (type.includes("refund") && tx.amount > 0) {
          clearedRefund += Number(tx.amount) || 0;
        }
        if (type.includes("commission") && tx.amount > 0) {
          clearedCommission += Number(tx.amount) || 0;
        }
        if (type.includes("reverse") || type.includes("penalty")) {
          isReversedInWallet = true;
        }
      }
    });
  }

  let settlementState = "Pending"; // "Pending" | "Cleared" | "Declined"
  let pendingReturnClaim = 0;
  let pendingProfit = 0;

  if (req) {
    const rStatus = String(req.status || "").toLowerCase();
    if (rStatus === "accepted" || rStatus === "approved") {
      settlementState = "Cleared";
      if (clearedRefund === 0) {
        clearedRefund = Math.max(0, orderAmount - profit);
      }
      if (clearedCommission === 0 && !isReversedInWallet) {
        clearedCommission = profit;
      }
    } else if (rStatus === "rejected" || rStatus === "declined") {
      settlementState = "Declined";
      clearedRefund = 0;
      clearedCommission = 0;
    } else {
      settlementState = "Pending";
      pendingReturnClaim = Math.max(0, orderAmount - profit);
      pendingProfit = profit;
    }
  } else if (status === "delivered" || status === "completed" || status === "cleared") {
    settlementState = "Cleared";
    clearedCommission = profit;
  } else if (status === "returned" || status === "cancelled") {
    settlementState = "Cleared";
  } else {
    settlementState = "Pending";
    pendingProfit = profit;
  }

  const effectiveClearedRefund = Math.max(0, orderAmount - profit);
  const clearedTotal =
    settlementState === "Cleared"
      ? (req ? effectiveClearedRefund : 0) + (clearedCommission || 0)
      : 0;
  const pendingTotal =
    settlementState === "Pending" ? pendingReturnClaim + pendingProfit : 0;

  return {
    settlementState,
    effectiveClearedRefund: req && settlementState === "Cleared" ? effectiveClearedRefund : 0,
    clearedCommission: settlementState === "Cleared" ? clearedCommission : 0,
    clearedTotal,
    pendingReturnClaim,
    pendingProfit,
    pendingTotal,
  };
};

const ShippingPolicyPage = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { wallet, reload: reloadWallet } = useWallet();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("eligible"); // "eligible" | "returned" | "settlement"
  const [historySectionFilter, setHistorySectionFilter] = useState("all"); // "all" | "in_progress" | "accepted" | "rejected"
  const [settlementFilter, setSettlementFilter] = useState("all"); // "all" | "pending" | "cleared"
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [updatingReturnId, setUpdatingReturnId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await get(endpoints.orders);
        if (!ignore && data?.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.message || "Failed to load orders for return portal.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, toast]);

  const eligibleOrders = useMemo(() => {
    return orders.filter(
      (order) => !order.returnRequest && isDeliveredInLast7Days(order)
    );
  }, [orders]);

  const returnedOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        Boolean(order.returnRequest) ||
        String(order.status || "").toLowerCase() === "returned"
    );
  }, [orders]);

  const inProgressReturns = useMemo(() => {
    return returnedOrders.filter((order) => {
      const status = String(order.returnRequest?.status || "").toLowerCase();
      return status === "in progress" || status === "under review" || status === "pending";
    });
  }, [returnedOrders]);

  const acceptedReturns = useMemo(() => {
    return returnedOrders.filter((order) => {
      const status = String(order.returnRequest?.status || "").toLowerCase();
      return status === "accepted" || status === "approved";
    });
  }, [returnedOrders]);

  const rejectedReturns = useMemo(() => {
    return returnedOrders.filter((order) => {
      const status = String(order.returnRequest?.status || "").toLowerCase();
      return status === "rejected" || status === "declined";
    });
  }, [returnedOrders]);

  const ordersWithSettlement = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      settlement: computeOrderSettlement(order, wallet.transactions || []),
    }));
  }, [orders, wallet.transactions]);

  const allSettledOrders = useMemo(() => {
    return ordersWithSettlement.filter(
      (o) =>
        o.returnRequest ||
        ["delivered", "completed", "cleared", "returned", "shipped"].includes(
          String(o.status || "").toLowerCase()
        )
    );
  }, [ordersWithSettlement]);

  const clearedSettledOrders = useMemo(() => {
    return allSettledOrders.filter((o) => o.settlement.settlementState === "Cleared");
  }, [allSettledOrders]);

  const pendingSettledOrders = useMemo(() => {
    return allSettledOrders.filter((o) => o.settlement.settlementState === "Pending");
  }, [allSettledOrders]);

  const totalAdminCleared = useMemo(() => {
    return ordersWithSettlement.reduce((sum, o) => sum + (o.settlement.clearedTotal || 0), 0);
  }, [ordersWithSettlement]);

  const totalAdminPending = useMemo(() => {
    return ordersWithSettlement.reduce((sum, o) => sum + (o.settlement.pendingTotal || 0), 0);
  }, [ordersWithSettlement]);

  const displayedSettlementOrders = useMemo(() => {
    if (settlementFilter === "pending") return pendingSettledOrders;
    if (settlementFilter === "cleared") return clearedSettledOrders;
    return allSettledOrders;
  }, [settlementFilter, pendingSettledOrders, clearedSettledOrders, allSettledOrders]);

  const selectedOrder = useMemo(() => {
    return eligibleOrders.find((o) => o.orderId === selectedOrderId) || null;
  }, [eligibleOrders, selectedOrderId]);

  const handleReturnSuccess = (data) => {
    if (data?.order) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === data.order.orderId ? { ...o, ...data.order } : o))
      );
      reloadWallet();
    }
    setSelectedOrderId(null);
    setActiveTab("returned");
    setHistorySectionFilter("all");
  };

  const handleUpdateReturnStatus = async (orderId, returnStatus, mistakeType, resolutionNote) => {
    setUpdatingReturnId(orderId);
    try {
      const res = await put(endpoints.returnOrderStatus(orderId), {
        returnStatus,
        mistakeType,
        resolutionNote,
      });
      if (res?.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...res.order } : o))
        );
        reloadWallet();
      }
      toast.success(
        `Order #${orderId} return updated to ${returnStatus}${mistakeType ? ` (${mistakeType})` : ""}.`
      );
    } catch (err) {
      toast.error(err?.message || "Failed to update return decision.");
    } finally {
      setUpdatingReturnId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header />
      <AccountHero
        title="Shipping &amp; Return Policy"
        subtitle="Transparent logistics across Pakistan with a 7-day defective product return &amp; replacement guarantee."
      />

      <main className="container static-page-container">
        {/* 7-DAY DELIVERED ORDERS RETURN PORTAL */}
        <section className="return-portal-section">
          <div className="return-portal-header">
            <div className="return-portal-title-block">
              <div className="return-portal-badge">
                <ShieldCheck size={18} /> 7-Day Protection Guarantee
              </div>
              <h2 className="return-portal-title">Return Defective Product</h2>
              <p className="return-portal-sub">
                Select an order delivered in the last 7 days, attach video or photo proof of the
                defect, and submit for instant pickup &amp; replacement.
              </p>
            </div>

            {isAuthenticated && (
              <div className="return-tabs-nav">
                <button
                  type="button"
                  className={`return-tab-pill ${activeTab === "eligible" ? "active" : ""}`}
                  onClick={() => setActiveTab("eligible")}
                >
                  <PackageCheck size={16} /> Eligible Delivered Orders
                  <span className="return-count-badge">{eligibleOrders.length}</span>
                </button>
                <button
                  type="button"
                  className={`return-tab-pill ${activeTab === "returned" ? "active" : ""}`}
                  onClick={() => setActiveTab("returned")}
                >
                  <RotateCcw size={16} /> Return Requests &amp; History
                  <span className="return-count-badge">{returnedOrders.length}</span>
                </button>
                <button
                  type="button"
                  className={`return-tab-pill settlement ${activeTab === "settlement" ? "active" : ""}`}
                  onClick={() => setActiveTab("settlement")}
                >
                  <BadgePercent size={16} /> Admin Settlements &amp; Clearance
                  <span className="return-count-badge settlement-pill-badge">{allSettledOrders.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Authenticated State */}
          {isAuthenticated ? (
            <div className="return-portal-content">
              {loading ? (
                <EmptyState variant="loading" title="Checking delivered orders..." />
              ) : activeTab === "eligible" ? (
                <EligibleOrdersPortal
                  eligibleOrders={eligibleOrders}
                  selectedOrderId={selectedOrderId}
                  setSelectedOrderId={setSelectedOrderId}
                  selectedOrder={selectedOrder}
                  setReturnModalOrder={setReturnModalOrder}
                  getDaysRemaining={getDaysRemaining}
                />
              ) : activeTab === "returned" ? (
                <ReturnClaimsView
                  historySectionFilter={historySectionFilter}
                  setHistorySectionFilter={setHistorySectionFilter}
                  returnedOrders={returnedOrders}
                  inProgressReturns={inProgressReturns}
                  acceptedReturns={acceptedReturns}
                  rejectedReturns={rejectedReturns}
                  updatingReturnId={updatingReturnId}
                  onUpdateReturnStatus={handleUpdateReturnStatus}
                  computeOrderSettlement={computeOrderSettlement}
                  wallet={wallet}
                />
              ) : (
                <div className="admin-settlement-view">
                  <SettlementOverview
                    totalAdminCleared={totalAdminCleared}
                    totalAdminPending={totalAdminPending}
                    wallet={wallet}
                    clearedOrdersCount={clearedSettledOrders.length}
                    pendingOrdersCount={pendingSettledOrders.length}
                  />

                  <SettlementOrdersList
                    displayedSettlementOrders={displayedSettlementOrders}
                    settlementFilter={settlementFilter}
                    setSettlementFilter={setSettlementFilter}
                    allSettledOrdersCount={allSettledOrders.length}
                    pendingSettledOrdersCount={pendingSettledOrders.length}
                    clearedSettledOrdersCount={clearedSettledOrders.length}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="return-guest-box">
              <div className="return-guest-icon">
                <LogIn size={28} className="text-primary" />
              </div>
              <h3>Sign In to Return Delivered Orders</h3>
              <p>
                Log in with your reseller account to inspect all orders delivered in the last 7 days
                and submit return requests with defect photo/video attachments.
              </p>
              <Link to="/auth" className="btn-primary return-login-btn">
                <LogIn size={16} /> Sign In to Your Account
              </Link>
            </div>
          )}
        </section>

        {/* POLICY DETAILS & CARDS */}
        <ShippingTimelinePolicy />
      </main>

      {/* Return Request Modal */}
      <ReturnProductModal
        open={Boolean(returnModalOrder)}
        order={returnModalOrder}
        onClose={() => setReturnModalOrder(null)}
        onSubmitSuccess={handleReturnSuccess}
      />
    </div>
  );
};

export default ShippingPolicyPage;
