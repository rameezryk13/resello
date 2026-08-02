import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
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
        <Route key={route.path} path={route.path} element={<route.Component />} />
      ))}
      {/* Legacy path kept as a redirect so old links and bookmarks don't 404. */}
      <Route path="/products" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
