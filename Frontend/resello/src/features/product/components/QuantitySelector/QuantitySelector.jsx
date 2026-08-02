import "./QuantitySelector.css";

const QuantitySelector = ({
  quantity,
  hasVariantStock,
  currentVariantStock,
  onChangeQuantity,
}) => (
  <div className="pdp-option-group quantity-row">
    <div className="option-heading">Quantity:</div>
    <div className="quantity-selector" aria-label="Select quantity">
      <button
        type="button"
        onClick={() => onChangeQuantity(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        type="number"
        min="1"
        max={hasVariantStock && currentVariantStock > 0 ? currentVariantStock : undefined}
        value={quantity}
        onChange={(event) => onChangeQuantity(event.target.value)}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChangeQuantity(quantity + 1)}
        disabled={hasVariantStock && quantity >= currentVariantStock}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>
);

export default QuantitySelector;
