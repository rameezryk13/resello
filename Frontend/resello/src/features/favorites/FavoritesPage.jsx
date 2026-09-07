import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import Header from "@/components/layout/Header/Header.jsx";
import Product from "@/components/catalog/Product/Product.jsx";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
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
      window.dispatchEvent(
        new CustomEvent("resello:favorites-updated", {
          detail: { count: latestFavorites.length },
        })
      );
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
          <EmptyState
            icon={Heart}
            title="Your favorites list is empty"
            description="Explore our products and add your favorite items here."
            action={
              <button
                className="btn-primary"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Favorites;
