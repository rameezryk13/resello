import { Star } from "lucide-react";
import "./RatingStars.css";

const RatingStars = ({ rating, className = "" }) => {
  const roundedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return (
    <span className={`pdp-star-icons ${className}`} aria-label={`${rating || 0} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={18}
          strokeWidth={2}
          className={index < roundedRating ? "filled" : ""}
          aria-hidden="true"
        />
      ))}
    </span>
  );
};

export default RatingStars;
