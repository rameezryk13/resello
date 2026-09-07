import {
  Layers,
  Package,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Browse products", hint: "Find new items to resell", path: "/", icon: ShoppingBag },
  { label: "My orders", hint: "Every order you placed", path: "/my-orders", icon: Package },
  { label: "Track order", hint: "See where a parcel is", path: "/track-order", icon: Truck },
  { label: "Bulk order", hint: "Order in wholesale volume", path: "/?section=more", icon: Layers },
  { label: "Followed shops", hint: "Shops you keep an eye on", path: "/followed-shops", icon: Store },
  { label: "Wallet", hint: "Balance and payouts", path: "/wallet", icon: Wallet },
];

const DashboardQuickActions = ({ onNavigate }) => {
  return (
    <section className="account-section">
      <div className="dash-section-head">
        <h2>Quick actions</h2>
        <p>Shortcuts to the things resellers do most.</p>
      </div>
      <div className="dash-action-grid">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className="dash-action-tile"
              onClick={() => onNavigate(action.path)}
            >
              <span className="dash-action-icon">
                <Icon size={19} />
              </span>
              <strong>{action.label}</strong>
              <small>{action.hint}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardQuickActions;
