const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const ProfitTrendChart = ({ trend, trendPeak, trendMonths }) => {
  return (
    <section className="ps-trend">
      <div className="ps-section-head">
        <h2>Profit by month</h2>
        <span>Last {trendMonths} months</span>
      </div>

      {trendPeak > 0 ? (
        <ol className="ps-trend-chart">
          {trend.map((entry) => {
            const height = trendPeak
              ? Math.max((entry.profit / trendPeak) * 100, entry.profit > 0 ? 6 : 0)
              : 0;

            return (
              <li className="ps-trend-col" key={entry.key}>
                <span className="ps-trend-value">
                  {entry.profit > 0 ? formatPKR(entry.profit) : ""}
                </span>
                <div className="ps-trend-track">
                  <div
                    className={`ps-trend-bar ${
                      entry.profit === trendPeak && entry.profit > 0 ? "is-peak" : ""
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="ps-trend-label">{entry.label}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="ps-trend-empty">
          No profit recorded in the last {trendMonths} months.
        </p>
      )}
    </section>
  );
};

export default ProfitTrendChart;
