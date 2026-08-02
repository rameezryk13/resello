import { Check } from "lucide-react";
import "./ConfirmStep.css";

// Terminal step. The order already exists on the server by the time this
// renders, so there is nothing to submit here - only the receipt and a way out.

const ConfirmStep = ({ orderId, selectedAddress, onViewOrders }) => (
  <div className="confirm-card">
    <div className="confirm-icon">
      <Check size={34} aria-hidden="true" />
    </div>
    <h2>Order confirmed</h2>
    <p>Your order has been placed successfully.</p>
    {orderId ? <strong>Order ID: {orderId}</strong> : null}
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

export default ConfirmStep;
