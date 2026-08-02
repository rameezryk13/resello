import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import Product from "@/components/catalog/Product/Product.jsx";
import "./ShopPage.css";

const ShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowingShop, setIsFollowingShop] = useState(false);

  useEffect(() => {
    if (!shopId) return;

    const loadShop = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.shops.byId(shopId));
        setShop(data.shop || null);
        setProducts(data.products || []);
      } catch (err) {
        setError(err?.message || "Unable to load shop");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    const loadFollowState = async () => {
      try {
        const data = await get(endpoints.followedShops);
        if (!cancelled) {
          const followedIds = (data.followedShops || []).map((entry) => entry.shopId);
          setIsFollowingShop(followedIds.includes(shopId));
        }
      } catch {
        if (!cancelled) {
          setIsFollowingShop(false);
        }
      }
    };

    loadFollowState();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const toggleFollowShop = async () => {
    if (!shopId || followLoading) return;
    setFollowLoading(true);

    try {
      const data = await post(endpoints.followedShops, { shopId });

      const followedIds = (data.followedShops || []).map((entry) => entry.shopId);
      setIsFollowingShop(followedIds.includes(shopId));
    } catch (err) {
      setError(err?.message || "Unable to update followed shop");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="shop-page animate-fade-in">
      <Header />
      <div className="container shop-content">
        {loading ? (
          <div className="shop-loading">Loading shop...</div>
        ) : error ? (
          <div className="shop-error">{error}</div>
        ) : (
          <>
            <div className="shop-summary-card">
              <div className="shop-summary-left">
                <div className="shop-avatar">
                  {shop?.shopName?.split(" ").map((part, idx) => idx < 2 && part[0]).join("")}
                </div>
                <div>
                  <h2>{shop?.shopName}</h2>
                  <p>{shop?.location}</p>
                </div>
              </div>

              <div className="shop-summary-stats">
                <span>{shop?.followers} followers</span>
                <span>{shop?.rating} star rating</span>
                <span>{shop?.products} products</span>
              </div>

              <div className="shop-summary-actions">
                <button
                  type="button"
                  className={`btn-outline ${isFollowingShop ? "shop-action-active" : ""}`}
                  onClick={toggleFollowShop}
                  disabled={followLoading}
                >
                  {followLoading ? "Updating..." : isFollowingShop ? "Following Shop" : "Follow Shop"}
                </button>
                <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
                  Back
                </button>
              </div>
            </div>

            <div className="shop-products-grid">
              {products.length === 0 ? (
                <div className="empty-state">No products available for this shop.</div>
              ) : (
                products.map((product) => (
                  <Product key={product.productId} product={product} showCategory />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
