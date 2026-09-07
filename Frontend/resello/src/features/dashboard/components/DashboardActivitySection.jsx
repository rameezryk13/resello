import { ArrowRight, Package, Store, Truck } from "lucide-react";

const DashboardActivitySection = ({ totals, shopCount, loading, onNavigate }) => {
  return (
    <section className="account-section dash-activity">
      <div className="dash-section-head">
        <h2>Activity</h2>
        <p>Where your account stands right now.</p>
      </div>

      <button type="button" className="dash-activity-row" onClick={() => onNavigate("/my-orders")}>
        <span className="dash-activity-icon">
          <Package size={20} />
        </span>
        <span className="dash-activity-text">
          <strong>Your orders</strong>
          <small>
            {loading
              ? "Loading your orders…"
              : totals.ordersCount > 0
                ? `${totals.ordersCount} order${totals.ordersCount === 1 ? "" : "s"} to track and manage.`
                : "You have not placed an order yet."}
          </small>
        </span>
        <span className="dash-activity-cta">
          View all <ArrowRight size={15} />
        </span>
      </button>

      <button type="button" className="dash-activity-row" onClick={() => onNavigate("/track-order")}>
        <span className="dash-activity-icon">
          <Truck size={20} />
        </span>
        <span className="dash-activity-text">
          <strong>Track a delivery</strong>
          <small>Follow a parcel step by step with its order ID.</small>
        </span>
        <span className="dash-activity-cta">
          Track <ArrowRight size={15} />
        </span>
      </button>

      <button type="button" className="dash-activity-row" onClick={() => onNavigate("/followed-shops")}>
        <span className="dash-activity-icon">
          <Store size={20} />
        </span>
        <span className="dash-activity-text">
          <strong>Followed shops</strong>
          <small>
            {loading
              ? "Loading your shops…"
              : shopCount > 0
                ? `You follow ${shopCount} shop${shopCount === 1 ? "" : "s"}.`
                : "You are not following any shop yet."}
          </small>
        </span>
        <span className="dash-activity-cta">
          Open <ArrowRight size={15} />
        </span>
      </button>
    </section>
  );
};

export default DashboardActivitySection;
