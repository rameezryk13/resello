import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import Product from "@/components/catalog/Product/Product.jsx";
import "./EventPage.css";

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [poster, setPoster] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    const loadEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await get(endpoints.events.byId(eventId));
        if (!cancelled) {
          setPoster(data.poster || null);
          setProducts(data.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.status === 404
              ? "This event could not be found"
              : err?.message || "Unable to load this event"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <div className="event-page animate-fade-in">
      <Header />

      {loading ? (
        <div className="container event-page-loading">Loading event...</div>
      ) : error ? (
        <div className="container event-page-error">
          {error}
          <button type="button" className="btn-outline" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>
      ) : (
        <>
          {poster && (
            <div
              className="event-hero"
              style={{ backgroundImage: `url(${poster.img})` }}
            >
              <div className="container event-hero__content">
                <h1>
                  {poster.title.split("\n").map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h1>
                <p>{poster.desc}</p>
              </div>
            </div>
          )}

          <div className="container event-page-content">
            <div className="event-page-header">
              <h2>Products in this event</h2>
              <p className="event-page-count">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="event-page-empty">No products are linked to this event yet.</div>
            ) : (
              <div className="event-page-grid">
                {products.map((product) => (
                  <Product key={product.productId} product={product} showCategory />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventPage;
