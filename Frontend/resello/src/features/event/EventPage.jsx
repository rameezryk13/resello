import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarOff } from "lucide-react";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import Header from "@/components/layout/Header/Header.jsx";
import CatalogLayout from "@/components/catalog/CatalogLayout/CatalogLayout.jsx";
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

  const headerBanner = poster ? (
    <div
      className="event-hero"
      style={{ backgroundImage: `url(${poster.img})`, borderRadius: "var(--radius-md, 12px)" }}
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
  ) : null;

  return (
    <div className="event-page animate-fade-in">
      <Header />

      {loading ? (
        <div className="container event-page-loading" style={{ padding: "60px 0" }}>Loading event...</div>
      ) : error ? (
        <div className="container event-page-error" style={{ padding: "60px 0" }}>
          {error}
          <button type="button" className="btn-outline" onClick={() => navigate("/")} style={{ marginTop: 12 }}>
            Back to home
          </button>
        </div>
      ) : (
        <CatalogLayout
          products={products}
          pageTitle={poster?.title?.replace(/\n/g, " ") || "Event Products"}
          badgeText="Featured Event"
          breadcrumbItems={[
            { label: "Home", path: "/" },
            { label: "Events" },
            { label: poster?.title?.replace(/\n/g, " ") || "Event" },
          ]}
          headerBanner={headerBanner}
        />
      )}
    </div>
  );
};

export default EventPage;
