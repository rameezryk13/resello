import { Landmark, Lock, Plus, Smartphone, Trash2 } from "lucide-react";

const ProfileBankCard = ({ user, deletingBank, onDeleteBank, onAddBank }) => {
  return (
    <div className="profile-main-card profile-bank-card">
      <div className="profile-bank-card-header">
        <div>
          <h3>
            <Landmark size={20} /> Profit Account &amp; Bank Details
          </h3>
          <p>Your linked bank account or mobile wallet for receiving profit withdrawals.</p>
        </div>

        {user?.bankInfo?.accountTitle && (
          <button
            type="button"
            className="profile-delete-bank-btn"
            onClick={onDeleteBank}
            disabled={deletingBank}
            title="Delete Bank Information"
          >
            <Trash2 size={14} />
            {deletingBank ? "Deleting..." : "Delete Bank Info"}
          </button>
        )}
      </div>

      {/* Display existing saved bank info or prompt to add on Profit Account page */}
      {user?.bankInfo?.accountTitle ? (
        <div className="profile-bank-display-box">
          <div className="bank-display-icon">
            {user.bankInfo.bankName?.toLowerCase().includes("mobile") ||
            user.bankInfo.bankName?.toLowerCase().includes("jazz") ||
            user.bankInfo.bankName?.toLowerCase().includes("easy") ? (
              <Smartphone size={24} />
            ) : (
              <Landmark size={24} />
            )}
          </div>
          <div className="bank-display-details">
            <div className="bank-title-row">
              <h4>{user.bankInfo.bankName}</h4>
              <span className="locked-chip permanent-chip">
                <Lock size={12} /> Permanent &amp; Locked
              </span>
            </div>
            <p className="bank-account-title">
              Bank Holder Name: <strong>{user.bankInfo.accountTitle}</strong>
            </p>
            <p className="bank-account-number">
              Account / IBAN: <code>{user.bankInfo.accountNumber}</code>
            </p>
            <small className="field-hint" style={{ marginTop: "6px", color: "#64748b" }}>
              🔒 Details are locked. Use the Delete Bank Info button above if you need to unlink this account.
            </small>
          </div>
        </div>
      ) : (
        <div className="profile-bank-empty-box">
          <div className="bank-empty-icon-wrapper">
            <Landmark size={30} />
          </div>
          <div className="bank-empty-info">
            <h4>No Bank Account Linked Yet</h4>
            <p>Setup your Meezan Bank, HBL, JazzCash, EasyPaisa, or other bank account to start receiving profit payouts.</p>
          </div>
          <button
            type="button"
            className="btn-primary profile-add-bank-btn"
            onClick={onAddBank}
          >
            <Plus size={16} /> Add Bank Info
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileBankCard;
