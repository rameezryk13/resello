import { useEffect, useState } from "react";
import "./ProductUtilityRow.css";

const svgToPngDataUrl = (svg, size = 22) =>
  new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas not available"));
          return;
        }

        // Draw the SVG into a canvas, then export as PNG.
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e || new Error("Failed to render SVG"));
      };

      img.src = url;
    } catch (e) {
      reject(e);
    }
  });

const ProductUtilityRow = ({
  isFav,
  favLoading,
  favoriteCount,
  favoriteMessage,
  downloadLoading,
  onShare,
  onToggleFavorite,
  onDownload,
}) => {
  const [pngIcons, setPngIcons] = useState(null);

  // Generate PNG icons at runtime (no SVG icons in UI).
  useEffect(() => {
    let cancelled = false;
    const size = 20;
    const styles = getComputedStyle(document.documentElement);
    const grey = styles.getPropertyValue("--color-text-muted").trim();

    const svgLink = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${grey}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <path d="M8.59 13.51l6.83 3.98"/>
      <path d="M15.41 6.51L8.59 10.49"/>
    </svg>`;

    const svgDownload = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${grey}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v10"/>
      <path d="M8 11l4 4 4-4"/>
      <path d="M4 20h16"/>
    </svg>`;

    Promise.all([svgToPngDataUrl(svgLink, size), svgToPngDataUrl(svgDownload, size)])
      .then(([linkPng, downloadPng]) => {
        if (cancelled) return;
        setPngIcons({
          linkPng,
          downloadPng,
        });
      })
      .catch(() => {
        // If PNG generation fails, we will keep buttons functional (fallback icons).
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pdp-utility-row" role="group" aria-label="Product utilities">
      <div className="pdp-utility-top-row">
        <button
          type="button"
          className="pdp-utility-btn pdp-share-btn"
          onClick={onShare}
          aria-label="Share product"
        >
          {pngIcons ? (
            <img className="pdp-utility-icon" src={pngIcons.linkPng} alt="" />
          ) : null}
          <span>Share</span>
        </button>

        <button
          type="button"
          className={`pdp-favorite-control ${isFav ? "is-favorite" : ""}`}
          onClick={onToggleFavorite}
          disabled={favLoading}
          aria-pressed={isFav}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="pdp-favorite-control-icon" aria-hidden="true">♥</span>
          <span className="pdp-favorite-control-label">
            {isFav ? "Saved to Favorites" : "Add to Favorites"}
          </span>
          <span className="pdp-favorite-control-count">{favoriteCount}</span>
          {favoriteMessage ? (
            <span className="pdp-favorite-control-message">{favoriteMessage}</span>
          ) : null}
        </button>
      </div>

      <div className="pdp-utility-bottom-row">
        <button
          type="button"
          className="pdp-utility-btn pdp-download-btn"
          onClick={onDownload}
          disabled={downloadLoading}
          aria-label="Download product media"
        >
          {pngIcons ? (
            <img
              className="pdp-utility-icon"
              src={pngIcons.downloadPng}
              alt=""
            />
          ) : null}
          <span>{downloadLoading ? "Downloading..." : "Download Media"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductUtilityRow;
