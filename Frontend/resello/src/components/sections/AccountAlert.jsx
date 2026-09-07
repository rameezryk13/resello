import { AlertTriangle, Mail } from "lucide-react";
import "./AccountAlert.css";

// The deactivation notice, shown on Dashboard, Wallet, Payment Summary and
// Checkout. One component rather than four copies of the same paragraph, so
// the wording and the support details can't drift between pages.
const AccountAlert = ({ wallet }) => {
  if (!wallet?.deactivated) return null;

  const email = wallet.support?.email || "support@resello.pk";

  return (
    <section className="account-alert" role="alert">
      <span className="account-alert-icon" aria-hidden="true">
        <AlertTriangle size={20} />
      </span>

      <div className="account-alert-body">
        <strong>Your account is deactivated</strong>
        <p>{wallet.deactivationMessage}</p>

        {email && (
          <div className="account-alert-contacts">
            <a href={`mailto:${email}`} className="account-alert-contact">
              <Mail size={14} aria-hidden="true" /> {email}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default AccountAlert;
