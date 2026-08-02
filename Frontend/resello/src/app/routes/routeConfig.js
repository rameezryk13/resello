import { lazy } from "react";
import Home from "@/features/home/HomePage";

// Single source of truth for every route in the app. Adding a page is a
// one-line change here; <AppRoutes/> just renders this list.
//
// Home stays eager: it's the landing route, so code-splitting it would only
// add a network round trip before the first paint. Every other page is loaded
// on demand, which keeps the initial bundle to the homepage's own code.
export const routeConfig = [
  { path: "/", Component: Home },
  { path: "/product/:id", Component: lazy(() => import("@/features/product/ProductDetailPage")) },
  { path: "/search", Component: lazy(() => import("@/features/search/SearchPage")) },
  { path: "/favorites", Component: lazy(() => import("@/features/favorites/FavoritesPage")) },
  { path: "/cart", Component: lazy(() => import("@/features/cart/CartPage")) },
  { path: "/checkout", Component: lazy(() => import("@/features/checkout/CheckoutPage")) },
  { path: "/shop/:shopId", Component: lazy(() => import("@/features/shop/ShopPage")) },
  { path: "/row/:rowId", Component: lazy(() => import("@/features/row/RowProductsPage")) },
  { path: "/event/:eventId", Component: lazy(() => import("@/features/event/EventPage")) },
  { path: "/dashboard", Component: lazy(() => import("@/features/dashboard/DashboardPage")) },
  { path: "/my-orders", Component: lazy(() => import("@/features/orders/OrdersPage")) },
  { path: "/track-order", Component: lazy(() => import("@/features/track-order/TrackOrderPage")) },
  { path: "/wallet", Component: lazy(() => import("@/features/wallet/WalletPage")) },
  { path: "/profit-account", Component: lazy(() => import("@/features/profit-account/ProfitAccountPage")) },
  { path: "/profit-summary", Component: lazy(() => import("@/features/profit-summary/ProfitSummaryPage")) },
  { path: "/followed-shops", Component: lazy(() => import("@/features/followed-shops/FollowedShopsPage")) },
  { path: "/about", Component: lazy(() => import("@/features/about/AboutPage")) },
  { path: "/dropshipping", Component: lazy(() => import("@/features/dropshipping/DropshippingPage")) },
  { path: "/reseller", Component: lazy(() => import("@/features/reseller/ResellerPage")) },
  { path: "/terms", Component: lazy(() => import("@/features/terms/TermsPage")) },
  { path: "/privacy", Component: lazy(() => import("@/features/privacy/PrivacyPage")) },
];
