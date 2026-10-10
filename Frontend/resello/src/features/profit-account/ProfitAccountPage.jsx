import { useEffect, useState } from "react";
import {
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
import { isValidPakistanPhone } from "@/utils/authValidation";
import { formatIban, isValidPakistanIban, normalizeIban } from "@/utils/validation";
import IBANInput from "@/components/ui/IBANInput/IBANInput.jsx";
import PhoneInput, { isPhoneValid } from "@/components/ui/PhoneInput/PhoneInput.jsx";
import "./ProfitAccountPage.css";

// Smart wallets in Pakistan created on a user's mobile number (not IBAN)
export const SMART_WALLETS = [
  "JazzCash",
  "EasyPaisa",
  "SadaPay",
  "NayaPay",
  "UPaisa",
  "Zindigi (JS Bank)",
  "PayMax",
  "Finja",
];

// All commercial & Islamic banks in Pakistan, plus smart wallets/EMIs that issue official Pakistani IBANs
export const PAKISTAN_BANKS_AND_WALLETS = [
  "Meezan Bank",
  "HBL (Habib Bank Limited)",
  "Bank Alfalah",
  "UBL (United Bank Limited)",
  "MCB Bank",
  "Allied Bank Limited (ABL)",
  "Bank of Punjab (BOP)",
  "Askari Bank",
  "Faysal Bank",
  "Standard Chartered Bank",
  "Bank Al Habib",
  "Habib Metro Bank",
  "Soneri Bank",
  "JS Bank",
  "Dubai Islamic Bank",
  "BankIslami Pakistan",
  "National Bank of Pakistan (NBP)",
  "SadaPay (SadaTech / Microfinance IBAN)",
  "NayaPay (NayaPay EMI IBAN)",
  "JazzCash (Mobilink Microfinance Bank IBAN)",
  "EasyPaisa (Telenor Microfinance Bank IBAN)",
  "UPaisa (U Microfinance Bank IBAN)",
];

// Exactly two primary options: Smart Wallet (mobile number) and Bank Account (IBAN)
export const PAYMENT_METHODS = [
  {
    id: "smart_wallet",
    name: "Smart Wallet",
    description: "Mobile number payout (JazzCash, EasyPaisa, SadaPay, NayaPay, etc.)",
    icon: Smartphone,
    accent: "smart-wallet",
    defaultProvider: "JazzCash",
    fieldLabel: "Registered Mobile Number",
    placeholder: "03xx xxxxxxx",
  },
  {
    id: "bank_account",
    name: "Bank Account",
    description: "Direct bank transfer via 24-char IBAN (All Banks & Digital Wallets)",
    icon: Landmark,
    accent: "bank",
    defaultProvider: "Meezan Bank",
    fieldLabel: "24-character Pakistani IBAN",
    placeholder: "PKxx xxxx xxxx xxxx xxxx xxxx",
  },
];

const ProfitAccountPage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState("smart_wallet");
  const [selectedProvider, setSelectedProvider] = useState(SMART_WALLETS[0]);
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isLocked = Boolean(user?.bankInfo?.accountTitle || user?.bankInfo?.accountNumber);

  useEffect(() => {
    if (user?.bankInfo) {
      const isIban = String(user.bankInfo.accountNumber || "").toUpperCase().startsWith("PK");
      const methodId = isIban ? "bank_account" : "smart_wallet";
      setSelectedMethodId(methodId);
      setSelectedProvider(
        user.bankInfo.bankName ||
          (isIban ? PAKISTAN_BANKS_AND_WALLETS[0] : SMART_WALLETS[0])
      );
      setAccountTitle(user.bankInfo.accountTitle || "");
      setAccountNumber(user.bankInfo.accountNumber || "");
    }
  }, [user]);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId);

  const chooseMethod = (method) => {
    if (method.id === selectedMethodId) return;
    setSelectedMethodId(method.id);
    setSelectedProvider(
      method.id === "smart_wallet" ? SMART_WALLETS[0] : PAKISTAN_BANKS_AND_WALLETS[0]
    );
    setAccountNumber("");
    setFormError("");
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error("Profit account details are locked and cannot be changed once set.");
      return;
    }

    if (!accountTitle.trim()) {
      setFormError("Account Holder Name (Account Title) is required.");
      return;
    }

    if (!accountNumber.trim()) {
      setFormError(
        selectedMethodId === "smart_wallet"
          ? "Registered Mobile Number is required."
          : "24-character Pakistani IBAN is required."
      );
      return;
    }

    if (selectedMethodId === "smart_wallet") {
      const cleanPhone = (accountNumber || "").replace("+92", "").replace(/\D/g, "");
      if (cleanPhone.length === 0) {
        setFormError("Registered Mobile Number is required.");
        return;
      }
      if (cleanPhone.length < 10) {
        const digitsLeft = 10 - cleanPhone.length;
        setFormError(`${digitsLeft} more digit${digitsLeft === 1 ? "" : "s"} needed`);
        return;
      }
      if (!isPhoneValid(accountNumber) && !isValidPakistanPhone(accountNumber)) {
        setFormError("Please provide a valid Pakistani mobile number (e.g. +92 300 1234567).");
        return;
      }
    } else if (selectedMethodId === "bank_account") {
      const cleanIban = normalizeIban(accountNumber);
      if (cleanIban.length !== 24 || !isValidPakistanIban(accountNumber)) {
        const bankCode = cleanIban.slice(4, 8);
        if (bankCode.length === 4 && !/^[A-Z]{4}$/.test(bankCode)) {
          setFormError("Characters 5–8 must be letters (bank code, e.g. HABB)");
        } else {
          setFormError("IBAN must be: PK00 XXXX 0000 0000 0000 0000");
        }
        return;
      }
    }

    const finalBankName =
      selectedMethodId === "smart_wallet"
        ? `${selectedProvider} (Smart Wallet)`
        : selectedProvider;

    setSaving(true);
    try {
      await updateProfile({
        bankInfo: {
          methodType: selectedMethodId,
          bankName: finalBankName,
          accountTitle: accountTitle.trim(),
          accountNumber: selectedMethodId === "smart_wallet"
            ? accountNumber.replace(/\s+/g, "")
            : accountNumber.trim(),
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

  const isSavedIban = String(user?.bankInfo?.accountNumber || "").toUpperCase().startsWith("PK");

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero
          title="Profit Account"
          description="View and link your permanent profit account for receiving reseller payouts."
        />

        {/* Existing Saved Profit Account (Permanently Locked) */}
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
                    background: isSavedIban ? "#eff6ff" : "#f5f3ff",
                    color: isSavedIban ? "#1e40af" : "#6d28d9",
                    fontSize: 12,
                    fontWeight: 700,
                    border: isSavedIban ? "1px solid #93c5fd" : "1px solid #c4b5fd",
                  }}
                >
                  {isSavedIban ? "Bank Account (IBAN)" : "Smart Wallet (Mobile)"}
                </span>
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
                Account Holder Name: <strong>{user.bankInfo.accountTitle}</strong>
              </p>
              <p className="account-card-subtitle" style={{ marginTop: 2, fontSize: 14 }}>
                {isSavedIban ? "Pakistani IBAN" : "Registered Mobile Number"}:{" "}
                <code>{user.bankInfo.accountNumber}</code>
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
                  Select your payout method: <strong>Smart Wallet</strong> (mobile number) or <strong>Bank Account</strong> (IBAN). <strong>Note: Once added, it cannot be changed further.</strong>
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
                {/* Two Options Selector: Smart Wallet vs Bank Account */}
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
                        aria-pressed={isActive}
                      >
                        <span className={`profit-account-option-icon accent-${method.accent}`}>
                          <Icon size={22} strokeWidth={2} />
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
                  {/* Select Bank / Provider Dropdown */}
                  <div className="profit-account-field-group">
                    <label htmlFor="profit-bank-select">
                      {selectedMethodId === "smart_wallet"
                        ? "Select Smart Wallet Provider"
                        : "Select Bank / Financial Institution"}
                    </label>
                    <select
                      id="profit-bank-select"
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
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
                      {selectedMethodId === "smart_wallet"
                        ? SMART_WALLETS.map((walletName) => (
                            <option key={walletName} value={walletName}>
                              {walletName}
                            </option>
                          ))
                        : PAKISTAN_BANKS_AND_WALLETS.map((bankName) => (
                            <option key={bankName} value={bankName}>
                              {bankName}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Account Holder Name */}
                  <div className="profit-account-field-group" style={{ marginTop: 14 }}>
                    <label htmlFor="profit-account-holder">
                      {selectedMethodId === "smart_wallet"
                        ? "Wallet Holder Name (Account Title)"
                        : "Bank Holder Name (Account Title)"}
                    </label>
                    <input
                      id="profit-account-holder"
                      type="text"
                      value={accountTitle}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      placeholder="Enter full Account Holder Name (e.g. Ayesha Khan)"
                      required
                    />
                    <small style={{ fontSize: 12, color: "#d97706", marginTop: 2, display: "block" }}>
                      ⚠️ Important: Once added, your Account Title cannot be changed.
                    </small>
                  </div>

                  {/* Account Number: IBAN for Bank Account, Mobile Number for Smart Wallet */}
                  {selectedMethodId === "bank_account" ? (
                    <div style={{ marginTop: 14 }}>
                      <IBANInput
                        id="profit-account-number"
                        label="24-character Pakistani IBAN"
                        value={accountNumber}
                        onChange={(val) => {
                          setAccountNumber(val);
                          setFormError("");
                        }}
                        error={formError}
                        required
                      />
                    </div>
                  ) : (
                    <div style={{ marginTop: 14 }}>
                      <PhoneInput
                        id="profit-account-number"
                        label="Registered Mobile Number"
                        value={accountNumber}
                        onChange={(val) => {
                          setAccountNumber(val);
                          setFormError("");
                        }}
                        error={formError}
                        required
                      />
                    </div>
                  )}

                  {formError && selectedMethodId !== "bank_account" && selectedMethodId !== "smart_wallet" ? (
                    <p className="profit-account-form-error">{formError}</p>
                  ) : null}

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
