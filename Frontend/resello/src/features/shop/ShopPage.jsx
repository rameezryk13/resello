import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import CatalogLayout from "@/components/catalog/CatalogLayout/CatalogLayout.jsx";
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
    let cancelled = false;

    const loadShop = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!shopId) {
          const data = await get(endpoints.home.products);
          if (!cancelled) {
            setProducts(data.products || []);
          }
        } else {
          const data = await get(endpoints.shops.byId(shopId));
          if (!cancelled) {
            setShop(data.shop || null);
            setProducts(data.products || []);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load shop");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadShop();
    return () => {
      cancelled = true;
    };
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

  const headerBanner = shop ? (
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
      </div>
    </div>
  ) : null;

  return (
    <div className="shop-page animate-fade-in">
      <Header />
      {loading ? (
        <div className="container" style={{ padding: "60px 0" }}>
          <div className="shop-loading">Loading shop products...</div>
        </div>
      ) : error ? (
        <div className="container" style={{ padding: "60px 0" }}>
          <div className="shop-error">{error}</div>
        </div>
      ) : (
        <CatalogLayout
          products={products}
          pageTitle={shop?.shopName || "All Products"}
          badgeText={shop?.shopName ? `${shop.shopName} Deals` : "Seller Deals"}
          breadcrumbItems={[
            { label: "Home", path: "/" },
            { label: "Shops" },
            { label: shop?.shopName || "All Products" },
          ]}
          headerBanner={headerBanner}
        />
      )}
    </div>
  );
};

export default ShopPage;
