import { Package, ShoppingBag } from "lucide-react";
import { formatProductPrice } from "@/utils/currency";
import "./StickyBuyBar.css";

const StickyBuyBar = ({
  visible,
  image,
  name,
  price,
  addingToCart,
  isOutOfStock,
  onAddToCart,
  onBuyNow,
}) => (
  <div
    className={`pdp-sticky-buybar ${visible ? "is-visible" : ""}`}
    aria-hidden={!visible}
  >
    <div className="pdp-sticky-buybar-inner">
      <div className="pdp-sticky-buybar-info">
        <img
          className="pdp-sticky-buybar-thumb"
          src={image}
          alt=""
          aria-hidden="true"
        />
        <div className="pdp-sticky-buybar-text">
          <span className="pdp-sticky-buybar-name">{name}</span>
          <span className="pdp-sticky-buybar-price">
            {formatProductPrice(price)}
          </span>
        </div>
      </div>

      <div className="pdp-sticky-buybar-actions">
        <button
          type="button"
          className="pdp-sticky-buybar-btn pdp-sticky-buybar-btn-outline"
          onClick={onAddToCart}
          disabled={addingToCart || isOutOfStock}
          tabIndex={visible ? 0 : -1}
        >
          <ShoppingBag size={17} strokeWidth={2} />
          {addingToCart ? "Adding..." : "Add to Cart"}
        </button>
        <button
          type="button"
          className="pdp-sticky-buybar-btn pdp-sticky-buybar-btn-solid"
          onClick={onBuyNow}
          disabled={addingToCart || isOutOfStock}
          tabIndex={visible ? 0 : -1}
        >
          <Package size={17} strokeWidth={2} />
          Buy now
        </button>
      </div>
    </div>
  </div>
);

export default StickyBuyBar;
