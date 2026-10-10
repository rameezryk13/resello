import { createContext, useContext } from "react";

// Kept separate from AuthProvider.jsx so that file only exports a component.
// Mixing hook and component exports in one module breaks Vite's Fast Refresh —
// the same split ToastContext.js makes.
export const AuthContext = createContext(null);

const DEFAULT_AUTH = {
  user: null,
  loading: false,
  isAuthenticated: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  adminVerifyUser: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || DEFAULT_AUTH;
};
