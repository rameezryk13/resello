import {
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Store,
  User as UserIcon,
} from "lucide-react";

const ProfileDetailsCard = ({
  user,
  shopName,
  setShopName,
  city,
  setCity,
  isShopNameSet,
  isCitySet,
  savingProfile,
  onSubmit,
}) => {
  return (
    <div className="profile-main-card">
      <div className="profile-card-header">
        <div className="profile-avatar-circle">
          {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
        </div>
        <div className="profile-header-info">
          <h2>{user?.name || "Reseller User"}</h2>
          <div className="profile-header-chips">
            <span className="profile-shop-badge">
              <Store size={13} />
              {user?.shopName || "No Shop Name Set"}
            </span>
            {user?.city && (
              <span className="profile-city-badge">
                <MapPin size={13} />
                {user.city}
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="profile-form">
        <div className="profile-form-grid">
          {/* Full Name (Read-Only / Locked) */}
          <div className="profile-field-group">
            <label htmlFor="profile-name">
              <UserIcon size={15} /> Full Name
            </label>
            <div className="profile-readonly-input">
              <input
                id="profile-name"
                type="text"
                value={user?.name || ""}
                disabled
              />
              <span className="locked-chip" title="Full Name Locked">
                <Lock size={12} /> Locked
              </span>
            </div>
            <small className="field-hint">Full Name is locked and cannot be changed.</small>
          </div>

          {/* Phone Number (Read-Only / Locked) */}
          <div className="profile-field-group">
            <label htmlFor="profile-phone">
              <Phone size={15} /> Phone Number
            </label>
            <div className="profile-readonly-input">
              <input
                id="profile-phone"
                type="tel"
                value={user?.phone || ""}
                disabled
              />
              <span className="locked-chip" title="Phone Number Locked">
                <Lock size={12} /> Locked
              </span>
            </div>
            <small className="field-hint">Phone Number is locked and cannot be changed.</small>
          </div>

          {/* Reseller Shop Name (Editable once, then locked) */}
          <div className={`profile-field-group ${!isShopNameSet ? "highlight-field" : ""}`}>
            <label htmlFor="profile-shop-name">
              <Building2 size={15} /> Reseller Shop Name
            </label>
            <div className="profile-readonly-input">
              <input
                id="profile-shop-name"
                type="text"
                value={isShopNameSet ? user.shopName : shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ayesha's Resell Store / Style Hub PK"
                disabled={isShopNameSet}
              />
              {isShopNameSet && (
                <span className="locked-chip permanent-chip" title="Shop Name Permanent">
                  <Lock size={12} /> Permanent
                </span>
              )}
            </div>
            <small className="field-hint">
              {isShopNameSet
                ? "Your Shop Name is permanently set and cannot be edited."
                : "⚠️ Important: Once set, your Shop Name cannot be changed further."}
            </small>
          </div>

          {/* City Name (Editable once, then locked) */}
          <div className={`profile-field-group ${!isCitySet ? "highlight-field" : ""}`}>
            <label htmlFor="profile-city">
              <MapPin size={15} /> City Name
            </label>
            <div className="profile-readonly-input">
              <input
                id="profile-city"
                type="text"
                value={isCitySet ? user.city : city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad..."
                disabled={isCitySet}
              />
              {isCitySet && (
                <span className="locked-chip permanent-chip" title="City Name Permanent">
                  <Lock size={12} /> Permanent
                </span>
              )}
            </div>
            <small className="field-hint">
              {isCitySet
                ? "Your City Name is permanently set and cannot be edited."
                : "⚠️ Important: Once set, your City Name cannot be changed further."}
            </small>
          </div>

          {/* Email Address (Read-Only / Locked) */}
          <div className="profile-field-group full-width-field">
            <label htmlFor="profile-email">
              <Mail size={15} /> Email Address
            </label>
            <div className="profile-readonly-input">
              <input
                id="profile-email"
                type="email"
                value={user?.email || ""}
                disabled
              />
              <span className="verified-chip" title="Email Verified">
                <ShieldCheck size={14} /> Verified
              </span>
            </div>
            <small className="field-hint">Email address cannot be changed.</small>
          </div>
        </div>

        <div className="profile-form-actions">
          {isShopNameSet && isCitySet ? (
            <div className="profile-locked-notice">
              <Lock size={16} /> All profile details, Shop Name &amp; City are permanently locked.
            </div>
          ) : (
            <button
              type="submit"
              className="btn-primary profile-save-btn"
              disabled={savingProfile}
            >
              <Save size={18} />
              {savingProfile ? "Saving Profile..." : "Save & Lock Details"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileDetailsCard;
