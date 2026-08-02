import ErrorBoundary from "@/components/ui/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast/ToastContainer";

// Every app-wide provider composes here so main.jsx stays a mount point and
// App.jsx stays the layout shell.
//
// ErrorBoundary sits outside ToastProvider so a crash inside the provider
// itself still renders the fallback instead of a blank page.
const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <ToastProvider>{children}</ToastProvider>
  </ErrorBoundary>
);

export default AppProviders;
