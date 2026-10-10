import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from '@/api/client';
import endpoints from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/layout/Header/Header';
import CatalogLayout from '@/components/catalog/CatalogLayout/CatalogLayout.jsx';
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
        setResults(data || []);
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
      <div className="search-empty animate-fade-in">
        <Header />
        <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <h1>Search Products</h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>Enter a search term above to find products by name, category, or ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page animate-fade-in">
      <Header />
      {loading ? (
        <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <div className="loading">Searching for products...</div>
        </div>
      ) : (
        <CatalogLayout
          products={results}
          pageTitle={`Results for "${query}"`}
          badgeText="Search Results"
          breadcrumbItems={[
            { label: "Home", path: "/" },
            { label: "Search" },
            { label: `"${query}"` },
          ]}
        />
      )}
    </div>
  );
};

export default SearchPage;

