import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import PageLoader from "./components/PageLoader/PageLoader";

// Home stays eager: it's the landing route, so code-splitting it would only
// add a network round trip before the first paint. Every other page is loaded
// on demand, which keeps the initial bundle to the homepage's own code.
import Home from "./features/pages/HomePage/HomePage";

const ProductDetailPage = lazy(() => import("./features/pages/ProductDetailPage/ProductDetailPage"));
const SearchPage = lazy(() => import("./features/pages/SearchPage/SearchPage"));
const FavoritesPage = lazy(() => import("./features/pages/FavoritesPage/FavoritesPage"));
const CartPage = lazy(() => import("./features/pages/CartPage/CartPage"));
const CheckoutPage = lazy(() => import("./features/pages/CheckoutPage/CheckoutPage"));
const ShopPage = lazy(() => import("./features/pages/ShopPage/ShopPage"));
const RowProductsPage = lazy(() => import("./features/pages/RowProductsPage/RowProductsPage"));
const EventPage = lazy(() => import("./features/pages/EventPage/EventPage"));
const DashboardPage = lazy(() => import("./features/pages/DashboardPage/DashboardPage"));
const OrdersPage = lazy(() => import("./features/pages/OrdersPage/OrdersPage"));
const TrackOrderPage = lazy(() => import("./features/pages/TrackOrderPage/TrackOrderPage"));
const WalletPage = lazy(() => import("./features/pages/WalletPage/WalletPage"));
const ProfitAccountPage = lazy(() => import("./features/pages/ProfitAccountPage/ProfitAccountPage"));
const ProfitSummaryPage = lazy(() => import("./features/pages/ProfitSummaryPage/ProfitSummaryPage"));
const FollowedShopsPage = lazy(() => import("./features/pages/FollowedShopsPage/FollowedShopsPage"));
const AboutPage = lazy(() => import("./features/pages/AboutPage/AboutPage"));
const DropshippingPage = lazy(() => import("./features/pages/DropshippingPage/DropshippingPage"));
const ResellerPage = lazy(() => import("./features/pages/ResellerPage/ResellerPage"));
const TermsPage = lazy(() => import("./features/pages/TermsPage/TermsPage"));
const PrivacyPage = lazy(() => import("./features/pages/PrivacyPage/PrivacyPage"));

const App = () => {
  return (
    <Router>
      <div className="app-shell">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/shop/:shopId" element={<ShopPage />} />
            <Route path="/row/:rowId" element={<RowProductsPage />} />
            <Route path="/event/:eventId" element={<EventPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-orders" element={<OrdersPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profit-account" element={<ProfitAccountPage />} />
            <Route path="/profit-summary" element={<ProfitSummaryPage />} />
            <Route path="/followed-shops" element={<FollowedShopsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dropshipping" element={<DropshippingPage />} />
            <Route path="/reseller" element={<ResellerPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
