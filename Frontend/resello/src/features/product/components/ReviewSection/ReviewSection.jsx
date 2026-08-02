import { Star } from "lucide-react";
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

const ReviewSection = ({
  reviewData,
  reviewSummary,
  visibleReviews = [],
  sectionShown,
  onToggleSection,
  reviewsExpanded,
  onToggleReviews,
}) => (
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
          <div className="pdp-review-summary">
            <div className="pdp-review-score">
              {Number(reviewSummary.averageRating || 0).toFixed(1)}
            </div>
            <RatingStars
              rating={reviewSummary.averageRating}
              className="pdp-review-large-stars"
            />
            <p>Based on {reviewSummary.totalRatings || 0} ratings</p>

            {reviewSummary.mentions?.length ? (
              <div className="pdp-review-mentions">
                <span>Often mentioned</span>
                <div>
                  {reviewSummary.mentions.map((mention) => (
                    <span key={mention}>{mention}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pdp-rating-bars">
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

          <div className="pdp-review-list">
            {reviewData.loading ? (
              <div className="pdp-review-empty">Loading reviews...</div>
            ) : reviewData.error ? (
              <div className="pdp-review-empty">{reviewData.error}</div>
            ) : visibleReviews.length ? (
              visibleReviews.map((review) => (
                <article className="pdp-review-card" key={review.reviewId}>
                  <div className="pdp-review-card-header">
                    <h3>{review.reviewerName}</h3>
                    <time dateTime={review.date}>{formatReviewDate(review.date)}</time>
                  </div>
                  <div className="pdp-review-card-rating">
                    <RatingStars
                      rating={review.rating}
                      className="pdp-review-card-stars"
                    />
                    <span>{Number(review.rating || 0).toFixed(1)}</span>
                  </div>
                  {review.comment ? <p>{review.comment}</p> : null}
                </article>
              ))
            ) : (
              <div className="pdp-review-empty">No reviews yet.</div>
            )}
          </div>
        </div>
      </section>
    ) : null}
  </>
);

export default ReviewSection;
