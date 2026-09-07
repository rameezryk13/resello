import { TrendingUp } from "lucide-react";

const formatPKR = (value) => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return Math.round(safe).toLocaleString("en-PK");
};

const ProfitHeadlineCard = ({ salesRange, totals, margin, avgProfitPerOrder }) => {
  return (
    <section className="ps-headline">
      <div className="ps-headline-label">
        <span className="ps-headline-icon">
          <TrendingUp size={18} aria-hidden="true" />
        </span>
        <div>
          <strong>Your profit</strong>
          <span>{salesRange}</span>
        </div>
      </div>

      <div className="ps-headline-amount">
        <span className="ps-currency">PKR</span>
        <span className="ps-amount">{formatPKR(totals.totalProfit)}</span>
      </div>

      <div className="ps-headline-meta">
        <span className="ps-margin-chip">
          {margin.toFixed(1)}% margin
        </span>
        <span>
          PKR {formatPKR(avgProfitPerOrder)} avg per order
        </span>
      </div>

      <div className="ps-headline-foot">
        <span>on PKR {formatPKR(totals.totalSales)} of sales</span>
      </div>
    </section>
  );
};

export default ProfitHeadlineCard;
