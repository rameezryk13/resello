import { Share2, Heart, Download } from "lucide-react";
import "./ProfitInputRow.css";

const ProfitInputRow = ({
  profitValue,
  onChangeProfit,
  isFav,
  favLoading,
  downloadLoading,
  onShare,
  onToggleFavorite,
  onDownload,
}) => (
  <div className="pdp-option-group profit-row">
    <input
      id="profit-input"
      type="number"
      min="0"
      className="profit-input"
      placeholder="Add profit"
      value={profitValue}
      onChange={(e) => onChangeProfit(e.target.value)}
    />

    <div className="pdp-profit-icon-actions" role="group" aria-label="Product utilities">
      <button
        type="button"
        className="pdp-icon-only-btn"
        onClick={onShare}
        aria-label="Share product"
      >
        <Share2 size={18} strokeWidth={2} />
      </button>

      <button
        type="button"
        className={`pdp-icon-only-btn ${isFav ? "is-favorite" : ""}`}
        onClick={onToggleFavorite}
        disabled={favLoading}
        aria-pressed={isFav}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={18} strokeWidth={2} fill={isFav ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        className="pdp-icon-only-btn"
        onClick={onDownload}
        disabled={downloadLoading}
        aria-label="Download product media"
      >
        <Download size={18} strokeWidth={2} />
      </button>
    </div>
  </div>
);

export default ProfitInputRow;
