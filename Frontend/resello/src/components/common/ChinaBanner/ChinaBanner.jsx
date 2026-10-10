import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ChinaBanner.css";

const ChinaBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="china-banner-wrapper" aria-label="Shop from China">
      <div className="china-banner-card">
        {/* Subtle SVG wave background pattern */}
        <div className="china-banner-pattern" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="china-scallop" width="40" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 0,20 A 20,20 0 0,1 40,20"
                  fill="none"
                  stroke="rgba(194, 65, 12, 0.08)"
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#china-scallop)" />
          </svg>
        </div>

        <div className="china-banner-content">
          <div className="china-banner-left">
            <div className="china-banner-tag">
              <Sparkles size={14} className="china-tag-icon" />
              <span>SHOP FROM CHINA</span>
            </div>
            <h2 className="china-banner-title">
              Millions of products.<br />
              Direct from China.
            </h2>
            <p className="china-banner-subtitle">
              Image search, buy just one, and door-to-door delivery across Pakistan.
            </p>
          </div>

          <div className="china-banner-right">
            {/* Cloud Illustration */}
            <div className="china-cloud-graphics" aria-hidden="true">
              <svg viewBox="0 0 200 130" className="china-cloud-svg">
                <path
                  d="M 40 90 A 25 25 0 0 1 55 45 A 35 35 0 0 1 115 35 A 30 30 0 0 1 160 55 A 25 25 0 0 1 165 95 Z"
                  fill="none"
                  stroke="rgba(180, 83, 9, 0.16)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <circle cx="70" cy="105" r="4" fill="none" stroke="rgba(180, 83, 9, 0.18)" strokeWidth="1.5" />
                <circle cx="150" cy="108" r="3.5" fill="none" stroke="rgba(180, 83, 9, 0.18)" strokeWidth="1.5" />
              </svg>
            </div>

            <button
              type="button"
              className="china-banner-btn"
              onClick={() => navigate("/search?q=China")}
              aria-label="Open China Products"
            >
              <span>Open ReSello China</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChinaBanner;
