import { Sparkles, ShoppingBag, DollarSign, Send, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header";
import AccountHero from "@/components/sections/AccountHero";
import "./HowItWorksPage.css";

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header />
      <AccountHero
        title="How Resello Works — Zero Investment Reselling"
        subtitle="Start your online business without inventory investment. Select products, add your profit margin, and we handle delivery."
      />
      <main className="container static-page-container">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Step 1 */}
          <div className="static-card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div className="static-hero-icon-card" style={{ width: 64, height: 64 }}>
              <ShoppingBag size={28} className="text-primary" />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ff8c00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 01</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 6px 0" }}>Browse &amp; Pick Wholesale Products</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Explore thousands of high-demand fashion suits, cosmetics, accessories, and electronics at wholesale prices from verified suppliers.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="static-card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div className="static-hero-icon-card" style={{ width: 64, height: 64 }}>
              <DollarSign size={28} className="text-primary" />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ff8c00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 02</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 6px 0" }}>Set Your Profit &amp; Share with Customers</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Share product photos on WhatsApp, Instagram, or Facebook. You decide how much profit to add to each product.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="static-card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div className="static-hero-icon-card" style={{ width: 64, height: 64 }}>
              <Send size={28} className="text-primary" />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ff8c00", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 03</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 6px 0" }}>We Fulfill Order &amp; Transfer Your Margin</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Once your customer places an order, we package and deliver it nationwide with Cash on Delivery. Your profit margin is credited straight to your Resello Wallet!
              </p>
            </div>
          </div>
        </div>

        <div className="static-card align-center" style={{ marginTop: 24, background: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)" }}>
          <Sparkles size={32} className="text-primary" style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px 0" }}>Ready to Start Your Reselling Journey?</h3>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 18px 0" }}>
            Join thousands of successful resellers earning daily income with zero risk.
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate("/signup")}>
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;
