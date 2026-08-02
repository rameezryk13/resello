import { useState } from "react";
import { Landmark, Smartphone, Wallet, CheckCircle2, Plus } from "lucide-react";
import Header from "../../../components/Header/Header.jsx";
import AccountHero from "../../../components/PageSections/AccountHero";
import "./ProfitAccountPage.css";

const PAYMENT_METHODS = [
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Mobile wallet payout",
    icon: Smartphone,
    accent: "jazzcash",
    fieldLabel: "JazzCash mobile number",
    placeholder: "03xx xxxxxxx",
  },
  {
    id: "easypaisa",
    name: "EasyPaisa",
    description: "Mobile wallet payout",
    icon: Wallet,
    accent: "easypaisa",
    fieldLabel: "EasyPaisa mobile number",
    placeholder: "03xx xxxxxxx",
  },
  {
    id: "account",
    name: "Bank Account",
    description: "Direct bank transfer",
    icon: Landmark,
    accent: "bank",
    fieldLabel: "Bank account number / IBAN",
    placeholder: "PKxx xxxx xxxx xxxx xxxx xxxx",
  },
];

const ProfitAccountPage = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [savedAccount, setSavedAccount] = useState(null);
  const [formError, setFormError] = useState("");

  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === selectedMethodId);

  const openPaymentOptions = () => {
    setShowPaymentOptions((prev) => !prev);
    setFormError("");
  };

  const chooseMethod = (method) => {
    setSelectedMethodId(method.id);
    setFieldValue("");
    setFormError("");
  };

  const saveAccount = () => {
    if (!selectedMethod) return;

    if (!fieldValue.trim()) {
      setFormError(`Please enter your ${selectedMethod.fieldLabel.toLowerCase()}.`);
      return;
    }

    setSavedAccount({ method: selectedMethod, value: fieldValue.trim() });
    setShowPaymentOptions(false);
    setSelectedMethodId("");
    setFieldValue("");
    setFormError("");
  };

  const cancelSelection = () => {
    setSelectedMethodId("");
    setFieldValue("");
    setFormError("");
  };

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Profit Account"
          description="Add where you want to receive your reseller profit payments."
        />

        {savedAccount ? (
          <section className="account-section profit-account-saved-card">
            <span className="profit-account-saved-icon">
              <CheckCircle2 size={20} />
            </span>
            <div className="profit-account-saved-text">
              <h2 className="account-card-title">Payout account added</h2>
              <p className="account-card-subtitle">
                {savedAccount.method.name} &middot; {savedAccount.value}
              </p>
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={openPaymentOptions}
            >
              Change
            </button>
          </section>
        ) : null}

        <section className="account-section account-payment-section">
          <div className="account-payment-header">
            <div>
              <h2 className="account-card-title">Payment Method</h2>
              <p className="account-card-subtitle">
                Select a payout method for your profit account.
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={openPaymentOptions}>
              <Plus size={16} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: -3 }} />
              Add Profit Account
            </button>
          </div>

          {showPaymentOptions ? (
            <>
              <div className="account-payment-options profit-account-options">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isActive = selectedMethodId === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={`account-payment-option profit-account-option ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => chooseMethod(method)}
                    >
                      <span className={`profit-account-option-icon accent-${method.accent}`}>
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <span className="profit-account-option-text">
                        <strong>{method.name}</strong>
                        <span>{method.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedMethod ? (
                <div className="profit-account-form">
                  <label htmlFor="profit-account-field">{selectedMethod.fieldLabel}</label>
                  <input
                    id="profit-account-field"
                    type="text"
                    value={fieldValue}
                    onChange={(event) => setFieldValue(event.target.value)}
                    placeholder={selectedMethod.placeholder}
                  />
                  {formError ? <p className="profit-account-form-error">{formError}</p> : null}
                  <div className="profit-account-form-actions">
                    <button type="button" className="btn-primary" onClick={saveAccount}>
                      Save Payout Account
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={cancelSelection}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ProfitAccountPage;
