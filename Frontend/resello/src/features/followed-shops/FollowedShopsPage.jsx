import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import "./FollowedShopsPage.css";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });

const FollowedShopsPage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingShopId, setPendingShopId] = useState(null);

  const loadFollowedShops = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await get(endpoints.followedShops);
      setShops(data.followedShops || []);
    } catch (err) {
      setError(err?.message || "Unable to load followed shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowedShops();
  }, []);

  const toggleFollow = async (shopId) => {
    setPendingShopId(shopId);
    setError(null);

    try {
      const data = await post(endpoints.followedShops, { shopId });
      setShops(data.followedShops || []);
    } catch (err) {
      setError(err?.message || "Unable to update followed shops");
    } finally {
      setPendingShopId(null);
    }
  };

  return (
    <div className="account-page animate-fade-in">
      <Header />
      <div className="container account-content">
        <AccountHero title="Followed Shop" description="Every shop you follow is saved by the backend and listed here so you can return to it anytime." />

        <section className="account-section">
          {loading ? <EmptyState variant="loading" title="Loading followed shops..." /> : null}
          {error ? (
            <EmptyState
              variant="error"
              title="Could not load followed shops"
              description={error}
            />
          ) : null}
          {!loading && !error && shops.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No followed shops yet"
              description="Use the Follow Shop button on a product or shop page."
            />
          ) : null}

          {!loading && !error && shops.length > 0 ? (
            <div className="account-list">
              {shops.map((shop) => (
                <article key={shop.shopId} className="account-card">
                  <div className="account-card-main">
                    <div className="account-card-title">{shop.shopName}</div>
                    <div className="account-card-subtitle">{shop.location}</div>
                    <div className="account-meta-row">
                      <span>{shop.followers} followers</span>
                      <span>{shop.rating} star rating</span>
                      <span>{shop.products} products</span>
                      <span>Followed {formatDate(shop.followedAt)}</span>
                    </div>
                  </div>
                  <div className="followed-shop-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/shop/${shop.shopId}`)}
                    >
                      Open Shop
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={pendingShopId === shop.shopId}
                      onClick={() => toggleFollow(shop.shopId)}
                    >
                      {pendingShopId === shop.shopId ? "Updating..." : "Unfollow"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default FollowedShopsPage;
