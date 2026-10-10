import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import "./AdBanner.css";

const AdBanner = () => {
  const navigate = useNavigate();

  const handleBrowse = () => {
    navigate("/shop");
  };

  return (
    <aside className="ad-banner-section animate-fade-in" aria-label="Editor's Pick Promotional Banner">
      <div className="ad-banner-card">
        <div className="ad-banner-content">
          <div className="ad-banner-tag">
            <Sparkles size={14} className="ad-banner-tag-icon" />
            <span>EDITOR'S PICK</span>
          </div>

          <h2 className="ad-banner-title">
            The looks everyone's<br />reaching for
          </h2>

          <p className="ad-banner-subtitle">
            Curated favourites across fashion, beauty and home — refreshed weekly.
          </p>
        </div>

        <div className="ad-banner-action">
          <button
            type="button"
            className="ad-banner-btn"
            onClick={handleBrowse}
            aria-label="Browse all categories"
          >
            <span>Browse all categories</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdBanner;
