import "./ProductActions.css";

const ProductActions = ({
  containerRef,
  addingToCart,
  isOutOfStock,
  cartMessage,
  actionError,
  onAddToCart,
  onBuyNow,
}) => (
  /* The outer element stays even though the utility row it was named for has
     moved up to the profit row: ProductDetailPage observes it to decide when
     to raise the floating buy bar, and the mobile rules in ProductActions.css
     pin `.pdp-actions-with-utilities .pdp-actions` to the bottom of the
     viewport. */
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
            <p className="pdp-cart-feedback error">
              {actionError.includes("support@resello.pk") ? (
                <>
                  {actionError.split("support@resello.pk")[0]}
                  <a
                    href="mailto:support@resello.pk"
                    style={{ color: "#ffffff", textDecoration: "underline", fontWeight: 700 }}
                  >
                    support@resello.pk
                  </a>
                  {actionError.split("support@resello.pk")[1]}
                </>
              ) : (
                actionError
              )}
            </p>
          ) : null}
        </div>
      )}
    </div>
  </div>
);

export default ProductActions;
