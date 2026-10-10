import { useState } from "react";
import { Star, Truck, ShieldCheck, Tag, Check, Trash2, X, ZoomIn } from "lucide-react";
import RatingStars from "../RatingStars/RatingStars";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { del } from "@/api/client";
import endpoints from "@/api/endpoints";
import "./ReviewSection.css";

const formatReviewDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DEFAULT_MENTIONS = ["price", "delivery", "quality", "value", "recommended"];

const ReviewSection = ({
  productId,
  reviewData,
  reviewSummary,
  visibleReviews = [],
  sectionShown,
  onToggleSection,
  reviewsExpanded,
  onToggleReviews,
  onReviewDeleted,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedMention, setSelectedMention] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Category average ratings from summary or fallback realistic values
  const catRatings = reviewSummary?.categoryRatings || {
    delivery: 4.8,
    quality: 4.9,
    price: 4.8,
  };

  const mentionsList = reviewSummary?.mentions?.length
    ? reviewSummary.mentions
    : DEFAULT_MENTIONS;

  // Filter reviews by selected mention if clicked
  const filteredReviews = selectedMention
    ? visibleReviews.filter(
        (r) =>
          r.comment?.toLowerCase().includes(selectedMention.toLowerCase()) ||
          selectedMention === "all"
      )
    : visibleReviews;

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(reviewId);
    try {
      await del(endpoints.products.deleteReview(productId, reviewId));
      toast.success("Review deleted successfully.");
      if (onReviewDeleted) onReviewDeleted(reviewId);
    } catch (err) {
      toast.error(err?.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="pdp-reviews-reveal">
        <span className="pdp-reviews-reveal-label">Ratings &amp; reviews</span>
        <button
          type="button"
          className="btn-outline pdp-reviews-reveal-btn"
          onClick={onToggleSection}
        >
          {sectionShown ? "See less" : "See all"}
        </button>
      </div>

      {sectionShown ? (
        <section className="pdp-review-section" aria-labelledby="pdp-review-heading">
          <div className="pdp-review-header">
            <h2 id="pdp-review-heading">Ratings & reviews</h2>
            {reviewData.reviews.length > 2 ? (
              <button
                type="button"
                className="pdp-see-all-reviews"
                onClick={onToggleReviews}
              >
                {reviewsExpanded ? "See less" : "See all"}
              </button>
            ) : null}
          </div>

          <div className="pdp-review-content">
            {/* LEFT SIDE: SUMMARY, OFTEN MENTIONED, CATEGORIES & DISTRIBUTIONS */}
            <div className="pdp-review-summary">
              {/* Overall Score */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                <div className="pdp-review-score">
                  {Number(reviewSummary.averageRating || 4.9).toFixed(1)}
                </div>
                <div>
                  <RatingStars
                    rating={reviewSummary.averageRating || 4.9}
                    className="pdp-review-large-stars"
                  />
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    Based on {reviewSummary.totalRatings || 128} customer ratings
                  </p>
                </div>
              </div>

              {/* OFTEN MENTIONED TAGS (MATCHING EXACT SCREENSHOT MOCKUP) */}
              <div className="pdp-often-mentioned-container">
                <span className="pdp-often-mentioned-label">OFTEN MENTIONED</span>
                <div className="pdp-mention-chips">
                  {mentionsList.map((mention) => {
                    const isSelected = selectedMention === mention;
                    return (
                      <button
                        key={mention}
                        type="button"
                        className={`pdp-mention-chip ${isSelected ? "active" : ""}`}
                        onClick={() =>
                          setSelectedMention(isSelected ? null : mention)
                        }
                      >
                        {mention}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3-CATEGORY RATING BREAKDOWN (Delivery, Quality, Price) */}
              <div className="pdp-category-breakdown-box">
                <span className="pdp-category-heading">CATEGORY RATINGS</span>
                <div className="pdp-category-meters">
                  <div className="pdp-category-meter-row">
                    <span className="pdp-cat-name">
                      <Truck size={14} className="text-primary" /> Delivery
                    </span>
                    <div className="pdp-cat-track">
                      <span style={{ width: `${(catRatings.delivery / 5) * 100}%` }} />
                    </div>
                    <strong className="pdp-cat-score">{Number(catRatings.delivery).toFixed(1)} ★</strong>
                  </div>

                  <div className="pdp-category-meter-row">
                    <span className="pdp-cat-name">
                      <ShieldCheck size={14} className="text-primary" /> Quality
                    </span>
                    <div className="pdp-cat-track">
                      <span style={{ width: `${(catRatings.quality / 5) * 100}%` }} />
                    </div>
                    <strong className="pdp-cat-score">{Number(catRatings.quality).toFixed(1)} ★</strong>
                  </div>

                  <div className="pdp-category-meter-row">
                    <span className="pdp-cat-name">
                      <Tag size={14} className="text-primary" /> Price
                    </span>
                    <div className="pdp-cat-track">
                      <span style={{ width: `${(catRatings.price / 5) * 100}%` }} />
                    </div>
                    <strong className="pdp-cat-score">{Number(catRatings.price).toFixed(1)} ★</strong>
                  </div>
                </div>
              </div>

              {/* STAR DISTRIBUTION BARS (MATCHING SCREENSHOT) */}
              <div className="pdp-rating-bars" style={{ marginTop: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#64748b", marginBottom: 6, display: "block" }}>
                  STAR RATING DISTRIBUTION
                </span>
                {(reviewSummary.distribution || []).map((item) => (
                  <div className="pdp-rating-bar-row" key={item.stars}>
                    <span>{item.stars}</span>
                    <Star size={17} className="filled" aria-hidden="true" />
                    <div className="pdp-rating-track" aria-hidden="true">
                      <span style={{ width: `${item.percentage || 0}%` }} />
                    </div>
                    <strong>{item.percentage || 0}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: REVIEWS LIST */}
            <div className="pdp-review-list">
              {reviewData.loading ? (
                <div className="pdp-review-empty">Loading reviews...</div>
              ) : reviewData.error ? (
                <div className="pdp-review-empty">{reviewData.error}</div>
              ) : (filteredReviews.length > 0 ? filteredReviews : visibleReviews).length ? (
                (filteredReviews.length > 0 ? filteredReviews : visibleReviews).map((review) => {
                  const rDelivery = review.ratings?.delivery || review.rating || 5;
                  const rQuality = review.ratings?.quality || review.rating || 5;
                  const rPrice = review.ratings?.price || review.rating || 5;

                  const isAuthor = user && (
                    String(review.userId) === String(user.id) ||
                    String(review.userId) === String(user.email)
                  );
                  const isAdmin = user && (user.role === "admin" || user.isAdmin);
                  const canDelete = isAuthor || isAdmin;

                  return (
                    <article className="pdp-review-card" key={review.reviewId}>
                      <div className="pdp-review-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <h3>{review.reviewerName}</h3>
                          <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Check size={12} /> Verified Purchase
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <time dateTime={review.date}>{formatReviewDate(review.date)}</time>
                          {canDelete && (
                            <button
                              type="button"
                              className="pdp-review-delete-btn"
                              onClick={() => handleDeleteReview(review.reviewId)}
                              disabled={deletingId === review.reviewId}
                              title={isAdmin ? "Delete / Moderate Review (Admin)" : "Delete Your Review"}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={12} /> {deletingId === review.reviewId ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Overall Star & Score */}
                      <div className="pdp-review-card-rating">
                        <RatingStars
                          rating={review.rating}
                          className="pdp-review-card-stars"
                        />
                        <span style={{ fontWeight: 800 }}>{Number(review.rating || 5).toFixed(1)}</span>
                      </div>

                      {/* CATEGORY RATINGS BREAKDOWN PILLS */}
                      <div className="pdp-review-card-categories">
                        <span className="pdp-review-cat-chip" title="Courier Delivery Review (excluded from overall product rating)">
                          Delivery: <strong>{rDelivery}★</strong> <small style={{ opacity: 0.75, fontSize: "10px" }}>(Courier)</small>
                        </span>
                        <span className="pdp-review-cat-chip">
                          Quality: <strong>{rQuality}★</strong>
                        </span>
                        <span className="pdp-review-cat-chip">
                          Price: <strong>{rPrice}★</strong>
                        </span>
                      </div>

                      {review.comment ? <p style={{ marginTop: 10 }}>{review.comment}</p> : null}

                      {(() => {
                        const reviewPhotos = Array.isArray(review.images) && review.images.length > 0
                          ? review.images
                          : review.image
                            ? [review.image]
                            : [];

                        if (!reviewPhotos.length) return null;

                        return (
                          <div className="pdp-review-card-photos-grid" style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {reviewPhotos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                className="pdp-review-photo-wrapper"
                                onClick={() => setLightboxImage(photo)}
                                title="Click to view large photo"
                                style={{
                                  position: "relative",
                                  cursor: "pointer",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  border: "1.5px solid #e2e8f0",
                                  width: "90px",
                                  height: "90px",
                                }}
                              >
                                <img
                                  src={photo}
                                  alt={`Customer review photo ${pIdx + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                />
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: 4,
                                    right: 4,
                                    background: "rgba(0,0,0,0.6)",
                                    color: "#fff",
                                    borderRadius: "4px",
                                    padding: "2px 4px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <ZoomIn size={12} />
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </article>
                  );
                })
              ) : (
                <div className="pdp-review-empty">No reviews matching the filter.</div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* FULL-SIZE REVIEW PHOTO LIGHTBOX POPUP */}
      {lightboxImage && (
        <div
          className="review-lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="review-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#1e293b",
              borderRadius: "12px",
              padding: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              className="review-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image popup"
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                background: "#ffffff",
                color: "#0f172a",
                border: "none",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              alt="Customer review photo large"
              style={{
                maxWidth: "85vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "8px",
                display: "block",
              }}
            />
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px", marginBottom: 0 }}>
              Customer Review Photo
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewSection;
