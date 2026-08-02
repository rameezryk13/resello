import "./VariantSelector.css";

const VariantSelector = ({
  sizes,
  colors = [],
  selectedSize,
  selectedColor,
  selectedColorLabel,
  hasVariantStock,
  currentVariantStock,
  normalizeColorValue,
  onSelectSize,
  onSelectColor,
}) => (
  <>
    {sizes?.length ? (
      <div className="pdp-option-group">
        <div className="option-heading">Size:</div>
        <div className="size-selector">
          {sizes.map((sizeOption) => (
            <button
              key={sizeOption.size}
              type="button"
              className={`size-btn ${selectedSize === sizeOption.size ? "active" : ""}`}
              onClick={() => onSelectSize(sizeOption)}
            >
              {sizeOption.size}
            </button>
          ))}
        </div>
      </div>
    ) : null}

    {colors.length ? (
      <div className="pdp-option-group">
        <div className="option-heading">Select color:</div>
        <div className="color-selector">
          {colors.map((color) => {
            const colorValue = normalizeColorValue(color);
            const colorLabel = typeof color === "string" ? color : color.name;
            return (
              <button
                key={colorValue}
                type="button"
                className={`color-btn ${selectedColor === colorValue ? "active" : ""}`}
                aria-label={colorLabel}
                onClick={() => onSelectColor(colorValue)}
              >
                <span
                  className="color-btn-swatch"
                  style={{ backgroundColor: colorValue }}
                  aria-hidden="true"
                />
                <span>{colorLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    ) : null}

    {hasVariantStock ? (
      <div
        className={`pdp-stock-line ${
          currentVariantStock > 0 ? "in-stock" : "out-of-stock"
        }`}
      >
        <span className="pdp-stock-label">Stock:</span>
        <span>
          {currentVariantStock > 0
            ? `${currentVariantStock} available`
            : "Out of stock"}
          {selectedSize || selectedColorLabel ? (
            <span className="pdp-stock-context">
              {" "}
              for {[selectedSize, selectedColorLabel].filter(Boolean).join(" / ")}
            </span>
          ) : null}
        </span>
      </div>
    ) : null}
  </>
);

export default VariantSelector;
