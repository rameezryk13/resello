import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, post } from "../../api/client";
import endpoints from "../../api/endpoints";
import { formatProductPrice } from "../../utils/currency";
import "./Product.css";

const Product = ({ product, showCategory = false }) => {
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const favoriteMessageTimer = useRef(null);
  const stock = Number(product?.stock);

  useEffect(() => {
    if (!product?.productId) return;

    get(endpoints.favorites)
      .then((data) => {
        const favIds = (data.favorites || []).map((p) => p.productId);
        setIsFav(favIds.includes(product.productId));
      })
      .catch((err) => console.error("Error checking favorites:", err));
  }, [product?.productId]);

  useEffect(() => {
    return () => {
      if (favoriteMessageTimer.current) {
        clearTimeout(favoriteMessageTimer.current);
      }
    };
  }, []);

  const showFavoriteMessage = (message) => {
    setFavoriteMessage(message);
    if (favoriteMessageTimer.current) {
      clearTimeout(favoriteMessageTimer.current);
    }
    favoriteMessageTimer.current = setTimeout(() => {
      setFavoriteMessage("");
    }, 1800);
  };

  const toggleFavorite = async () => {
    if (!product?.productId) return;

    try {
      const data = await post(endpoints.favorites, {
        productId: product.productId,
      });
      const favIds = (data.favorites || []).map((p) => p.productId);
      const nextIsFav = favIds.includes(product.productId);
      setIsFav(nextIsFav);
      showFavoriteMessage(
        nextIsFav ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      showFavoriteMessage("Could not update favorite");
    }
  };

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div
      className="product-card animate-fade-in-up"
      onClick={() => navigate(`/product/${product.productId}`)}
    >
      <div className="product-img-container">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <img src={product.img} alt={product.name} className="product-img" loading="lazy" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          className={`favorite-btn ${isFav ? "active" : "inactive"}`}
          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          aria-pressed={isFav}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? "♥" : "♡"}
        </button>
        {favoriteMessage && (
          <div className="favorite-card-message">{favoriteMessage}</div>
        )}
      </div>

      <div className="product-info">
        {showCategory && product.category && (
          <span className="product-category">{product.category}</span>
        )}
        <h4 className="product-name">{product.name}</h4>
        <div className="product-rating">
          <span className="stars">{renderStars(product.rating)}</span>
          {product.reviews && <span className="reviews">({product.reviews})</span>}
        </div>
        {Number.isFinite(stock) && (
          <div className={`product-stock ${stock > 0 ? "in-stock" : "out-of-stock"}`}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </div>
        )}
        <div className="price-wrapper">
          {product.originalPrice && <span className="old-price">{formatProductPrice(product.originalPrice)}</span>}
          <span className="new-price">{formatProductPrice(product.price)}</span>
        </div>
      </div>
    </div>
  );
};

export default Product;
