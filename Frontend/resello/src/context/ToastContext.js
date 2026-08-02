import { createContext, useContext } from "react";

// Kept separate from ToastContainer.jsx so that file only exports a component.
// Mixing hook and component exports in one module breaks Vite's Fast Refresh.
export const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
