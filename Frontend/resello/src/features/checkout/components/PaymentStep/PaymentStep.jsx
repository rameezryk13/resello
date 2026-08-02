import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { isValidCnic, isValidPakistanIban } from "@/utils/validation";
import { BANKS, PAYMENT_METHODS } from "../../constants";
import OrderSummaryCard from "../OrderSummaryCard/OrderSummaryCard";
import "./PaymentStep.css";

// The advance-payment step, styled after the PayFast hosted checkout: order
// summary on the left, method picker and bank fields on the right. Only the
// bank method has real fields today; card and wallet reuse the same three
// inputs, which is why the heading is the only thing that switches.

const PAYMENT_TITLES = {
  bank: "Pay With Bank Account",
  wallet: "Pay With Mobile Wallet",
  card: "Pay With Card",
};

const PaymentStep = ({
  cartItems,
  orderId,
  total,
  paymentMethod,
  setPaymentMethod,
  paymentDetails,
  onPaymentChange,
  onPaymentSubmit,
  onBack,
  submitting,
}) => (
  <div className="payment-layout">
    <div className="payment-summary-shell">
      <button type="button" className="payment-back-btn" onClick={onBack}>
        <ArrowLeft size={28} aria-hidden="true" />
      </button>
      <div className="payfast-mark">
        <span>Premier</span>
        <strong>PayFast</strong>
      </div>
      <OrderSummaryCard
        variant="payment"
        cartItems={cartItems}
        orderId={orderId}
        total={total}
      />
    </div>

    <section className="payment-form-card">
      <div className="secure-server">
        <ShieldCheck size={34} aria-hidden="true" />
        <Lock size={24} aria-hidden="true" />
        <span>Secure server</span>
      </div>

      <h2>{PAYMENT_TITLES[paymentMethod] || PAYMENT_TITLES.card}</h2>
      <div className="payment-methods" role="group" aria-label="Payment method">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              className={`payment-method-card ${paymentMethod === method.id ? "active" : ""}`}
              onClick={() => setPaymentMethod(method.id)}
            >
              <Icon size={35} aria-hidden="true" />
              <span>{method.label}</span>
            </button>
          );
        })}
      </div>

      <div className="payment-fields">
        <label>
          Bank
          <select
            value={paymentDetails.bank}
            onChange={(e) => onPaymentChange("bank", e.target.value)}
          >
            <option value="">Select Bank</option>
            {BANKS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </label>
        <label>
          Account Number/IBAN
          <input
            type="text"
            inputMode="text"
            placeholder="PK36 HABB 0000 0000 0000 0000"
            maxLength="29"
            className={
              paymentDetails.accountNumber && !isValidPakistanIban(paymentDetails.accountNumber)
                ? "input-error"
                : ""
            }
            value={paymentDetails.accountNumber}
            onChange={(e) => onPaymentChange("accountNumber", e.target.value)}
          />
          <small>Use Pakistani IBAN format: PK + 2 digits + 4 bank letters + 16 characters</small>
        </label>
        <label>
          CNIC
          <input
            type="text"
            inputMode="numeric"
            placeholder="XXXXX-XXXXXXX-X"
            maxLength="15"
            className={paymentDetails.cnic && !isValidCnic(paymentDetails.cnic) ? "input-error" : ""}
            value={paymentDetails.cnic}
            onChange={(e) => onPaymentChange("cnic", e.target.value)}
          />
          <small>Enter your 13-Digit CNIC Number</small>
        </label>
        <button
          type="button"
          className="payment-pay-btn"
          onClick={onPaymentSubmit}
          disabled={submitting || cartItems.length === 0}
        >
          {submitting ? "Processing..." : "Pay"}
        </button>
      </div>
    </section>
  </div>
);

export default PaymentStep;
