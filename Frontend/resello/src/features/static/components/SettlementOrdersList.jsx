import { ArrowRight, CheckCircle2, Clock, PackageCheck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRupees } from "@/utils/currency";

const formatDate = (value) => {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SettlementOrdersList = ({
  displayedSettlementOrders = [],
  settlementFilter,
  setSettlementFilter,
  allSettledOrdersCount,
  pendingSettledOrdersCount,
  clearedSettledOrdersCount,
}) => {
  return (
    <>
      {/* Filter Subnav for Settlements */}
      <div className="settlement-filter-bar">
        <div className="settlement-filter-pills">
          <button
            type="button"
            className={`settlement-pill ${settlementFilter === "all" ? "active" : ""}`}
            onClick={() => setSettlementFilter("all")}
          >
            All Monitored Orders ({allSettledOrdersCount})
          </button>
          <button
            type="button"
            className={`settlement-pill pending ${settlementFilter === "pending" ? "active" : ""}`}
            onClick={() => setSettlementFilter("pending")}
          >
            <Clock size={14} /> Pending from Admin ({pendingSettledOrdersCount})
          </button>
          <button
            type="button"
            className={`settlement-pill cleared ${settlementFilter === "cleared" ? "active" : ""}`}
            onClick={() => setSettlementFilter("cleared")}
          >
            <CheckCircle2 size={14} /> Cleared by Admin ({clearedSettledOrdersCount})
          </button>
        </div>
      </div>

      {/* Settlement Orders List */}
      {displayedSettlementOrders.length > 0 ? (
        <div className="settlement-orders-list">
          {displayedSettlementOrders.map((order) => {
            const s = order.settlement;
            const hasItems = Array.isArray(order.items) && order.items.length > 0;
            const itemsList = hasItems
              ? order.items.map((it) => `${it.name || it.title} (x${it.quantity || 1})`).join(", ")
              : order.productName || "Product Order";

            return (
              <article
                key={order.orderId}
                className={`settlement-order-card ${s.settlementState.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="settlement-order-header">
                  <div className="order-main-meta">
                    <div className="order-id-badge">
                      <strong>Order #{order.orderId}</strong>
                      <span
                        className={`settlement-state-badge ${s.settlementState.toLowerCase()}`}
                      >
                        {s.settlementState === "Cleared" && <CheckCircle2 size={12} />}
                        {s.settlementState === "Pending" && <Clock size={12} />}
                        {s.settlementState === "Declined" && <XCircle size={12} />}
                        {s.settlementState}
                      </span>
                    </div>
                    <span className="order-sub-meta">
                      Placed on {formatDate(order.createdAt)} · Order Status:{" "}
                      <strong>{order.status}</strong>
                      {order.returnRequest && (
                        <span>
                          {" "}
                          · Return: <em>{order.returnRequest.status} ({order.returnRequest.mistakeType || "Vendor Mistake"})</em>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="order-total-badge">
                    <span className="label">Order Total:</span>
                    <strong className="val">{formatRupees(order.totalAmount)}</strong>
                  </div>
                </div>

                {/* SINGLE RELEVANT SETTLEMENT PILLAR (PENDING OR CLEARED) */}
                <div className="settlement-single-pillar-wrap">
                  {s.settlementState === "Cleared" || (s.clearedTotal > 0 && s.pendingTotal === 0) ? (
                    /* Cleared by Admin */
                    <div className="settlement-pillar cleared has-amount">
                      <div className="pillar-header">
                        <div className="pillar-title-row">
                          <CheckCircle2 size={16} className="text-success" />
                          <span className="pillar-title">Cleared by Admin Side</span>
                        </div>
                        <span className="pillar-badge cleared">Credited to Wallet</span>
                      </div>

                      <div className="pillar-amount cleared">
                        {formatRupees(s.clearedTotal)}
                      </div>

                      <div className="pillar-breakdown">
                        {s.effectiveClearedRefund > 0 && (
                          <div className="breakdown-item">
                            <span className="dot cleared" />
                            <span className="item-label">
                              Return Refund (Order amount without reseller commission):
                            </span>
                            <strong className="item-val">
                              {formatRupees(s.effectiveClearedRefund)}
                            </strong>
                          </div>
                        )}
                        {s.clearedCommission > 0 && (
                          <div className="breakdown-item">
                            <span className="dot cleared" />
                            <span className="item-label">Reseller Profit (Retained - Not Reversed):</span>
                            <strong className="item-val">
                              {formatRupees(s.clearedCommission)}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : s.settlementState === "Declined" ? (
                    /* Declined by Admin */
                    <div className="settlement-pillar rejected has-amount">
                      <div className="pillar-header">
                        <div className="pillar-title-row">
                          <XCircle size={16} className="text-danger" />
                          <span className="pillar-title">Declined by Admin Side</span>
                        </div>
                        <span className="pillar-badge rejected">No Amount Credited</span>
                      </div>

                      <div className="pillar-amount rejected">Rs. 0</div>

                      <div className="pillar-breakdown">
                        <span className="empty-pillar-note text-danger">
                          Return request was declined after inspection.
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Pending from Admin */
                    <div className="settlement-pillar pending has-amount">
                      <div className="pillar-header">
                        <div className="pillar-title-row">
                          <Clock size={16} className="text-warning" />
                          <span className="pillar-title">Pending from Admin Side</span>
                        </div>
                        <span className="pillar-badge pending">Awaiting Clearance</span>
                      </div>

                      <div className="pillar-amount pending">
                        {formatRupees(s.pendingTotal)}
                      </div>

                      <div className="pillar-breakdown">
                        {s.pendingReturnClaim > 0 && (
                          <div className="breakdown-item">
                            <span className="dot pending" />
                            <span className="item-label">
                              Return Refund Pending (Order amount without reseller commission):
                            </span>
                            <strong className="item-val">
                              {formatRupees(s.pendingReturnClaim)}
                            </strong>
                          </div>
                        )}
                        {s.pendingProfit > 0 && (
                          <div className="breakdown-item">
                            <span className="dot pending" />
                            <span className="item-label">
                              Reseller Margin (Pending Clearance):
                            </span>
                            <strong className="item-val">
                              {formatRupees(s.pendingProfit)}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items & Link Footer */}
                <div className="settlement-order-footer">
                  <div className="order-items-snippet">
                    <span className="snippet-label">Order Items:</span>
                    <span className="snippet-value">{itemsList}</span>
                  </div>
                  <div className="order-links-row">
                    <Link to="/track-order" className="settlement-track-btn">
                      Track Order <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="return-empty-box">
          <PackageCheck size={48} className="text-muted" />
          <h3>No Settlement Orders Found</h3>
          <p>No orders match the selected admin settlement filter.</p>
        </div>
      )}
    </>
  );
};

export default SettlementOrdersList;
