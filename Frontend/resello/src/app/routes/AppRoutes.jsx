import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import RequireAuth from "./RequireAuth";
import { routeConfig } from "./routeConfig";

// Renders routeConfig. The Suspense boundary lives here rather than around
// individual routes so a lazy page swap shows one loader for the whole view.
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {routeConfig.map((route) => (
        // Read off the object rather than destructuring: this config has no
        // eslint-plugin-react, so a destructured `Component` param reads as
        // unused — ESLint can't see the JSX that uses it.
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <RequireAuth>
                <route.Component />
              </RequireAuth>
            ) : (
              <route.Component />
            )
          }
        />
      ))}
      {/* Legacy path kept as a redirect so old links and bookmarks don't 404. */}
      <Route path="/products" element={<Navigate to="/" replace />} />
      {/* Anything unmatched. Without this, <Routes> renders nothing for an
          unknown path and the page comes up blank apart from the footer — which
          is exactly how a wrong in-app link fails: silently, with no clue that
          the path was the problem. "View Orders" on the order-confirmed screen
          pointed at /orders (the API path) instead of /my-orders and did this. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
