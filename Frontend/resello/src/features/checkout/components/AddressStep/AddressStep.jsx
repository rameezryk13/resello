import { useState } from "react";
import { BadgeCheck, Check, CheckCircle, CreditCard, Home, MapPin, Pencil, Truck, WalletCards } from "lucide-react";
import { formatRupees } from "@/utils/currency";
import { ADVANCE_PAYMENT_BENEFITS, DELIVERY_PARTNER } from "../../constants";
import PhoneInput from "@/components/ui/PhoneInput/PhoneInput.jsx";
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
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formError, setFormError] = useState(null);

  const formattedFullAddress = [
    newAddress.line1,
    newAddress.area,
    newAddress.town,
    newAddress.city,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0)
    .join(", ");

  const handleToggleForm = () => {
    setShowAddressForm((prev) => {
      const next = !prev;
      if (!next) {
        setIsPreviewMode(false);
        setFormError(null);
      }
      return next;
    });
  };

  const validateAddress = (addr) => {
    const { name, line1, area, town, city, phone } = addr;
    if (!name?.trim() || !line1?.trim() || !city?.trim() || !phone?.trim()) {
      return "Please fill in Name, Street Address, City, and Phone Number.";
    }

    const nameRegex = /^[A-Za-z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return "Name must contain letters only (numbers and symbols are not allowed).";
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      return "Name must be between 2 and 50 characters (industry standard).";
    }

    if (line1.trim().length > 100) {
      return "Street Address exceeds maximum 100 characters.";
    }
    if (area && area.trim().length > 50) {
      return "Area / Sector exceeds maximum 50 characters.";
    }
    if (town && town.trim().length > 50) {
      return "Town exceeds maximum 50 characters.";
    }
    if (city.trim().length > 35) {
      return "City exceeds maximum 35 characters.";
    }

    return null;
  };

  const handleFormSave = () => {
    const err = validateAddress(newAddress);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setIsPreviewMode(true);
  };

  const handleConfirmAddress = () => {
    const err = validateAddress(newAddress);
    if (err) {
      setFormError(err);
      setIsPreviewMode(false);
      return;
    }
    setFormError(null);
    onSubmitNewAddress();
  };

  return (
    <div className="checkout-left-column">
      <section className="checkout-address-card">
        <div className="section-title">Shipping Address</div>
        <button
          type="button"
          className="add-address-btn"
          onClick={handleToggleForm}
        >
          {showAddressForm ? "Cancel" : "Add new address"}
        </button>

        {showAddressForm ? (
          <div className="new-address-form-wrapper">
            {formError ? <div className="address-form-error">{formError}</div> : null}

            {isPreviewMode ? (
              /* ================= Full Address Preview Card ================= */
              <div className="address-preview-box">
                <div className="address-preview-header">
                  <div className="address-preview-title-row">
                    <MapPin size={18} className="address-preview-pin" />
                    <strong>Full Address Preview</strong>
                  </div>
                  <span className="address-preview-tag">Review & Confirm</span>
                </div>

                <div className="address-preview-body">
                  <div className="address-preview-row">
                    <span className="address-preview-label">Recipient Name:</span>
                    <span className="address-preview-value preview-name">{newAddress.name}</span>
                  </div>

                  <div className="address-preview-row">
                    <span className="address-preview-label">Full Delivery Address:</span>
                    <div className="address-preview-value full-address-highlight">
                      <Home size={15} className="preview-home-icon" />
                      <textarea
                        className="address-preview-inline-textarea"
                        value={newAddress.line1}
                        onChange={(e) => onNewAddressChange("line1", e.target.value)}
                        placeholder="Street address / house no."
                        rows={2}
                        aria-label="Street address"
                      />
                    </div>
                    <div className="address-preview-assembled-line">
                      <strong>Assembled:</strong> {formattedFullAddress || "No address entered"}
                    </div>
                  </div>

                  <div className="address-preview-split">
                    <div className="address-preview-row">
                      <span className="address-preview-label">City:</span>
                      <span className="address-preview-value">{newAddress.city}</span>
                    </div>
                    <div className="address-preview-row">
                      <span className="address-preview-label">Primary Phone:</span>
                      <span className="address-preview-value">{newAddress.phone}</span>
                    </div>
                  </div>

                  {newAddress.phone2 ? (
                    <div className="address-preview-row">
                      <span className="address-preview-label">Secondary Phone (Optional):</span>
                      <span className="address-preview-value">{newAddress.phone2}</span>
                    </div>
                  ) : null}
                </div>

                <div className="address-preview-actions">
                  <button
                    type="button"
                    className="address-preview-edit-btn"
                    onClick={() => setIsPreviewMode(false)}
                  >
                    <Pencil size={15} /> Edit Address
                  </button>
                  <button
                    type="button"
                    className="add-address-submit-btn address-preview-confirm-btn"
                    onClick={handleConfirmAddress}
                    disabled={submitting}
                  >
                    <CheckCircle size={16} />
                    <span>{submitting ? "Saving..." : "Confirm Address"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= Editable Form ================= */
              <div className="new-address-form">
                <label>
                  Name* <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "normal" }}>(Max 50 chars, letters only)</span>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="Full Name (e.g. Muhammad Ali)"
                    value={newAddress.name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
                      onNewAddressChange("name", val);
                    }}
                  />
                </label>
                <label>
                  Street Address / House No.* <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "normal" }}>(Max 100 chars)</span>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="House/Plot no., Street name"
                    value={newAddress.line1}
                    onChange={(e) => onNewAddressChange("line1", e.target.value)}
                  />
                </label>
                <label>
                  Area / Sector* <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "normal" }}>(Max 50 chars)</span>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Sector F-7, Gulberg III, DHA Phase 5"
                    value={newAddress.area || ""}
                    onChange={(e) => onNewAddressChange("area", e.target.value)}
                  />
                </label>
                <label>
                  Town* <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "normal" }}>(Max 50 chars)</span>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Model Town, Saddar, Cantt"
                    value={newAddress.town || ""}
                    onChange={(e) => onNewAddressChange("town", e.target.value)}
                  />
                </label>
                <label>
                  City* <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: "normal" }}>(Max 35 chars)</span>
                  <input
                    type="text"
                    maxLength={35}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={newAddress.city}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s'-]/g, "");
                      onNewAddressChange("city", val);
                    }}
                  />
                </label>
                <PhoneInput
                  id="checkout-new-address-phone"
                  label="Phone Number"
                  value={newAddress.phone}
                  onChange={(val) => onNewAddressChange("phone", val)}
                  error={formError && !newAddress.phone ? "Phone Number is required" : undefined}
                  required
                />
                <PhoneInput
                  id="checkout-new-address-phone2"
                  label="Second Phone Number (optional)"
                  value={newAddress.phone2}
                  onChange={(val) => onNewAddressChange("phone2", val)}
                  required={false}
                />

                {formattedFullAddress ? (
                  <div className="address-live-preview-chip">
                    <span className="live-preview-label">Full Address:</span>
                    <span className="live-preview-text">{formattedFullAddress}</span>
                  </div>
                ) : null}

                <div className="new-address-form-buttons">
                  <button
                    type="button"
                    className="add-address-cancel-btn"
                    onClick={() => {
                      setShowAddressForm(false);
                      setIsPreviewMode(false);
                      setFormError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="add-address-submit-btn"
                    onClick={handleFormSave}
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {addresses.length === 0 ? (
          <p className="empty-state">No saved addresses found.</p>
        ) : (
          <div className="address-list">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;
              const fullAddressText = [
                address.line1,
                address.area,
                address.town,
                !address.area && !address.town && address.line2,
                address.city,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={address.id}
                  type="button"
                  className={`address-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onAddressSelect(address.id)}
                >
                  <div className="address-card-indicator" aria-hidden="true">
                    {isSelected ? (
                      <CheckCircle size={20} className="address-card-check-icon active" />
                    ) : (
                      <div className="address-card-radio-circle" />
                    )}
                  </div>
                  <div className="address-meta">
                    <div className="address-meta-top">
                      <strong className="address-card-name">{address.name}</strong>
                      {isSelected && (
                        <span className="selected-address-badge">
                          <Check size={12} /> Selected
                        </span>
                      )}
                    </div>
                    <div className="address-full-line">
                      <Home size={15} className="address-inline-icon" />
                      <span>{fullAddressText || address.line1}</span>
                    </div>
                    <span className="address-phone-line">
                      Phone: {address.phone}
                      {address.phone2 ? `, ${address.phone2}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
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
};

export default AddressStep;
