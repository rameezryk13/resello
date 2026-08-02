import { useRef } from "react";
import "./ShopByCategory.css";

const ShopByCategory = ({ categories = [], onCategoryClick }) => {
  const trackRef = useRef(null);

  const slide = (direction) => {
    trackRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="shop-by-category animate-fade-in-up">
      <div className="shop-by-category__header">
        <h2>Shop by Category</h2>
        <div className="shop-by-category__controls">
          <button type="button" aria-label="Previous categories" onClick={() => slide("left")}>←</button>
          <button type="button" aria-label="Next categories" onClick={() => slide("right")}>→</button>
        </div>
      </div>

      <div className="shop-by-category__track" ref={trackRef}>
        {categories.map((category) => (
          <button
            type="button"
            key={category.name}
            className="shop-by-category__item"
            onClick={() => onCategoryClick?.(category.name)}
          >
            <span className="shop-by-category__image">
              {category.img && <img src={category.img} alt="" />}
            </span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
