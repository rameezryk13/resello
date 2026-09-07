import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header";
import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header />
      <main className="container static-page-container align-center">
        <div className="static-hero-icon-card" style={{ background: "#dcfce7", borderColor: "#86efac" }}>
          <CheckCircle2 size={48} style={{ color: "#166534" }} />
        </div>
        <h1 className="static-page-title">Order Confirmed!</h1>
        <p className="static-page-subtitle">
          Thank you for your order. We have received your purchase and your items are being prepared for dispatch.
        </p>

        <div className="static-card" style={{ width: "100%", maxWidth: 520, textAlign: "left", padding: 24, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 12 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>Status</span>
            <strong style={{ color: "#166534", fontSize: 14 }}>Confirmed &amp; Processing</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 12 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>Payment Method</span>
            <strong style={{ fontSize: 14 }}>Cash on Delivery (COD) / Wallet</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>Estimated Delivery</span>
            <strong style={{ fontSize: 14 }}>2 - 4 Working Days</strong>
          </div>
        </div>

        <div className="static-actions-row">
          <button type="button" className="btn-primary" onClick={() => navigate("/my-orders")}>
            <Package size={18} /> View My Orders
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate("/")}>
            <ShoppingBag size={18} /> Continue Shopping
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
