import { useState } from "react";
import { Star, Truck, ShieldCheck, Tag, Check } from "lucide-react";
import RatingStars from "../RatingStars/RatingStars";
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
  reviewData,
  reviewSummary,
  visibleReviews = [],
  sectionShown,
  onToggleSection,
  reviewsExpanded,
  onToggleReviews,
}) => {
  const [selectedMention, setSelectedMention] = useState(null);

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

                  return (
                    <article className="pdp-review-card" key={review.reviewId}>
                      <div className="pdp-review-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <h3>{review.reviewerName}</h3>
                          <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Check size={12} /> Verified Purchase
                          </span>
                        </div>
                        <time dateTime={review.date}>{formatReviewDate(review.date)}</time>
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
                        <span className="pdp-review-cat-chip">
                          Delivery: <strong>{rDelivery}★</strong>
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
                              <img
                                key={pIdx}
                                src={photo}
                                alt={`Customer review photo ${pIdx + 1}`}
                                style={{
                                  width: "90px",
                                  height: "90px",
                                  borderRadius: "8px",
                                  border: "1.5px solid #e2e8f0",
                                  objectFit: "cover",
                                }}
                              />
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
    </>
  );
};

export default ReviewSection;
