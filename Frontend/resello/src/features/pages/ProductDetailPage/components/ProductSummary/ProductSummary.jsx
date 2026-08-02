import { formatProductPrice } from "../../../../../utils/currency";
import RatingStars from "../RatingStars/RatingStars";
import "./ProductSummary.css";

const ProductSummary = ({ product, displayProductCode }) => (
  <>
    <div className="pdp-product-code">{displayProductCode}</div>
    <h1 className="pdp-title">{product.name}</h1>
    <div className="pdp-rating-row">
      <RatingStars rating={product.rating} />
      <span className="pdp-reviews">({product.reviews} reviews)</span>
    </div>
    <div className="pdp-price-row">
      {product.originalPrice && (
        <span className="pdp-old-price">{formatProductPrice(product.originalPrice)}</span>
      )}
      <span className="pdp-price">{formatProductPrice(product.price)}</span>
    </div>
    {/* Mobile-only: return policy shown before the description.
        Hidden on desktop via CSS (see .pdp-return-policy--mobile). */}

    <p className="pdp-desc">{product.description}</p>
  </>
);

export default ProductSummary;
