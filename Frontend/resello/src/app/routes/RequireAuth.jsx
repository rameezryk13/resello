import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import { useAuth } from "@/context/AuthContext";

// Gate for routes that read or write one person's own data.
//
// While a stored token is still being confirmed we hold the same PageLoader the
// lazy routes use — redirecting first would bounce a signed-in user to /login on
// every hard refresh. `state.from` is what LoginPage sends them back to.
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return children;
};

export default RequireAuth;
