import "./ProductDetailsSection.css";

const ProductDetailsSection = ({ description, expanded, onToggle }) => (
  <details className="pdp-details" open>
    <summary className="pdp-details-summary">Product details</summary>
    <div className="pdp-details-body">
      <div className={`pdp-details-content ${expanded ? "expanded" : ""}`}>
        <p>{description}</p>
        <p>
          Orders are packed with care. Returns accepted on eligible items within the stated
          return window. See checkout for shipping options.
        </p>
      </div>
      <button
        type="button"
        className="pdp-mobile-show-all-btn"
        onClick={onToggle}
      >
        {expanded ? "Hide" : "Show"}
      </button>
    </div>
  </details>
);

export default ProductDetailsSection;
