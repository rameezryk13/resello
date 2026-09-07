import { Mail } from "lucide-react";
import { formatRupees, parsePrice } from "@/utils/currency";
import { DELIVERY_PARTNER, SHIPPING_CHARGE } from "../../constants";
import "./OrderSummaryCard.css";

// Two shapes behind one card, kept together because they share the container,
// the heading slot and the empty state:
//   variant="default" - itemised list plus totals plus the Buy/Pay button
//   variant="payment" - just the total and an order-details table
const OrderSummaryCard = ({
  variant = "default",
  cartItems,
  orderId,
  subtotal,
  profitTotal,
  tax,
  total,
  getItemProfitTotal,
  orderPaymentType,
  submitting,
  selectedAddressId,
  deactivated = false,
  wallet,
  onPrimaryAction,
}) => {
  const isPayment = variant === "payment";

  return (
    <section className={`checkout-summary-card ${isPayment ? "payment-summary" : ""}`}>
      <div className="section-title">{isPayment ? "Summary" : "Order Summary"}</div>
      {cartItems.length === 0 && !orderId ? (
        <p className="empty-state">Your cart is empty. Add items from the cart page first.</p>
      ) : (
        <>
          {isPayment ? (
            <div className="payment-total-block">
              <span>Total Amount</span>
              <strong>{formatRupees(total)}</strong>
            </div>
          ) : (
            <div className="summary-items">
              {cartItems.map((item) => {
                const price = parsePrice(item.product?.price);
                const itemProfitTotal = getItemProfitTotal(item);
                return (
                  <div key={item.itemId} className="summary-item-row">
                    <div>
                      <strong>{item.product?.name}</strong>
                      <div className="summary-item-meta">
                        <span>{item.quantity}x {formatRupees(price)}</span>
                        <span>Profit {formatRupees(itemProfitTotal)}</span>
                        <span>{item.product?.category || "No category"}</span>
                      </div>
                    </div>
                    <div>{formatRupees(price * item.quantity + itemProfitTotal)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {isPayment ? (
            <div className="payment-summary-table">
              <div className="payment-summary-row">
                <span>Date</span>
                <strong>{new Date().toISOString().slice(0, 10)}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Order no.</span>
                <strong>{orderId || "6903292"}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Store Name</span>
                <strong>Resello Technologies</strong>
              </div>
              <div className="payment-summary-row">
                <span>Courier</span>
                <strong>{DELIVERY_PARTNER.name}</strong>
              </div>
            </div>
          ) : (
            <>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupees(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Profit Apply</span>
                <span>{formatRupees(profitTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatRupees(SHIPPING_CHARGE)}</span>
              </div>
              {orderPaymentType === "cod" ? (
                <div className="summary-row">
                  <span>COD Tax</span>
                  <span>{formatRupees(tax)}</span>
                </div>
              ) : null}
              <div className="summary-total-row">
                <span>Total</span>
                <span>{formatRupees(total)}</span>
              </div>
              {/* A deactivated account is refused by the backend anyway. Stopping
                  the button here means the reason is visible before the click
                  rather than after it. */}
              <div
                className="buy-now-btn-container"
                onClick={() => {
                  if (deactivated) {
                    onPrimaryAction?.();
                  }
                }}
              >
                <button
                  type="button"
                  className={`buy-now-btn ${deactivated ? "disabled-deactivated" : ""}`}
                  onClick={onPrimaryAction}
                  disabled={
                    submitting || deactivated || cartItems.length === 0 || !selectedAddressId
                  }
                >
                  {deactivated
                    ? "Account deactivated"
                    : submitting
                      ? "Processing..."
                      : orderPaymentType === "cod"
                        ? "Buy Now"
                        : "Pay Now"}
                </button>
              </div>
              {deactivated ? (
                <div className="account-disabled-badge-msg" role="status">
                  <span className="account-disabled-badge-icon">⚠️</span>
                  <div className="account-disabled-badge-body">
                    <strong>Account Disabled (5 Return Penalties)</strong>
                    <p className="account-disabled-badge-desc">
                      Your account is disabled from placing orders due to 5 return penalties.
                    </p>
                    <div className="account-disabled-admin-contact">
                      <span>Contact Admin:</span>{" "}
                      <a
                        href={`mailto:${wallet?.support?.email || "support@resello.pk"}`}
                        className="account-disabled-email-link"
                      >
                        <Mail size={13} aria-hidden="true" />
                        {wallet?.support?.email || "support@resello.pk"}
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
};

export default OrderSummaryCard;
