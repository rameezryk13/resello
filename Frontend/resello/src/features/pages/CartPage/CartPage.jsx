import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, put, del } from "../../../api/client";
import endpoints from "../../../api/endpoints";
import Header from "../../../components/Header/Header.jsx";
import { formatRupees, parsePrice } from "../../../utils/currency";
import "./CartPage.css";

const formatMoney = (value) => formatRupees(value);

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [message, setMessage] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await get(endpoints.cart.root);
      setCartItems(data.cart || []);
    } catch (err) {
      setError(err?.message || "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (itemId, nextQuantity) => {
    if (nextQuantity < 0) return;
    setUpdatingItem(itemId);
    setMessage(null);

    try {
      const data = await put(endpoints.cart.item(itemId), {
        quantity: nextQuantity,
      });
      setCartItems(data.cart || []);
      setMessage("Cart updated successfully.");
    } catch (err) {
      setError(err?.message || "Unable to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingItem(itemId);
    setMessage(null);

    try {
      const data = await del(endpoints.cart.item(itemId));
      setCartItems(data.cart || []);
      setMessage("Item removed from cart.");
    } catch (err) {
      setError(err?.message || "Unable to remove item");
    } finally {
      setUpdatingItem(null);
    }
  };

  const getItemProfitTotal = (item) => {
    const rawProfit = item?.profit;
    if (rawProfit !== undefined && rawProfit !== null && !Number.isNaN(Number(rawProfit))) {
      return Number(rawProfit);
    }

    const price = parsePrice(item.product?.price);
    const original = parsePrice(item.product?.originalPrice);
    return original > price ? Math.max(0, original - price) : 0;
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parsePrice(item.product?.price) * item.quantity;
  }, 0);

  const profitTotal = cartItems.reduce((sum, item) => {
    return sum + getItemProfitTotal(item);
  }, 0);

  const tax = Math.round((subtotal + profitTotal) * 0.03 * 100) / 100;
  const total = Math.round((subtotal + profitTotal + tax) * 100) / 100;

  const renderItemTotal = (item) => {
    return formatMoney(parsePrice(item.product?.price) * item.quantity + getItemProfitTotal(item));
  };

  const getItemTotal = (item) => {
    return parsePrice(item.product?.price) * item.quantity + getItemProfitTotal(item);
  };

  const cartItemsByShop = cartItems.reduce((groups, item) => {
    const shopId = item.product?.shopId || "unknown-shop";
    const shopName = item.product?.shopName || "Unknown Shop";
    const existingGroup = groups.find((group) => group.shopId === shopId);

    if (existingGroup) {
      existingGroup.items.push(item);
      return groups;
    }

    return [...groups, { shopId, shopName, items: [item] }];
  }, []);

  if (loading) {
    return (
      <div className="cart-page">
        <Header />
        <div className="container cart-loading">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <Header />
        <div className="container cart-error">
          <p>{error}</p>
          <button type="button" className="btn-primary" onClick={loadCart}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in">
      <Header />
      <div className="container cart-page-content">
        <div className="cart-main-section">
          <div className="cart-heading-row">
            <h2>Your Cart</h2>
            <p>{cartItems.length} item{cartItems.length === 1 ? "" : "s"} in cart</p>
          </div>

          {message ? <div className="cart-message success">{message}</div> : null}
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <h3>Your cart is empty</h3>
              <p>Add a product from the product page to begin checkout.</p>
              <button
                type="button"
                className="cart-empty-btn"
                onClick={() => navigate("/")}
              >
                Explore ReSello
              </button>
            </div>
          ) : (
            <div className="cart-grid">
              <div className="cart-items-card">
                {cartItemsByShop.map((shopGroup) => (
                  <section key={shopGroup.shopId} className="cart-shop-section">
                    <div className="cart-shop-header">
                      <div>
                        <span className="cart-shop-label">Shop</span>
                        <h3>{shopGroup.shopName}</h3>
                      </div>
                      <span className="cart-shop-count">
                        {shopGroup.items.length} item{shopGroup.items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="cart-table-header">
                      <span>Product</span>
                      <span>Price</span>
                      <span>Profit</span>
                      <span>Quantity</span>
                      <span>Total</span>
                    </div>

                    {shopGroup.items.map((item) => {
                      // null rather than "": an empty src makes the browser
                      // re-request the current page as the image.
                      const imageSrc = item.product?.img || item.product?.images?.[0] || null;
                      const price = parsePrice(item.product?.price);

                      return (
                        <div key={item.itemId} className="cart-item-row">
                          <div className="cart-product-cell">
                            <img src={imageSrc} alt={item.product?.name} loading="lazy" />
                            <div>
                              <h4>{item.product?.name}</h4>
                              <p>{item.product?.category || "No category"}</p>
                              <p>{item.product?.subCategory || "Standard"}</p>
                              {(item.selectedSize || item.selectedColor) ? (
                                <div className="cart-variant-meta">
                                  {item.selectedSize ? <span>Size: {item.selectedSize}</span> : null}
                                  {item.selectedColor ? <span>Color: {item.selectedColor}</span> : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <span>{formatMoney(price)}</span>
                          <span>{formatMoney(getItemProfitTotal(item))}</span>
                          <div className="cart-quantity-cell">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                              disabled={updatingItem === item.itemId || item.quantity <= 1}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                              disabled={updatingItem === item.itemId}
                            >
                              +
                            </button>
                          </div>
                          <div className="cart-row-total">
                            <span>{renderItemTotal(item)}</span>
                            <button
                              type="button"
                              className="cart-remove-btn"
                              onClick={() => removeItem(item.itemId)}
                              disabled={updatingItem === item.itemId}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </section>
                ))}
              </div>

              <aside className="cart-summary-card">
                <div className="summary-title">Order summary</div>
                <div className="summary-shop-list">
                  {cartItemsByShop.map((shopGroup) => {
                    const shopTotal = shopGroup.items.reduce((sum, item) => sum + getItemTotal(item), 0);

                    return (
                      <section key={shopGroup.shopId} className="summary-shop-section">
                        <div className="summary-shop-header">
                          <span>{shopGroup.shopName}</span>
                          <strong>{formatMoney(shopTotal)}</strong>
                        </div>
                        <div className="summary-shop-items">
                          {shopGroup.items.map((item) => (
                            <div key={item.itemId} className="summary-shop-item">
                              <span>
                                {item.product?.name || "Product"} × {item.quantity}
                              </span>
                              <span>{formatMoney(getItemTotal(item))}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Profit Apply</span>
                  <span>{formatMoney(profitTotal)}</span>
                </div>
                <div className="summary-row tax">
                  <span>Tax</span>
                  <span>+{formatMoney(tax)}</span>
                </div>
                <div className="summary-total-row">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
                <button
                  type="button"
                  className="checkout-btn"
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                >
                  Go to Checkout
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
