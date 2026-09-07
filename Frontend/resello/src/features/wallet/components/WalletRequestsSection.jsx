import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatRupees } from "@/utils/currency";

const formatDate = (value) =>
  new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

const WalletRequestsSection = ({ requests = [], onApprove, onReject }) => {
  if (!requests.length) return null;

  return (
    <section className="account-section wallet-requests-section">
      <div className="wallet-requests-head">
        <div>
          <h2>Withdrawal Requests</h2>
          <p>Track your withdrawal requests and test Admin acceptance in demo mode.</p>
        </div>
      </div>
      <div className="wallet-requests-list">
        {requests.map((req) => (
          <div key={req.id} className="wallet-request-card">
            <div className="wallet-request-info">
              <div>
                <div className="wallet-request-amount">{formatRupees(req.amount)}</div>
                <div className="wallet-request-meta">
                  Requested on {formatDate(req.createdAt)}
                </div>
              </div>
              <span className={`wallet-request-status-badge ${req.status}`}>
                {req.status === "pending" && <Clock size={13} />}
                {req.status === "approved" && <CheckCircle2 size={13} />}
                {req.status === "rejected" && <XCircle size={13} />}
                {req.status === "pending" ? "Pending Admin Approval" : req.status}
              </span>
            </div>

            {req.status === "pending" && (
              <div className="admin-demo-actions">
                <button
                  type="button"
                  className="btn-admin-accept"
                  onClick={() => onApprove(req.id, req.amount)}
                >
                  <CheckCircle2 size={14} /> Demo: Accept Request (Admin)
                </button>
                <button
                  type="button"
                  className="btn-admin-reject"
                  onClick={() => onReject(req.id)}
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default WalletRequestsSection;
