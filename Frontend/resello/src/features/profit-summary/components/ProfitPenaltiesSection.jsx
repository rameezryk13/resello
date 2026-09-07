import { RotateCcw } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ProfitPenaltiesSection = ({ wallet }) => {
  const penalties = wallet.penalties || [];

  return (
    <section className="ps-penalties">
      <div className="ps-section-head">
        <h2>Return penalties</h2>
        <span>
          {penalties.length} charge{penalties.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="ps-payout-banner is-penalty">
        <div>
          <span className="ps-payout-label">Deducted from your wallet</span>
          <div className="ps-payout-amount is-negative">
            − PKR {formatPKR(wallet.penaltyTotal)}
          </div>
        </div>
        <p className="ps-payout-desc">
          PKR {formatPKR(wallet.returnPenalty)} per returned order, plus the commission on
          that order reversed.
        </p>
      </div>

      <div className="ps-list">
        {penalties.length ? (
          penalties.map((entry) => (
            <article className="ps-list-item" key={entry.id || entry.orderId}>
              <span className="ps-list-icon is-penalty">
                <RotateCcw size={17} aria-hidden="true" />
              </span>
              <div className="ps-list-main">
                <strong>Order #{entry.orderId}</strong>
                <span>Returned · {formatDate(entry.createdAt)}</span>
              </div>
              <div className="ps-list-figures">
                <span className="ps-list-amount is-negative">
                  − PKR {formatPKR(entry.amount)}
                </span>
                <span className="ps-list-sub">return penalty</span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon={RotateCcw}
            title="No return penalties"
            description="None of your orders have been returned, so nothing has been deducted from your wallet."
          />
        )}
      </div>
    </section>
  );
};

export default ProfitPenaltiesSection;
