import { createContext, useContext } from "react";

// Kept separate from AuthProvider.jsx so that file only exports a component.
// Mixing hook and component exports in one module breaks Vite's Fast Refresh —
// the same split ToastContext.js makes.
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
