import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post } from "../../../api/client";
import endpoints from "../../../api/endpoints";
import { useToast } from "../../../components/Toast/useToast";
import Header from "../../../components/Header/Header.jsx";
import Product from "../../../components/Product/Product.jsx";
import "./FavoritesPage.css";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");
  const toast = useToast();

  useEffect(() => {
    get(endpoints.favorites)
      .then((data) => setFavorites(data.favorites || []))
      .catch((err) => {
        // An empty list here otherwise renders the "your favorites list is
        // empty" state, which reads as success.
        toast.error(err?.message || "Could not load your favorites.");
      });
  }, [toast]);

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    setSelectedIds([]);
    setMessage("");
  };

  const toggleSelected = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    setMessage("");
  };

  const selectAll = () => {
    setSelectedIds(favorites.map((product) => product.productId));
    setMessage("");
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setMessage("");
  };

  const removeSelectedFavorites = async () => {
    if (selectedIds.length === 0 || removing) return;

    setRemoving(true);
    setMessage("");
    try {
      let latestFavorites = favorites;

      for (const productId of selectedIds) {
        const data = await post(endpoints.favorites, { productId });
        latestFavorites = data.favorites || [];
      }

      setFavorites(latestFavorites);
      setSelectedIds([]);
      setSelectionMode(false);
      setMessage("Selected favorites removed.");
    } catch (error) {
      console.error("Error removing favorites:", error);
      setMessage(error?.message || "Could not remove selected favorites.");
    } finally {
      setRemoving(false);
    }
  };

  const selectedCount = selectedIds.length;
  const allSelected = favorites.length > 0 && selectedCount === favorites.length;

  return (
    <div className="favorites-page animate-fade-in">
      <Header />
      <div className="container favorites-page-content">
        <div className="favorites-header">
          <h2 className="favorites-title">My Favorites ({favorites.length})</h2>
          {favorites.length > 0 && (
            <div className="favorites-actions">
              {selectionMode && (
                <>
                  <button
                    type="button"
                    className="favorites-action-btn"
                    onClick={allSelected ? clearSelection : selectAll}
                    disabled={removing}
                  >
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                  <button
                    type="button"
                    className="favorites-remove-btn"
                    onClick={removeSelectedFavorites}
                    disabled={selectedCount === 0 || removing}
                  >
                    {removing ? "Removing..." : `Remove selected (${selectedCount})`}
                  </button>
                </>
              )}
              <button
                type="button"
                className="favorites-select-btn"
                onClick={toggleSelectionMode}
                disabled={removing}
              >
                {selectionMode ? "Cancel" : "Select"}
              </button>
            </div>
          )}
        </div>

        {message && <div className="favorites-message">{message}</div>}

        {favorites.length > 0 ? (
          <div className="favorites-grid related-products-grid">
            {favorites.map((product) => (
              <div
                key={product.productId}
                className={`favorite-select-card ${
                  selectedIds.includes(product.productId) ? "selected" : ""
                }`}
                onClickCapture={(event) => {
                  if (!selectionMode) return;
                  event.preventDefault();
                  event.stopPropagation();
                  toggleSelected(product.productId);
                }}
              >
                {selectionMode && (
                  <label
                    className="favorite-select-control"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.productId)}
                      onChange={() => toggleSelected(product.productId)}
                    />
                    <span>Select</span>
                  </label>
                )}
                <Product key={product.productId} product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="favorites-empty-state">
            <div className="favorites-empty-icon">{"\u2661"}</div>
            <h3 className="favorites-empty-title">Your favorites list is empty</h3>
            <p className="favorites-empty-copy">
              Explore our products and add your favorite items here.
            </p>
            <button
              className="btn-primary favorites-empty-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
