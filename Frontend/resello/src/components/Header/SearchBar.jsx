import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { get } from "../../api/client";
import endpoints from "../../api/endpoints";
import "./SearchBar.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const fetchResults = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await get(endpoints.products.search(q));
      setResults(data);
    } catch (err) {
      // Shown in the dropdown. Without it the panel would read
      // "No products found", which is wrong when the request failed.
      setError(err?.message || "Search is unavailable right now.");
      setResults([]);
    }
    setLoading(false);
  }, []);

  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.trim().length < 1) {
        setResults([]);
        setOpen(false);
      } else {
        setOpen(true);
        fetchResults(query);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchResults]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
    setOpen(false);
  };

  const highlight = (text) => {
    if (!text) return "";
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: "var(--color-highlight)" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="searchbar">
      <div className="searchbar-input-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by Name / Product ID / Shop Name"
          className="searchbar-input"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="searchbar-clear"
          >
            <X size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={handleSearch}
          className="searchbar-btn"
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
        </button>

        {open && query.trim().length > 0 && (
          <div className="searchbar-dropdown">
            {loading ? (
              <div className="searchbar-empty">Searching...</div>
            ) : error ? (
              <div className="searchbar-empty">{error}</div>
            ) : results.length === 0 ? (
              <div className="searchbar-empty">
                No products found for "{query}"
              </div>
            ) : (
              <ul className="searchbar-dropdown-list">
                {results.map((product) => (
                  <li
                    key={product._id}
                    className="searchbar-dropdown-item"
                    onClick={() => navigate(`/product/${product.productId}`)}
                  >
                    <div className="searchbar-dropdown-thumb">
                      <img src={product.img} alt={product.name} />
                    </div>
                    <div className="searchbar-dropdown-info">
                      <p className="searchbar-dropdown-name">
                        {highlight(product.name)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
