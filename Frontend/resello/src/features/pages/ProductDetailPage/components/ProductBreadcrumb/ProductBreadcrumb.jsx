import { useNavigate } from "react-router-dom";
import "./ProductBreadcrumb.css";

const ProductBreadcrumb = ({ category, name }) => {
  const navigate = useNavigate();

  return (
    <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
      <button type="button" className="pdp-crumb" onClick={() => navigate("/")}>
        Home
      </button>
      <span className="pdp-sep">/</span>
      <span className="pdp-crumb-muted">{category}</span>
      <span className="pdp-sep">/</span>
      <span className="pdp-crumb-current">{name}</span>
    </nav>
  );
};

export default ProductBreadcrumb;
