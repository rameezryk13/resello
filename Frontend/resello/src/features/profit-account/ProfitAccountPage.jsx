import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Landmark,
  Lock,
  Plus,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatIban, isValidPakistanIban, normalizeIban } from "@/utils/validation";
import "./ProfitAccountPage.css";

const PAKISTAN_BANKS = [
  "Meezan Bank",
  "HBL (Habib Bank Limited)",
  "JazzCash Mobile Wallet",
  "EasyPaisa Mobile Wallet",
  "Bank Alfalah",
  "Allied Bank Limited (ABL)",
  "UBL (United Bank Limited)",
  "MCB Bank",
  "Faysal Bank",
  "Askari Bank",
  "Bank of Punjab (BOP)",
  "Standard Chartered Bank",
];

const PAYMENT_METHODS = [
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Mobile wallet payout",
    icon: Smartphone,
    accent: "jazzcash",
    defaultBank: "JazzCash Mobile Wallet",
    fieldLabel: "JazzCash Mobile Number",
    placeholder: "03xx xxxxxxx",
  },
  {
    id: "easypaisa",
    name: "EasyPaisa",
    description: "Mobile wallet payout",
    icon: Wallet,
    accent: "easypaisa",
    defaultBank: "EasyPaisa Mobile Wallet",
    fieldLabel: "EasyPaisa Mobile Number",
    placeholder: "03xx xxxxxxx",
  },
  {
    id: "account",
    name: "Bank Account",
    description: "Direct bank transfer (Meezan, HBL, UBL, etc.)",
    icon: Landmark,
    accent: "bank",
    defaultBank: "Meezan Bank",
    fieldLabel: "Bank Account Number / IBAN",
    placeholder: "PKxx xxxx xxxx xxxx xxxx xxxx",
  },
];

const ProfitAccountPage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState("account");
  const [selectedBankName, setSelectedBankName] = useState(PAKISTAN_BANKS[0]);
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isLocked = Boolean(user?.bankInfo?.accountTitle || user?.bankInfo?.accountNumber);

  useEffect(() => {
    if (user?.bankInfo) {
      setSelectedBankName(user.bankInfo.bankName || PAKISTAN_BANKS[0]);
      setAccountTitle(user.bankInfo.accountTitle || "");
      setAccountNumber(user.bankInfo.accountNumber || "");
    }
  }, [user]);

  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === selectedMethodId);

  const chooseMethod = (method) => {
    setSelectedMethodId(method.id);
    setSelectedBankName(method.defaultBank);
    setFormError("");
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error("Profit account details are locked and cannot be changed once set.");
      return;
    }

    if (!accountTitle.trim()) {
      setFormError("Bank Holder Name (Account Title) is required.");
      return;
    }

    if (!accountNumber.trim()) {
      setFormError("Account / Mobile Number / IBAN is required.");
      return;
    }

    if (selectedMethod?.id === "bank_transfer" && !isValidPakistanIban(accountNumber)) {
      setFormError("Please provide a valid 24-character Pakistani IBAN (e.g. PK36 HABB 0000 0000 0000 0000).");
      return;
    }

    const finalBankName = selectedBankName || selectedMethod?.defaultBank || "Bank Account";

    setSaving(true);
    try {
      await updateProfile({
        bankInfo: {
          bankName: finalBankName,
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
        },
      });
      toast.success("Profit account added successfully! Details are now permanently locked.");
      setShowPaymentOptions(false);
      setFormError("");
    } catch (err) {
      toast.error(err?.message || "Failed to save profit account details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Profit Account"
          description="View and link your permanent profit account for receiving reseller payouts."
        />

        {/* Existing Saved Bank Account (Permanently Locked) */}
        {user?.bankInfo?.accountTitle ? (
          <section className="account-section profit-account-saved-card">
            <span className="profit-account-saved-icon">
              <CheckCircle2 size={24} />
            </span>
            <div className="profit-account-saved-text">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 className="account-card-title">{user.bankInfo.bankName}</h2>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid #f59e0b",
                  }}
                >
                  <Lock size={12} /> Permanent &amp; Locked
                </span>
              </div>
              <p className="account-card-subtitle" style={{ marginTop: 6, fontSize: 14 }}>
                Bank Holder Name: <strong>{user.bankInfo.accountTitle}</strong>
              </p>
              <p className="account-card-subtitle" style={{ marginTop: 2, fontSize: 14 }}>
                Account / IBAN / Number: <code>{user.bankInfo.accountNumber}</code>
              </p>
              <small style={{ display: "block", marginTop: 8, color: "#64748b" }}>
                🔒 Your profit account info is synchronized with your profile and cannot be edited or changed further.
              </small>
            </div>
          </section>
        ) : (
          <section className="account-section account-payment-section">
            <div className="account-payment-header">
              <div>
                <h2 className="account-card-title">Add Profit Account</h2>
                <p className="account-card-subtitle">
                  Select your Bank (e.g. Meezan Bank, HBL, JazzCash) and input your Bank Holder Name. <strong>Note: Once added, it cannot be changed further.</strong>
                </p>
              </div>
              {!showPaymentOptions && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowPaymentOptions(true)}
                >
                  <Plus size={16} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: -3 }} />
                  Setup Profit Account
                </button>
              )}
            </div>

            {showPaymentOptions && (
              <form onSubmit={handleSaveAccount} className="profit-account-form-wrapper">
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

                <div className="profit-account-form">
                  {/* Select Bank Name */}
                  <div className="profit-account-field-group">
                    <label htmlFor="profit-bank-select">Select Bank Name / Provider</label>
                    <select
                      id="profit-bank-select"
                      value={selectedBankName}
                      onChange={(e) => setSelectedBankName(e.target.value)}
                      style={{
                        width: "100%",
                        height: 44,
                        padding: "0 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        color: "#0f172a",
                        background: "#ffffff",
                        fontWeight: 600,
                      }}
                    >
                      {PAKISTAN_BANKS.map((bName) => (
                        <option key={bName} value={bName}>
                          {bName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bank Holder Name Input */}
                  <div className="profit-account-field-group" style={{ marginTop: 14 }}>
                    <label htmlFor="profit-account-holder">Bank Holder Name (Account Title)</label>
                    <input
                      id="profit-account-holder"
                      type="text"
                      value={accountTitle}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      placeholder="Enter full Bank Holder Name (e.g. Ayesha Khan)"
                      required
                    />
                    <small style={{ fontSize: 12, color: "#d97706", marginTop: 2, display: "block" }}>
                      ⚠️ Important: Once added, your Bank Holder Name cannot be changed.
                    </small>
                  </div>

                  {/* Account / IBAN Number Input */}
                  <div className="profit-account-field-group" style={{ marginTop: 14 }}>
                    <label htmlFor="profit-account-number">
                      {selectedMethod?.fieldLabel || "Account Number / IBAN"}
                    </label>
                    <input
                      id="profit-account-number"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccountNumber(selectedMethod?.id === "bank_transfer" ? formatIban(val) : val);
                        setFormError("");
                      }}
                      placeholder={selectedMethod?.placeholder || "Account or mobile number"}
                      required
                    />
                    {selectedMethod?.id === "bank_transfer" && (
                      <small
                        style={{
                          display: "block",
                          marginTop: "6px",
                          fontSize: "12px",
                          color: accountNumber
                            ? isValidPakistanIban(accountNumber)
                              ? "#16a34a"
                              : "#dc2626"
                            : "#64748b",
                          fontWeight: accountNumber ? 600 : 400,
                        }}
                      >
                        {accountNumber
                          ? isValidPakistanIban(accountNumber)
                            ? "✓ Valid Pakistani IBAN format (24 characters)"
                            : `IBAN format: PK + 2 digits + 4 bank letters + 16 chars (${normalizeIban(accountNumber).length}/24)`
                          : "Standard Pakistani IBAN: PK + 2 digits + 4 bank letters + 16 characters (24 chars)"}
                      </small>
                    )}
                  </div>

                  {formError ? <p className="profit-account-form-error">{formError}</p> : null}

                  <div className="profit-account-form-actions" style={{ marginTop: 18 }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      <ShieldCheck size={16} style={{ marginRight: 6 }} />
                      {saving ? "Saving Payout Account..." : "Save & Lock Profit Account"}
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setShowPaymentOptions(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfitAccountPage;
