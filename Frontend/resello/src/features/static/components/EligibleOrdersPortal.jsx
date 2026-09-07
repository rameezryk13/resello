import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  PackageCheck,
  RotateCcw,
  Store,
} from "lucide-react";
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

const EligibleOrdersPortal = ({
  eligibleOrders = [],
  selectedOrderId,
  setSelectedOrderId,
  selectedOrder,
  setReturnModalOrder,
  getDaysRemaining,
}) => {
  if (eligibleOrders.length === 0) {
    return (
      <div className="return-empty-box">
        <PackageCheck size={48} className="text-primary" />
        <h3>No Orders Delivered in the Last 7 Days</h3>
        <p>
          Only orders delivered within the 7-day return window will appear here. When you
          receive an order and mark it as delivered, you can return it anytime within 7
          days.
        </p>
        <Link to="/orders" className="btn-outline return-link-btn">
          View All My Orders <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="return-orders-view">
      <div className="return-orders-grid">
        {eligibleOrders.map((order) => {
          const isSelected = selectedOrderId === order.orderId;
          const daysLeft = getDaysRemaining(order);
          const items = Array.isArray(order.cart) ? order.cart : [];

          return (
            <article
              key={order.orderId}
              className={`return-order-card ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedOrderId(order.orderId)}
            >
              <div className="return-order-card-header">
                <div className="return-order-select-indicator">
                  <span className={`radio-dot ${isSelected ? "checked" : ""}`} />
                  <div>
                    <strong className="return-order-id">#{order.orderId}</strong>
                    <span className="return-order-date">
                      Delivered {formatDate(order.deliveredAt || order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="return-days-pill">
                  <Clock size={13} />
                  <span>
                    {daysLeft > 0 ? `${daysLeft} days left to return` : "Last day to return"}
                  </span>
                </div>
              </div>

              {order.shopName && (
                <div className="return-order-supplier">
                  <Store size={14} />
                  <span>
                    Supplier: <strong>{order.shopName}</strong>
                  </span>
                </div>
              )}

              {/* Product list preview */}
              <div className="return-order-items-list">
                {items.map((item, idx) => (
                  <div key={item.itemId || idx} className="return-item-row">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="return-item-thumb"
                      />
                    ) : (
                      <div className="return-item-placeholder">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div className="return-item-details">
                      <span className="return-item-name">{item.product?.name}</span>
                      <span className="return-item-meta">
                        Qty: {item.quantity} • {formatRupees(item.product?.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="return-order-footer">
                <div className="return-order-total">
                  <span>Total Paid:</span>
                  <strong>{formatRupees(order.totalAmount)}</strong>
                </div>

                <button
                  type="button"
                  className="btn-primary return-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrderId(order.orderId);
                    setReturnModalOrder(order);
                  }}
                >
                  <RotateCcw size={15} /> Return Product
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Action Bar for Selected Order */}
      {selectedOrder && (
        <div className="return-selected-floating-bar animate-fade-in">
          <div className="return-selected-info">
            <CheckCircle2 size={20} className="text-success" />
            <div>
              <strong>Order #{selectedOrder.orderId} Selected</strong>
              <span>
                {selectedOrder.cart?.length || 1} product(s) • Total{" "}
                {formatRupees(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary return-floating-btn"
            onClick={() => setReturnModalOrder(selectedOrder)}
          >
            <RotateCcw size={16} /> Continue Return with Defect Proof
          </button>
        </div>
      )}
    </div>
  );
};

export default EligibleOrdersPortal;
