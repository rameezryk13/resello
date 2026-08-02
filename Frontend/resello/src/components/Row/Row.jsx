import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Product from "../Product/Product.jsx";
import "./Row.css";

/**
 * @param {string} title
 * @param {Array} products - product list (from home rows or /api/products/related)
 * @param {boolean} showViewAll - show "View all" link (default true)
 * @param {string|number} rowId - id of the home row, used to open the "view all" page
 */
const Row = ({ title, products, showViewAll = true, rowId }) => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const slide = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -630 : 630;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    if (rowId === undefined || rowId === null) {
      navigate(`/?section=more`);
      return;
    }
    navigate(`/row/${rowId}`, { state: { title } });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="row-section product-row animate-fade-in-up">
      <div className="section-header">
        {title ? <h2 className="section-title">{title}</h2> : null}
        <div className="header-actions">
          {showViewAll && (
            <a href="#" className="view-all-link" onClick={handleViewAll}>
              View All
            </a>
          )}
          <div className="slider-controls">
            <button className="slider-btn" onClick={() => slide("left")}>←</button>
            <button className="slider-btn" onClick={() => slide("right")}>→</button>
          </div>
        </div>
      </div>

      <div className="slider-container">
        <div className="product-track" ref={sliderRef}>
          {products.map((product) => (
            <Product key={product.productId} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Row;
