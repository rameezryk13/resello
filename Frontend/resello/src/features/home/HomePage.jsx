import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import Header from "@/components/layout/Header/Header";
import Row from "@/components/catalog/Row/Row";
import MoreProducts from "./components/MoreProducts/MoreProducts";
import Events from "./components/Events/Events";
import ShopByCategory from "./components/ShopByCategory/ShopByCategory";
import TopRecommendedWholesalers from "./components/TopRecommendedWholesalers/TopRecommendedWholesalers";
import "./HomePage.css";

const Home = () => {
  const location = useLocation();
  const [visualCategories, setVisualCategories] = useState([]);
  const [heroPosters, setHeroPosters] = useState([]);
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [shops, setShops] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const moreProductsRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    // The home sections load independently so one failure doesn't blank the
    // others. Failures are collected and reported as a single toast — when the
    // backend is down they all reject at once, and a stack of toasts saying the
    // same thing is just noise.
    const load = async () => {
      const settled = await Promise.allSettled([
        get(endpoints.home.visualCategories),
        get(endpoints.home.products),
        get(endpoints.home.rows),
        get(endpoints.shops.root),
      ]);

      const [categories, products, rows, shops] = settled;

      if (categories.status === "fulfilled") {
        setVisualCategories(categories.value.visualCategories || []);
        setHeroPosters(categories.value.heroPosters || []);
      } else {
        setVisualCategories([]);
        setHeroPosters([]);
      }

      setProducts(products.status === "fulfilled" ? products.value.products || [] : []);
      setRows(rows.status === "fulfilled" ? rows.value.row || [] : []);
      setShops(shops.status === "fulfilled" ? shops.value.shops || [] : []);

      const failed = settled.filter((r) => r.status === "rejected");
      if (failed.length === settled.length) {
        toast.error(failed[0].reason?.message || "Could not load this page.");
      } else if (failed.length > 0) {
        toast.error("Some sections of this page could not be loaded.");
      }
    };

    load();
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Category nav links (header) pass ?category=... — apply it as the
    // active filter for the More Products section.
    if (params.has("category")) {
      setActiveCategory(params.get("category") || "");
    }

    if (params.get("section") !== "more") return;

    const frame = window.requestAnimationFrame(() => {
      if (!moreProductsRef.current) return;
      const y = moreProductsRef.current.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.search]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);

    if (moreProductsRef.current) {
      const y = moreProductsRef.current.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="animate-fade-in">
      <Header />

      <main className="container home-page">
        <ShopByCategory categories={visualCategories} onCategoryClick={handleCategoryClick} />

        <section className="home-showcase animate-fade-in-up delay-100">
          <TopRecommendedWholesalers shops={shops} />
          <Events posters={heroPosters} />
        </section>

        {rows.map((row) => (
          <Row
            key={row.id}
            rowId={row.id}
            title={row.title}
            products={products.filter((product) => row.productIds.includes(product.productId))}
          />
        ))}

        <div ref={moreProductsRef}>
          <MoreProducts externalCategory={activeCategory} visualCategories={visualCategories} />
        </div>
      </main>
    </div>
  );
};

export default Home;
