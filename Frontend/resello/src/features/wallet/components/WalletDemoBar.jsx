import { CalendarClock, RotateCcw, Zap } from "lucide-react";
import { formatRupees } from "@/utils/currency";

const getNextWeekdayDateStr = (dayOfWeek) => {
  const d = new Date();
  const currentDay = d.getDay();
  let distance = (dayOfWeek - currentDay + 7) % 7;
  d.setDate(d.getDate() + distance);
  return d.toISOString().split("T")[0];
};

const WalletDemoBar = ({
  wallet,
  onDateChange,
  onReleaseCommission,
  releasingCommission = false,
}) => {
  return (
    <section className="demo-controller-bar">
      <div className="demo-controller-info">
        <span className="demo-tag">
          <CalendarClock size={14} /> Demo Controls
        </span>
        <span className="demo-date-status">
          Current Date:{" "}
          <strong>
            {wallet.effectiveDate
              ? new Date(wallet.effectiveDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : new Date().toLocaleDateString()}
          </strong>{" "}
          {wallet.isSimulated && <span className="text-muted">(Simulated)</span>}
        </span>
      </div>

      <div className="demo-controller-actions">
        {onReleaseCommission && (
          <button
            type="button"
            className="demo-btn-preset demo-btn-release"
            onClick={onReleaseCommission}
            disabled={releasingCommission}
            title="Demo: Release pending order commission into your wallet balance"
          >
            <Zap size={13} />
            {releasingCommission
              ? "Releasing…"
              : wallet.pendingCommission > 0
                ? `Release Pending Commission (${formatRupees(wallet.pendingCommission)})`
                : "Release Demo Commission"}
          </button>
        )}
        <button
          type="button"
          className="demo-btn-preset"
          onClick={() => onDateChange(getNextWeekdayDateStr(1))}
        >
          📅 Set to Monday (Open Window)
        </button>
        <button
          type="button"
          className="demo-btn-preset"
          onClick={() => onDateChange(getNextWeekdayDateStr(3))}
        >
          📅 Set to Wednesday (Closed)
        </button>
        <input
          type="date"
          className="demo-date-input"
          value={wallet.simulatedDate ? wallet.simulatedDate.split("T")[0] : ""}
          onChange={(e) => onDateChange(e.target.value)}
          title="Select custom demo date"
        />
        {wallet.isSimulated && (
          <button
            type="button"
            className="demo-btn-preset"
            onClick={() => onDateChange(null)}
          >
            <RotateCcw size={13} /> Reset Date
          </button>
        )}
      </div>
    </section>
  );
};

export default WalletDemoBar;
