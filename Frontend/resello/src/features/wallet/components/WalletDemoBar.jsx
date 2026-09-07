import { CalendarClock, RotateCcw } from "lucide-react";

const getNextWeekdayDateStr = (dayOfWeek) => {
  const d = new Date();
  const currentDay = d.getDay();
  let distance = (dayOfWeek - currentDay + 7) % 7;
  d.setDate(d.getDate() + distance);
  return d.toISOString().split("T")[0];
};

const WalletDemoBar = ({ wallet, onDateChange }) => {
  return (
    <section className="demo-controller-bar">
      <div className="demo-controller-info">
        <span className="demo-tag">
          <CalendarClock size={14} /> Demo Date Control
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
