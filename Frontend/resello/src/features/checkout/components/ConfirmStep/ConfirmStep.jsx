import { Check, Store } from "lucide-react";
import { formatRupees } from "@/utils/currency";
import "./ConfirmStep.css";

// Terminal step. The orders already exist on the server by the time this
// renders, so there is nothing to submit here - only the receipt and a way out.
// A cart spanning several suppliers becomes one order per supplier, so the
// receipt lists every order rather than a single id.

const ConfirmStep = ({ orderId, placedOrders = [], selectedAddress, onViewOrders }) => {
  const orders = placedOrders.length
    ? placedOrders
    : orderId
      ? [{ orderId }]
      : [];
  const isSplit = orders.length > 1;

  return (
    <div className="confirm-card">
      <div className="confirm-icon">
        <Check size={34} aria-hidden="true" />
      </div>
      <h2>{isSplit ? `${orders.length} orders confirmed` : "Order confirmed"}</h2>
      <p>
        {isSplit
          ? "Your items come from different suppliers, so each supplier ships its own order. You can track them separately in My Orders."
          : "Your order has been placed successfully."}
      </p>

      {orders.length > 0 ? (
        <ul className="confirm-order-list">
          {orders.map((order) => (
            <li key={order.orderId} className="confirm-order-row">
              <div className="confirm-order-main">
                <strong>Order ID: {order.orderId}</strong>
                {order.shopName ? (
                  <span className="confirm-order-shop">
                    <Store size={14} aria-hidden="true" />
                    {order.shopName}
                  </span>
                ) : null}
              </div>
              {order.totalAmount !== undefined ? (
                <span className="confirm-order-total">{formatRupees(order.totalAmount)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {selectedAddress ? (
        <div className="confirm-address">
          <span>Shipping to</span>
          <strong>{selectedAddress.name}</strong>
          <p>
            {selectedAddress.line1}, {selectedAddress.city}
          </p>
        </div>
      ) : null}
      <button type="button" className="btn-primary" onClick={onViewOrders}>
        View Orders
      </button>
    </div>
  );
};

export default ConfirmStep;
