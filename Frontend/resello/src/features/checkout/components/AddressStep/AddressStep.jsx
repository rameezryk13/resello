import { BadgeCheck, Check, CreditCard, Truck, WalletCards } from "lucide-react";
import { formatRupees } from "@/utils/currency";
import { ADVANCE_PAYMENT_BENEFITS, DELIVERY_PARTNER } from "../../constants";
import "./AddressStep.css";

// The first checkout step: pick an address (or add one), see the delivery
// partner, and choose COD vs advance payment. The Buy/Pay button itself lives
// in the order summary beside this column, not here.

const AddressStep = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  showAddressForm,
  setShowAddressForm,
  newAddress,
  onNewAddressChange,
  onSubmitNewAddress,
  submitting,
  orderPaymentType,
  setOrderPaymentType,
  codTax,
}) => (
  <div className="checkout-left-column">
    <section className="checkout-address-card">
      <div className="section-title">Shipping Address</div>
      <button
        type="button"
        className="add-address-btn"
        onClick={() => setShowAddressForm((prev) => !prev)}
      >
        {showAddressForm ? "Cancel" : "Add new address"}
      </button>
      {showAddressForm ? (
        <div className="new-address-form">
          <label>
            Name*
            <input
              type="text"
              value={newAddress.name}
              onChange={(e) => onNewAddressChange("name", e.target.value)}
            />
          </label>
          <label>
            Street Address / House No.*
            <input
              type="text"
              placeholder="House/Plot no., Street name"
              value={newAddress.line1}
              onChange={(e) => onNewAddressChange("line1", e.target.value)}
            />
          </label>
          <label>
            Area / Sector*
            <input
              type="text"
              placeholder="e.g. Sector F-7, Gulberg III, DHA Phase 5"
              value={newAddress.area || ""}
              onChange={(e) => onNewAddressChange("area", e.target.value)}
            />
          </label>
          <label>
            Town*
            <input
              type="text"
              placeholder="e.g. Model Town, Saddar, Cantt"
              value={newAddress.town || ""}
              onChange={(e) => onNewAddressChange("town", e.target.value)}
            />
          </label>
          <label>
            City*
            <input
              type="text"
              placeholder="e.g. Lahore, Karachi, Islamabad"
              value={newAddress.city}
              onChange={(e) => onNewAddressChange("city", e.target.value)}
            />
          </label>
          <label>
            Phone Number*
            <input
              type="tel"
              value={newAddress.phone}
              onChange={(e) => onNewAddressChange("phone", e.target.value)}
            />
          </label>
          <label>
            Second Phone Number (optional)
            <input
              type="tel"
              value={newAddress.phone2}
              onChange={(e) => onNewAddressChange("phone2", e.target.value)}
            />
          </label>
          <button
            type="button"
            className="add-address-submit-btn"
            onClick={onSubmitNewAddress}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Address"}
          </button>
        </div>
      ) : null}
      {addresses.length === 0 ? (
        <p className="empty-state">No saved addresses found.</p>
      ) : (
        <div className="address-list">
          {addresses.map((address) => (
            <button
              key={address.id}
              type="button"
              className={`address-card ${selectedAddressId === address.id ? "selected" : ""}`}
              onClick={() => onAddressSelect(address.id)}
            >
              <div className="address-meta">
                <strong>{address.name}</strong>
                <span>{address.line1}</span>
                {address.area && <span>Area: {address.area}</span>}
                {address.town && <span>Town: {address.town}</span>}
                {!address.area && !address.town && address.line2 && <span>{address.line2}</span>}
                <span>{address.city}</span>
                <span>
                  Phone: {address.phone}
                  {address.phone2 ? `, ${address.phone2}` : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>

    <section className="checkout-delivery-card">
      <div className="section-title">Delivery Partner</div>
      <div className="delivery-partner-option selected">
        <div className="delivery-partner-icon">
          <Truck size={22} aria-hidden="true" />
        </div>
        <div className="delivery-partner-meta">
          <strong>{DELIVERY_PARTNER.name}</strong>
          <span>{DELIVERY_PARTNER.description}</span>
        </div>
        <Check size={18} className="delivery-partner-check" aria-hidden="true" />
      </div>
      <p className="delivery-partner-note">
        {DELIVERY_PARTNER.name} is currently our only delivery partner, and is selected automatically for every order.
      </p>
    </section>

    <section className="checkout-payment-option-card">
      <div className="section-title">Payment Option</div>
      <div className="payment-option-choices" role="group" aria-label="Payment option">
        <button
          type="button"
          className={`payment-option-choice ${orderPaymentType === "cod" ? "selected" : ""}`}
          onClick={() => setOrderPaymentType("cod")}
        >
          <div className="payment-option-icon">
            <WalletCards size={20} aria-hidden="true" />
          </div>
          <div className="payment-option-meta">
            <strong>Cash on Delivery (COD)</strong>
            <span>Pay in cash when your order arrives · 4% tax applies</span>
          </div>
          {orderPaymentType === "cod" ? (
            <Check size={18} className="payment-option-check" aria-hidden="true" />
          ) : null}
        </button>

        <button
          type="button"
          className={`payment-option-choice ${orderPaymentType === "advance" ? "selected" : ""}`}
          onClick={() => setOrderPaymentType("advance")}
        >
          <div className="payment-option-icon">
            <CreditCard size={20} aria-hidden="true" />
          </div>
          <div className="payment-option-meta">
            <strong>Advance Payment</strong>
            <span>Pay online now via card, wallet, or bank</span>
          </div>
          {orderPaymentType === "advance" ? (
            <Check size={18} className="payment-option-check" aria-hidden="true" />
          ) : null}
        </button>
      </div>
      {orderPaymentType === "advance" ? (
        <div className="advance-benefits">
          <strong className="advance-benefits-title">
            <BadgeCheck size={18} aria-hidden="true" />
            Why pay in advance?
          </strong>
          <ul>
            {ADVANCE_PAYMENT_BENEFITS.map((benefit, index) => (
              <li key={benefit}>
                <Check size={15} aria-hidden="true" />
                {/* The first benefit is the tax exemption, so it carries the
                    actual amount this cart avoids rather than just the rate. */}
                {index === 0 && codTax > 0
                  ? `${benefit} — you save ${formatRupees(codTax)} on this order`
                  : benefit}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="delivery-partner-note">
        {orderPaymentType === "cod"
          ? "Your order will be placed now and paid for in cash on delivery."
          : "You'll be taken to the payment step to pay online before your order is placed."}
      </p>
    </section>
  </div>
);

export default AddressStep;
