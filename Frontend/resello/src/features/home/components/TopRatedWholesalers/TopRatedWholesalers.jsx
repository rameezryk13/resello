import { useNavigate } from "react-router-dom";
import "./TopRatedWholesalers.css";

// Shops have no logo field in the API, so the avatar is built from the name.
// Capitalised words only, which keeps "Grace by Ahmed" as GA rather than GB.
// An all-lowercase name matches nothing that way, so fall back to the first
// two characters rather than render an empty circle.
const getInitials = (shopName = "") => {
  const words = shopName.trim().split(/\s+/).filter(Boolean);
  const capitalised = words.filter((word) => word[0] === word[0].toUpperCase());
  const source = capitalised.length > 0 ? capitalised : words;

  return source.length > 1
    ? `${source[0][0]}${source[1][0]}`.toUpperCase()
    : (source[0] || "").slice(0, 2).toUpperCase();
};

// Followers arrive as display strings ("1.29k") rather than numbers, so they
// need parsing before they can break a rating tie.
const parseFollowers = (followers) => {
  if (typeof followers === "number") return followers;
  if (typeof followers !== "string") return 0;

  const clean = followers.toLowerCase().replace(/,/g, "").trim();
  if (clean.endsWith("k")) return (Number(clean.slice(0, -1)) || 0) * 1000;
  if (clean.endsWith("m")) return (Number(clean.slice(0, -1)) || 0) * 1000000;
  return Number(clean) || 0;
};

const TopRatedWholesalers = ({ shops = [] }) => {
  const navigate = useNavigate();

  // Highest rated first, most-followed breaking ties. Followers arrive as
  // display strings ("1.29k", "3.2k"), so they need parsing before comparison.
  const rankedShops = [...shops].sort((first, second) => {
    const ratingDifference = (Number(second.rating) || 0) - (Number(first.rating) || 0);
    return ratingDifference || parseFollowers(second.followers) - parseFollowers(first.followers);
  });

  return (
    <aside className="top-rated-wholesalers" aria-label="Top rated wholesalers">
      <h2>Top Rated Wholesalers</h2>
      {rankedShops.length === 0 ? (
        <p className="top-rated-wholesalers-empty">No wholesalers to show yet.</p>
      ) : (
        <ul>
          {rankedShops.map((shop) => (
            <li key={shop.shopId}>
              <button type="button" onClick={() => navigate(`/shop/${shop.shopId}`)}>
                <span className="wholesaler-avatar" aria-hidden="true">
                  {getInitials(shop.shopName)}
                </span>
                <span className="wholesaler-meta">
                  <strong>{shop.shopName}</strong>
                  <small>
                    ★ {shop.rating}
                    <span className="wholesaler-location">{shop.location}</span>
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default TopRatedWholesalers;
