import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ShopCard.css";

const ShopCard = ({ shop, fallbackShopName }) => {
  const navigate = useNavigate();

  return (
    <div className="pdp-shop-card">
      <div className="pdp-shop-card-top">
        <div className="pdp-shop-avatar">
          {shop?.shopName?.split(" ").map((part, idx) => idx < 2 && part[0]).join("")}
        </div>
        <div className="pdp-shop-basic">
          <span className="pdp-shop-name">{shop?.shopName || fallbackShopName || "Unknown Shop"}</span>
          <span className="pdp-shop-location">
            <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
            {shop?.location || "Unknown location"}
          </span>
        </div>
        {shop?.shopId ? (
          <button
            type="button"
            className="btn-outline pdp-shop-visit-btn"
            onClick={() => navigate(`/shop/${shop.shopId}`)}
          >
            Visit Shop
          </button>
        ) : null}
      </div>

      <div className="pdp-shop-stats-grid">
        <div className="pdp-shop-stat">
          <span className="pdp-shop-stat-value">
            {Number(shop?.rating ?? 0).toFixed(1)}
            <Star size={16} className="filled" aria-hidden="true" />
          </span>
          <span className="pdp-shop-stat-label">Rating</span>
        </div>
        <div className="pdp-shop-stat">
          <span className="pdp-shop-stat-value">{shop?.followers ?? 0}</span>
          <span className="pdp-shop-stat-label">Followers</span>
        </div>
        <div className="pdp-shop-stat">
          <span className="pdp-shop-stat-value">{shop?.products ?? 0}</span>
          <span className="pdp-shop-stat-label">Products</span>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
