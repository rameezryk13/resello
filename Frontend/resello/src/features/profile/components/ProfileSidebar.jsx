import { CheckCircle2, CreditCard, Store, Wallet } from "lucide-react";

const ProfileSidebar = ({ user, formattedJoinDate, onNavigate }) => {
  return (
    <aside className="profile-side-rail">
      {/* Account Status Card */}
      <div className="profile-side-card">
        <h3>Account Status</h3>
        <div className="profile-status-pill">
          <CheckCircle2 size={16} /> Active Reseller
        </div>
        <ul className="profile-info-list">
          <li>
            <span>Member Since</span>
            <strong>{formattedJoinDate}</strong>
          </li>
          <li>
            <span>City</span>
            <strong>{user?.city || "Not Set"}</strong>
          </li>
          <li>
            <span>Profit Account</span>
            <strong>{user?.bankInfo?.bankName || "Not Set"}</strong>
          </li>
          <li>
            <span>Reseller ID</span>
            <code>{user?.id || "N/A"}</code>
          </li>
        </ul>
      </div>

      {/* Quick Navigation Card */}
      <div className="profile-side-card">
        <h3>Quick Actions</h3>
        <div className="profile-nav-buttons">
          <button
            type="button"
            className="profile-nav-btn"
            onClick={() => onNavigate("/profit-account")}
          >
            <CreditCard size={17} />
            <span>Profit &amp; Payout Account</span>
          </button>
          <button
            type="button"
            className="profile-nav-btn"
            onClick={() => onNavigate("/wallet")}
          >
            <Wallet size={17} />
            <span>Wallet &amp; Earnings</span>
          </button>
          <button
            type="button"
            className="profile-nav-btn"
            onClick={() => onNavigate("/my-orders")}
          >
            <Store size={17} />
            <span>My Reseller Orders</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
