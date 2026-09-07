import { Share2, Heart, Download } from "lucide-react";
import "./ProfitInputRow.css";

/**
 * Profit input with the three secondary product actions — share, favourite,
 * download media — as icons on the right of the same row.
 *
 * These used to be full-width labelled buttons ("Share", "Add to Favorites",
 * "Download Media") stacked in their own block below the buy controls, which
 * gave three supporting actions more visual weight than Add to Cart and left a
 * tall column of button on the page. As icons they read as what they are:
 * available, not competing with the primary action. Each keeps its accessible
 * name via aria-label, plus a title so hovering still explains the icon.
 */
const ProfitInputRow = ({
  profitValue,
  onChangeProfit,
  isFav,
  favLoading,
  favoriteCount,
  favoriteMessage,
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
        title="Share product"
      >
        <Share2 size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <button
        type="button"
        className={`pdp-icon-only-btn ${isFav ? "is-favorite" : ""}`}
        onClick={onToggleFavorite}
        disabled={favLoading}
        aria-pressed={isFav}
        aria-label={
          isFav
            ? `Remove from favorites (${favoriteCount})`
            : `Add to favorites (${favoriteCount})`
        }
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={18} strokeWidth={2} fill={isFav ? "currentColor" : "none"} aria-hidden="true" />
        {/* The count carried its own label on the old button. Here it rides on
            the icon so the social proof survives the switch. */}
        <span className="pdp-icon-btn-count" aria-hidden="true">
          {favoriteCount}
        </span>
      </button>

      <button
        type="button"
        className="pdp-icon-only-btn"
        onClick={onDownload}
        disabled={downloadLoading}
        aria-label={downloadLoading ? "Downloading media" : "Download product media"}
        title={downloadLoading ? "Downloading…" : "Download media"}
      >
        <Download size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Confirmation for the favourite toggle, which is otherwise silent now
          that the button has no label to change. Anchored to the right edge so
          it opens inwards instead of off the side of the column. */}
      {favoriteMessage ? (
        <span className="pdp-icon-actions-message" role="status">
          {favoriteMessage}
        </span>
      ) : null}
    </div>
  </div>
);

export default ProfitInputRow;
