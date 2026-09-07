import { HelpCircle, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header />
      <main className="container static-page-container align-center">
        <div className="static-hero-icon-card">
          <HelpCircle size={48} className="text-primary animate-bounce-slow" />
        </div>
        <h1 className="static-page-title">404 - Page Not Found</h1>
        <p className="static-page-subtitle">
          Oops! The page you are looking for does not exist or has been moved to a new destination.
        </p>
        <div className="static-actions-row">
          <button type="button" className="btn-primary" onClick={() => navigate("/")}>
            <Home size={18} /> Back to Homepage
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
