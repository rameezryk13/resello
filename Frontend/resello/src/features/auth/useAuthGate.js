import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// The gate in front of every action that needs an account: favouriting, adding
// to cart, buying. Three call sites need it (the product page, the product card
// and the header), so the redirect and the "come back here afterwards" state
// live in one place rather than being re-derived in each.
const useAuthGate = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to send them back to. `search` is kept because a filtered product
  // list is a different page to the reseller than the bare path is.
  const here = `${location.pathname}${location.search}`;

  const sendToLogin = useCallback(() => {
    navigate("/login", { state: { from: here } });
  }, [navigate, here]);

  // Returns true when the caller should stop. Reads at the call site as
  // "if the gate blocked this, we're done".
  const blocked = useCallback(() => {
    if (isAuthenticated) return false;
    sendToLogin();
    return true;
  }, [isAuthenticated, sendToLogin]);

  return { isAuthenticated, blocked, sendToLogin };
};

export default useAuthGate;
