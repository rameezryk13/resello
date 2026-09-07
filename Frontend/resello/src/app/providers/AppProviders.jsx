import ErrorBoundary from "@/components/ui/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast/ToastContainer";
import AuthProvider from "@/context/AuthProvider";

// Every app-wide provider composes here so main.jsx stays a mount point and
// App.jsx stays the layout shell.
//
// ErrorBoundary sits outside ToastProvider so a crash inside the provider
// itself still renders the fallback instead of a blank page. AuthProvider is
// innermost so it can raise toasts, and it uses no router hooks — this whole
// tree mounts outside <Router>, which lives in App.jsx.
const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);

export default AppProviders;
