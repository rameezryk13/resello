import "./ProductActions.css";

const ProductActions = ({
  containerRef,
  addingToCart,
  isOutOfStock,
  cartMessage,
  actionError,
  onAddToCart,
  onBuyNow,
  children,
}) => (
  <div className="pdp-actions-with-utilities" ref={containerRef}>
    <div className="pdp-actions" aria-label="Primary actions">
      <button
        type="button"
        className="btn-primary pdp-small-action-btn"
        onClick={onAddToCart}
        disabled={addingToCart || isOutOfStock}
      >
        {addingToCart ? "Adding..." : "Add to Cart"}
      </button>
      <button
        type="button"
        className="btn-outline pdp-small-action-btn"
        onClick={onBuyNow}
        disabled={addingToCart || isOutOfStock}
      >
        Buy Now
      </button>
      {(cartMessage || actionError) && (
        <div className="pdp-cart-feedback-row">
          {cartMessage ? (
            <p className="pdp-cart-feedback success">{cartMessage}</p>
          ) : null}
          {actionError ? (
            <p className="pdp-cart-feedback error">{actionError}</p>
          ) : null}
        </div>
      )}
    </div>

    {children}
  </div>
);

export default ProductActions;
