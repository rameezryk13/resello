import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from '@/api/client';
import endpoints from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/layout/Header/Header';
import Product from '@/components/catalog/Product/Product';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await get(endpoints.products.search(query));
        setResults(data);
      } catch (err) {
        toast.error(err?.message || "Search failed. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, toast]);

  if (!query.trim()) {
    return (
      <div className="search-empty">
        <Header />
        <div className="container">
          <h1>Search</h1>
          <p>Enter a search term above to find products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <Header />
      <div className="container">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : results.length === 0 ? (
          <div className="no-results">
            <h2>No products found</h2>
            <p>Try different keywords like product name, ID, or category.</p>
          </div>
        ) : (
          <div className="search-results-grid">
            {results.map((product) => (
              <Product key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

