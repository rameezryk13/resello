import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  PackageOpen
} from "lucide-react";
import Product from "@/components/catalog/Product/Product.jsx";
import { formatRupees, parsePrice } from "@/utils/currency";
import "./CatalogLayout.css";

const DEFAULT_CATEGORIES = [
  "All Categories",
  "Airpods & Headsets",
  "Apparel & Clothing",
  "Bags & Handbags",
  "Fashion Accessories",
  "Home, Kitchen & Lifestyle",
  "Kids & Gaming",
  "Perfume & Fragrances",
  "Personal Care & Beauty",
  "Smart Gadgets",
  "Smart Watches",
  "Undergarments",
  "Video, Lighting & Content Studio"
];

const CatalogLayout = ({
  products = [],
  pageTitle = "All Products",
  badgeText = "Seller Deals",
  breadcrumbItems = [],
  initialCategory = "All Categories",
  headerBanner = null,
}) => {
  // Extract max price among products to establish slider boundaries
  const maxPossiblePrice = useMemo(() => {
    if (!products.length) return 10000;
    const highest = Math.max(...products.map((p) => parsePrice(p.price) || 0));
    return Math.ceil(highest / 500) * 500 || 10000;
  }, [products]);

  // Filter & sort states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(maxPossiblePrice);
  const [sortBy, setSortBy] = useState("default");

  // Accordion toggles
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize when initialCategory or maxPossiblePrice changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    setMaxPrice(maxPossiblePrice);
  }, [maxPossiblePrice]);

  // Dynamically compile categories present in products
  const categoryList = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Compute product count per category
  const categoryCounts = useMemo(() => {
    const counts = { "All Categories": products.length };
    products.forEach((p) => {
      const cat = p.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category check
        if (selectedCategory && selectedCategory !== "All Categories") {
          const productCat = (product.category || "").toLowerCase();
          const targetCat = selectedCategory.toLowerCase();
          if (!productCat.includes(targetCat) && !targetCat.includes(productCat)) {
            return false;
          }
        }

        // Price check
        const price = parsePrice(product.price);
        if (price < minPrice || price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [products, selectedCategory, minPrice, maxPrice, sortBy]);

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    minPrice > 0 ||
    maxPrice < maxPossiblePrice ||
    sortBy !== "default";

  const handleResetFilters = () => {
    setSelectedCategory("All Categories");
    setMinPrice(0);
    setMaxPrice(maxPossiblePrice);
    setSortBy("default");
  };

  return (
    <div className="catalog-layout">
      {/* 1. BREADCRUMB BAR */}
      <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
        <div className="container catalog-breadcrumb-inner">
          <Link to="/" className="breadcrumb-home-link" title="Home">
            <Home size={15} />
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.path ? (
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{item.label}</span>
              )}
              {idx < breadcrumbItems.length - 1 && (
                <ChevronRight size={14} className="breadcrumb-separator" />
              )}
            </React.Fragment>
          ))}
          {breadcrumbItems.length === 0 && (
            <span className="breadcrumb-current">{pageTitle.toUpperCase()}</span>
          )}
        </div>
      </nav>

      <div className="container catalog-main-container">
        {headerBanner && <div className="catalog-header-banner">{headerBanner}</div>}

        {/* 2. TOP TOOLBAR BAR (MATCHING SCREENSHOT 3) */}
        <div className="catalog-top-toolbar">
          <div className="toolbar-left">
            {badgeText && <span className="seller-deals-badge">{badgeText}</span>}
            <span className="catalog-product-count">
              Showing <strong>{filteredProducts.length}</strong> of {products.length} products
            </span>
          </div>

          <div className="toolbar-right">
            {/* Mobile Filter Trigger Button with Filter Icon */}
            <button
              type="button"
              className="catalog-mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open filter sidebar"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-active-dot" />}
            </button>

            {/* Sort By Dropdown */}
            <div className="catalog-sort-box">
              <label htmlFor="catalog-sort-select">Sort By:</label>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="catalog-sort-select"
              >
                <option value="default">Default sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. TWO COLUMN MAIN AREA: LEFT SIDEBAR + PRODUCT GRID */}
        <div className="catalog-body-grid">
          {/* LEFT SIDEBAR (STICKY ON DESKTOP, DRAWER ON MOBILE) */}
          <aside
            className={`catalog-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}
            aria-label="Product Filters"
          >
            <div className="sidebar-inner-content">
              {/* Mobile Drawer Header */}
              <div className="sidebar-mobile-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SlidersHorizontal size={18} />
                  <strong>Filters</strong>
                </div>
                <button
                  type="button"
                  className="sidebar-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Active filters pill & reset */}
              {hasActiveFilters && (
                <div className="sidebar-reset-row">
                  <span className="active-filters-label">Filters Applied</span>
                  <button
                    type="button"
                    className="reset-filters-btn"
                    onClick={handleResetFilters}
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>
              )}

              {/* ACCORDION 1: CATEGORIES */}
              <div className="sidebar-filter-group">
                <div
                  className="sidebar-group-header"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="sidebar-group-title">CATEGORIES</span>
                  <span className="sidebar-group-icon">
                    {categoriesOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </div>

                {categoriesOpen && (
                  <ul className="sidebar-category-list">
                    {categoryList.map((category) => {
                      const count = categoryCounts[category] || 0;
                      const isSelected = selectedCategory === category;

                      return (
                        <li
                          key={category}
                          className={`sidebar-category-item ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedCategory(category);
                            setMobileFilterOpen(false);
                          }}
                        >
                          <span className="category-item-name">{category}</span>
                          <span className="category-item-count">{count}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* ACCORDION 2: PRICE RANGE */}
              <div className="sidebar-filter-group">
                <div
                  className="sidebar-group-header"
                  onClick={() => setPriceOpen(!priceOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="sidebar-group-title">PRICE</span>
                  <span className="sidebar-group-icon">
                    {priceOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </div>

                {priceOpen && (
                  <div className="sidebar-price-content">
                    {/* Price Slider Bar */}
                    <div className="price-slider-track-wrap">
                      <input
                        type="range"
                        min={0}
                        max={maxPossiblePrice}
                        step={50}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="price-range-slider"
                        aria-label="Filter products by maximum price"
                      />
                    </div>

                    {/* Price Display Readout */}
                    <div className="price-readout-row">
                      <span>Up to:</span>
                      <strong>{formatRupees(maxPrice)}</strong>
                    </div>

                    <div className="price-presets-row">
                      <button
                        type="button"
                        className={`price-preset-pill ${maxPrice === maxPossiblePrice ? "active" : ""}`}
                        onClick={() => setMaxPrice(maxPossiblePrice)}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`price-preset-pill ${maxPrice === 1500 ? "active" : ""}`}
                        onClick={() => setMaxPrice(1500)}
                      >
                        &lt; 1,500
                      </button>
                      <button
                        type="button"
                        className={`price-preset-pill ${maxPrice === 3000 ? "active" : ""}`}
                        onClick={() => setMaxPrice(3000)}
                      >
                        &lt; 3,000
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Done Button */}
              <div className="sidebar-mobile-done">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ width: "100%", height: 44, justifyContent: "center" }}
                >
                  Apply Filters ({filteredProducts.length} Items)
                </button>
              </div>
            </div>
          </aside>

          {/* Backdrop when mobile drawer is open */}
          {mobileFilterOpen && (
            <div
              className="catalog-mobile-backdrop"
              onClick={() => setMobileFilterOpen(false)}
            />
          )}

          {/* RIGHT PRODUCTS GRID */}
          <main className="catalog-products-column">
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty-state">
                <PackageOpen size={48} className="catalog-empty-icon" />
                <h3 className="catalog-empty-title">No products found</h3>
                <p className="catalog-empty-desc">
                  There are no products matching your selected category and price criteria.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleResetFilters}
                  style={{ marginTop: 12 }}
                >
                  <RotateCcw size={16} /> Reset All Filters
                </button>
              </div>
            ) : (
              <div className="catalog-products-grid">
                {filteredProducts.map((product) => (
                  <Product
                    key={product.productId}
                    product={product}
                    showCategory
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogLayout;
