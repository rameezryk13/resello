import { useState, useCallback, useMemo } from "react";
import { ToastContext } from "@/context/ToastContext";
import Toast from "./Toast";

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Memoized so consumers can safely list `toast` in effect dependency arrays
  // without it re-firing them on every render.
  const toast = useMemo(
    () => ({
      success: (message, duration) => addToast("success", message, duration),
      error: (message, duration) => addToast("error", message, duration),
      warning: (message, duration) => addToast("warning", message, duration),
      info: (message, duration) => addToast("info", message, duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              id={t.id}
              type={t.type}
              message={t.message}
              duration={t.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
