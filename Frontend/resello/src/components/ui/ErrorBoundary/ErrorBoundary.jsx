import React from "react";
import { AlertTriangle } from "lucide-react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <AlertTriangle className="error-boundary__icon" size={48} />
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              We encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              type="button"
              className="btn-primary error-boundary__button"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
