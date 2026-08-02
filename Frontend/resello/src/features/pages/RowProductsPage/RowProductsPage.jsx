import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { get } from "../../../api/client";
import endpoints from "../../../api/endpoints";
import Header from "../../../components/Header/Header.jsx";
import Product from "../../../components/Product/Product.jsx";
import "./RowProductsPage.css";

const RowProductsPage = () => {
  const { rowId } = useParams();
  const location = useLocation();

  const [title, setTitle] = useState(location.state?.title || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rowId) return;
    let cancelled = false;

    const loadRowProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [rowsData, productsData] = await Promise.all([
          get(endpoints.home.rows),
          get(endpoints.home.products),
        ]);

        const allRows = rowsData.row || [];
        const allProducts = productsData.products || [];

        const matchedRow = allRows.find(
          (row) => String(row.id) === String(rowId)
        );

        if (!matchedRow) {
          throw new Error("This section could not be found");
        }

        const rowProducts = allProducts.filter((product) =>
          matchedRow.productIds.includes(product.productId)
        );

        if (!cancelled) {
          setTitle(matchedRow.title || "");
          setProducts(rowProducts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRowProducts();

    return () => {
      cancelled = true;
    };
  }, [rowId]);

  return (
    <div className="row-products-page animate-fade-in">
      <Header />
      <div className="container row-products-content">
        <div className="row-products-header">
          <div>
            <h1>{title || "Products"}</h1>
            {!loading && !error ? (
              <p className="row-products-count">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="row-products-loading">Loading products...</div>
        ) : error ? (
          <div className="row-products-error">{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products available in this section.</div>
        ) : (
          <div className="row-products-grid">
            {products.map((product) => (
              <Product key={product.productId} product={product} showCategory />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RowProductsPage;
