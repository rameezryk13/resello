import { useEffect, useState } from "react";
import { Camera, Image as ImageIcon, Star, Trash2, X } from "lucide-react";
import { post } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import "./ReviewModal.css";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent!",
};

const CATEGORY_ITEMS = [
  { key: "delivery", label: "Delivery", icon: "🚚", desc: "Speed & Courier Service" },
  { key: "quality", label: "Quality", icon: "⭐", desc: "Overall Product Quality" },
  { key: "price", label: "Price", icon: "💰", desc: "Value for Money & Pricing" },
];

const ReviewModal = ({ open, order, product, onClose, onSubmitSuccess }) => {
  const toast = useToast();
  const [categoryRatings, setCategoryRatings] = useState({
    delivery: 5,
    quality: 5,
    price: 5,
  });
  const [categoryHovers, setCategoryHovers] = useState({
    delivery: 0,
    quality: 0,
    price: 0,
  });
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product?.productId) {
      setSelectedProductId(product.productId);
    } else if (order?.cart?.length) {
      setSelectedProductId(order.cart[0]?.product?.productId || "");
    }
  }, [order, product]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const cartItems = order?.cart || (product ? [{ product }] : []);
  const activeProduct = cartItems.find(
    (item) => item?.product?.productId === selectedProductId
  )?.product || cartItems[0]?.product;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 5MB limit.`);
        return false;
      }
      return true;
    });

    const remainingSlots = 6 - images.length;
    const filesToRead = validFiles.slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => {
            if (prev.length >= 6) return prev;
            return [...prev, reader.result];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (idxToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const setCategoryValue = (key, val) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: val }));
  };

  const setCategoryHover = (key, val) => {
    setCategoryHovers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId && !activeProduct?.productId) {
      toast.error("Please select a product to review.");
      return;
    }

    if (images.length < 3) {
      toast.error("Please attach a minimum of 3 pictures of the product for your review.");
      return;
    }

    const targetId = selectedProductId || activeProduct?.productId;
    setSubmitting(true);

    const overallAvg = Math.round(
      ((categoryRatings.delivery + categoryRatings.quality + categoryRatings.price) / 3) * 10
    ) / 10;

    try {
      await post(endpoints.products.addReview(targetId), {
        rating: overallAvg,
        ratings: categoryRatings,
        comment,
        images,
        image: images[0],
      });

      toast.success("Thank you! Your category ratings and review have been submitted.");
      setComment("");
      setImages([]);
      setCategoryRatings({ delivery: 5, quality: 5, price: 5 });
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const overallAvgDisplay = (
    (categoryRatings.delivery + categoryRatings.quality + categoryRatings.price) / 3
  ).toFixed(1);

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div
        className="review-modal-card animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="review-modal-head">
          <div>
            <h2 id="review-modal-title">Write a Product Review</h2>
            {order?.orderId && (
              <p className="review-modal-subtitle">
                Order #{order.orderId} · Delivered
              </p>
            )}
          </div>
          <button
            type="button"
            className="review-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-modal-body">
          {cartItems.length > 1 && (
            <div className="review-field-group">
              <label htmlFor="review-product-select">Select Product to Review</label>
              <select
                id="review-product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="review-select-input"
              >
                {cartItems.map((item) => (
                  <option key={item.product?.productId} value={item.product?.productId}>
                    {item.product?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeProduct && (
            <div className="review-product-preview-bar">
              {activeProduct.images?.[0] ? (
                <img
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  className="review-product-thumb"
                />
              ) : (
                <div className="review-product-thumb-placeholder">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="review-product-details">
                <strong>{activeProduct.name}</strong>
                {activeProduct.category && <small>{activeProduct.category}</small>}
              </div>
            </div>
          )}

          {/* 4-CATEGORY DETAILED STAR RATINGS */}
          <div className="review-categories-block">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155" }}>
                Rate Categories
              </label>
              <span className="overall-score-pill">
                Overall: {overallAvgDisplay} ★
              </span>
            </div>

            <div className="review-category-grid">
              {CATEGORY_ITEMS.map((cat) => {
                const currentVal = categoryHovers[cat.key] || categoryRatings[cat.key];
                return (
                  <div key={cat.key} className="review-category-row">
                    <div className="review-category-info">
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <div>
                        <strong>{cat.label}</strong>
                        <small>{cat.desc}</small>
                      </div>
                    </div>

                    <div className="review-star-row-mini">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <button
                          key={starIndex}
                          type="button"
                          className={`review-star-btn-mini ${
                            starIndex <= currentVal ? "filled" : ""
                          }`}
                          onClick={() => setCategoryValue(cat.key, starIndex)}
                          onMouseEnter={() => setCategoryHover(cat.key, starIndex)}
                          onMouseLeave={() => setCategoryHover(cat.key, 0)}
                          aria-label={`Rate ${cat.label} ${starIndex} out of 5 stars`}
                        >
                          <Star size={20} />
                        </button>
                      ))}
                      <span className="category-rating-label">
                        {RATING_LABELS[currentVal]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="review-field-group">
            <label htmlFor="review-comment">Add Review Details</label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved about delivery, product quality, or pricing..."
              required
            />
          </div>

          <div className="review-field-group">
            <div className="review-photos-label-row">
              <label>Product Pictures (Minimum 3 required) *</label>
              <span className={`review-photos-count ${images.length >= 3 ? "valid" : ""}`}>
                {images.length}/3 photos added
              </span>
            </div>

            {images.length > 0 && (
              <div className="review-photos-grid">
                {images.map((imgSrc, idx) => (
                  <div key={idx} className="review-photo-thumb-card">
                    <img src={imgSrc} alt={`Review photo ${idx + 1}`} />
                    <button
                      type="button"
                      className="review-photo-delete-btn"
                      onClick={() => removeImage(idx)}
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 6 && (
              <label className="review-upload-dropzone">
                <Camera size={22} />
                <span>
                  {images.length === 0
                    ? "Click to Upload Product Photos (Min 3 required)"
                    : `Add More Photos (${images.length}/6)`}
                </span>
                <small>PNG, JPG or WEBP (Max 5MB each)</small>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="review-file-input"
                />
              </label>
            )}
          </div>

          <div className="review-modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
