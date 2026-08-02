import React, { useState, useEffect } from 'react';
import { get } from '@/api/client';
import endpoints from '@/api/endpoints';
import Product from '@/components/catalog/Product/Product.jsx';
import { SORT_OPTIONS } from '@/constants/sortOptions.js';
import './MoreProducts.css';

const buildEmptyFilters = (category = '') => ({
  category: category || '',
  subCategory: '',
  rating: '',
  sortPrice: '',
});

const filtersToQuery = (filters) => {
  const queryObj = {};
  Object.keys(filters).forEach((key) => {
    const v = filters[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      queryObj[key] = String(v).trim();
    }
  });
  return queryObj;
};

/** Same rules as backend — sort by displayed price */
const parsePriceNumber = (p) => {
  const raw = p.price ?? p.salePrice ?? '';
  const cleaned = String(raw).replace(/,/g, '');
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1], 10) : 0;
};

const sortProductsByPrice = (list, direction) => {
  const dir = String(direction || '').toLowerCase();
  if (dir !== 'asc' && dir !== 'desc') return list;
  return [...list].sort((a, b) => {
    const na = parsePriceNumber(a);
    const nb = parsePriceNumber(b);
    const cmp = dir === 'asc' ? na - nb : nb - na;
    if (cmp !== 0) return cmp;
    return String(a.productId || '').localeCompare(String(b.productId || ''));
  });
};

const getThreeRowProductCount = () => {
  if (typeof window === 'undefined') return 18;
  if (window.innerWidth <= 992) return 9;
  if (window.innerWidth <= 1200) return 12;
  return 18;
};

const FASHION_GROUP_VALUE = "Men's Fashion,Women's Fashion,Kids Clothing";

const MoreProducts = ({ externalCategory, visualCategories = [] }) => {
  const [pendingFilters, setPendingFilters] = useState(() =>
    buildEmptyFilters(typeof externalCategory === 'string' ? externalCategory : '')
  );
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsPerBatch, setItemsPerBatch] = useState(getThreeRowProductCount);
  const [visibleCount, setVisibleCount] = useState(getThreeRowProductCount);

  useEffect(() => {
    setPendingFilters((prev) => ({
      ...prev,
      category: typeof externalCategory === 'string' ? externalCategory : '',
      subCategory: '',
    }));
  }, [externalCategory]);

  useEffect(() => {
    const updateItemsPerBatch = () => {
      const nextCount = getThreeRowProductCount();
      setItemsPerBatch(nextCount);
      setVisibleCount((current) => Math.max(nextCount, current));
    };

    updateItemsPerBatch();
    window.addEventListener('resize', updateItemsPerBatch);
    return () => window.removeEventListener('resize', updateItemsPerBatch);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      if (!pendingFilters.category || pendingFilters.category.includes(',')) {
        setSubCategoriesLoading(false);
        setSubCategories([]);
        return;
      }

      setSubCategoriesLoading(true);
      try {
        const data = await get(
          `${endpoints.products.subcategories}?category=${encodeURIComponent(pendingFilters.category)}`,
          { signal: controller.signal }
        );
        const list = Array.isArray(data.subCategories) ? data.subCategories : [];
        if (!cancelled) {
          setSubCategories(list);
          setPendingFilters((prev) => {
            if (!prev.subCategory) return prev;
            if (list.includes(prev.subCategory)) return prev;
            return { ...prev, subCategory: '' };
          });
        }
      } catch (e) {
        if (e.name === 'AbortError') return;
        if (!cancelled) setSubCategories([]);
      } finally {
        if (!cancelled) setSubCategoriesLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pendingFilters.category]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      const queryObj = filtersToQuery(pendingFilters);
      const qs = new URLSearchParams(queryObj).toString();
      const path = qs
        ? `${endpoints.products.filterBase}?${qs}`
        : endpoints.products.filterBase;

      try {
        const data = await get(path, { signal: controller.signal });
        if (cancelled) return;
        let list = Array.isArray(data.products) ? data.products : [];
        const sp = String(pendingFilters.sortPrice || '')
          .trim()
          .toLowerCase();
        if (sp === 'asc' || sp === 'desc') {
          list = sortProductsByPrice(list, sp);
        }
        setProducts(list);
        setVisibleCount(getThreeRowProductCount());
      } catch (e) {
        if (e.name === 'AbortError') return;
        if (!cancelled) {
          setProducts([]);
          setError(e.message || 'Something went wrong');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pendingFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      setPendingFilters((prev) => ({
        ...prev,
        category: value,
        subCategory: '',
      }));
      return;
    }

    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setPendingFilters(buildEmptyFilters(''));
  };

  const hasActiveFilters = Object.values(pendingFilters).some((v) => v !== '');

  const categoryOptions = (() => {
    const names = visualCategories.map((c) => c.name).filter(Boolean);
    const fallback = ['Electronics', 'Cosmetics', "Men's Fashion", "Women's Fashion", 'Kids Clothing'];
    const base = names.length > 0 ? names : fallback;
    const options = [{ value: FASHION_GROUP_VALUE, label: 'Fashion (All)' }];
    base.forEach((name) => {
      if (name === "Men's Fashion" || name === "Women's Fashion" || name === 'Kids Clothing') return;
      options.push({ value: name, label: name });
    });
    // Keep the grouped Fashion categories individually selectable too.
    ["Men's Fashion", "Women's Fashion", 'Kids Clothing'].forEach((name) => {
      if (base.includes(name)) options.push({ value: name, label: name });
    });
    return options;
  })();

  const showEmpty = !loading && !error && products.length === 0;
  const visibleProducts = products.slice(0, visibleCount);
  const canShowMore = !loading && !error && visibleCount < products.length;

  return (
    <section className="more-products-section">
      <div className="more-products-header">
        <h2>More Products</h2>

        <div className="filter-bar">
          <div className="filter-field">
            <label className="filter-label" htmlFor="more-products-category">
              Category
            </label>
            <select
              id="more-products-category"
              name="category"
              value={pendingFilters.category}
              onChange={handleFilterChange}
            >
              <option value="">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label" htmlFor="more-products-subcategory">
              Subcategory
              {pendingFilters.category ? (
                <span className="filter-label-context"> — {pendingFilters.category}</span>
              ) : null}
            </label>
            <select
              id="more-products-subcategory"
              key={pendingFilters.category || '_none'}
              name="subCategory"
              value={pendingFilters.subCategory}
              onChange={handleFilterChange}
              disabled={!pendingFilters.category || subCategoriesLoading}
              aria-busy={subCategoriesLoading}
              aria-label={
                pendingFilters.category
                  ? `Subcategories for ${pendingFilters.category}`
                  : 'Select a category first'
              }
            >
              <option value="">
                {!pendingFilters.category
                  ? 'Select a category first'
                  : subCategoriesLoading
                    ? 'Loading subcategories…'
                    : 'All subcategories'}
              </option>
              {!subCategoriesLoading &&
                subCategories.map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
            </select>
          </div>

          <select name="rating" value={pendingFilters.rating} onChange={handleFilterChange}>
            <option value="">Any rating</option>
            <option value="5">5 stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>

          <select name="sortPrice" value={pendingFilters.sortPrice} onChange={handleFilterChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <div className="filter-actions">
              <button type="button" className="btn-clear-filter" onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          )}
        </div>

        <p className="more-products-meta">
          {loading && <span className="filter-status">Loading…</span>}
          {!loading && error && <span className="filter-error">{error}</span>}
          {!loading && !error && (
            <span>
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </span>
          )}
        </p>
      </div>

      <div className="more-products-grid">
        {!loading &&
          !error &&
          visibleProducts.map((product) => (
            <Product key={product.productId} product={product} />
          ))}
      </div>

      {canShowMore && (
        <div className="more-products-show-more">
          <button
            type="button"
            className="btn-show-more-products"
            onClick={() => setVisibleCount((count) => count + itemsPerBatch)}
          >
            Show more items
          </button>
        </div>
      )}

      {showEmpty && (
        <div className="no-products">
          <h3>No products match these filters</h3>
          <p className="no-products-hint">Try clearing filters or choosing a broader category.</p>
          <button type="button" className="btn-primary" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
};

export default MoreProducts;
