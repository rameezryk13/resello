import { lazy } from "react";
import Home from "@/features/home/HomePage";

// Single source of truth for every route in the app. Adding a page is a
// one-line change here; <AppRoutes/> just renders this list.
//
// Home stays eager: it's the landing route, so code-splitting it would only
// add a network round trip before the first paint. Every other page is loaded
// on demand, which keeps the initial bundle to the homepage's own code.
//
// `protected: true` marks a page that reads or writes one person's own data —
// AppRoutes wraps those in <RequireAuth/>. Browsing (home, search, product,
// shop, and the static pages) deliberately stays open to visitors.
export const routeConfig = [
  { path: "/", Component: Home },
  { path: "/login", Component: lazy(() => import("@/features/auth/LoginPage")) },
  { path: "/signup", Component: lazy(() => import("@/features/auth/SignupPage")) },
  { path: "/product/:id", Component: lazy(() => import("@/features/product/ProductDetailPage")) },
  { path: "/search", Component: lazy(() => import("@/features/search/SearchPage")) },
  { path: "/favorites", Component: lazy(() => import("@/features/favorites/FavoritesPage")), protected: true },
  { path: "/cart", Component: lazy(() => import("@/features/cart/CartPage")), protected: true },
  { path: "/checkout", Component: lazy(() => import("@/features/checkout/CheckoutPage")), protected: true },
  { path: "/shop/:shopId", Component: lazy(() => import("@/features/shop/ShopPage")) },
  { path: "/row/:rowId", Component: lazy(() => import("@/features/row/RowProductsPage")) },
  { path: "/event/:eventId", Component: lazy(() => import("@/features/event/EventPage")) },
  { path: "/profile", Component: lazy(() => import("@/features/profile/ProfilePage")), protected: true },
  { path: "/dashboard", Component: lazy(() => import("@/features/dashboard/DashboardPage")), protected: true },
  { path: "/my-orders", Component: lazy(() => import("@/features/orders/OrdersPage")), protected: true },
  { path: "/track-order", Component: lazy(() => import("@/features/track-order/TrackOrderPage")), protected: true },
  { path: "/wallet", Component: lazy(() => import("@/features/wallet/WalletPage")), protected: true },
  { path: "/profit-account", Component: lazy(() => import("@/features/profit-account/ProfitAccountPage")), protected: true },
  { path: "/profit-summary", Component: lazy(() => import("@/features/profit-summary/ProfitSummaryPage")), protected: true },
  { path: "/followed-shops", Component: lazy(() => import("@/features/followed-shops/FollowedShopsPage")), protected: true },
  { path: "/about", Component: lazy(() => import("@/features/about/AboutPage")) },
  { path: "/dropshipping", Component: lazy(() => import("@/features/dropshipping/DropshippingPage")) },
  { path: "/reseller", Component: lazy(() => import("@/features/reseller/ResellerPage")) },
  { path: "/terms", Component: lazy(() => import("@/features/terms/TermsPage")) },
  { path: "/privacy", Component: lazy(() => import("@/features/privacy/PrivacyPage")) },
  { path: "/contact", Component: lazy(() => import("@/features/static/ContactPage")) },
  { path: "/faq", Component: lazy(() => import("@/features/static/FaqPage")) },
  { path: "/order-confirmation", Component: lazy(() => import("@/features/static/OrderConfirmationPage")), protected: true },
  { path: "/notifications", Component: lazy(() => import("@/features/static/NotificationsPage")), protected: true },
  { path: "/shipping-policy", Component: lazy(() => import("@/features/static/ShippingPolicyPage")) },
  { path: "/how-it-works", Component: lazy(() => import("@/features/static/HowItWorksPage")) },
  { path: "/404", Component: lazy(() => import("@/features/static/NotFoundPage")) },
  { path: "*", Component: lazy(() => import("@/features/static/NotFoundPage")) },
];
