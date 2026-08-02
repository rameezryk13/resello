import { useNavigate } from "react-router-dom";
import StaticPageLayout from "@/components/sections/StaticPageLayout";

const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <StaticPageLayout>

        <div className="sp-hero">
          <div className="sp-hero-tag">Our Story</div>
          <h1>Empowering Pakistan's Entrepreneurs</h1>
          <p>Resello is Pakistan's trusted reselling &amp; dropshipping platform — connecting ambitious sellers with quality products, zero upfront investment required.</p>
        </div>

        <div className="sp-stats">
          <div className="sp-stat"><div className="sp-stat-num">150K+</div><div className="sp-stat-lbl">Products Listed</div></div>
          <div className="sp-stat"><div className="sp-stat-num">50K+</div><div className="sp-stat-lbl">Active Resellers</div></div>
          <div className="sp-stat"><div className="sp-stat-num">20+</div><div className="sp-stat-lbl">Categories</div></div>
          <div className="sp-stat"><div className="sp-stat-num">PKR 45K</div><div className="sp-stat-lbl">Avg Monthly Earn</div></div>
        </div>

        <div className="sp-card">
          <div className="sp-section-title">Who We Are</div>
          <p>Resello was built with a single mission: to make entrepreneurship accessible for every Pakistani — from housewives and students to full-time business owners. We bridge the gap between wholesale suppliers and everyday sellers, removing the barriers of inventory, logistics, and upfront capital.</p>
          <p>We source directly from verified manufacturers across Pakistan, ensuring the highest quality products at true wholesale prices. Our platform handles packaging, delivery, and cash collection — so you can focus entirely on growing your business.</p>
        </div>

        <div className="sp-grid-3">
          <div className="sp-icon-card"><div className="sp-icon-wrap">🎯</div><h3>Our Mission</h3><p>Create 1 million micro-entrepreneurs across Pakistan by removing every barrier to starting an online business.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">🚀</div><h3>Our Vision</h3><p>To be the most trusted reselling ecosystem in South Asia, powering financial independence for every household.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">💚</div><h3>Our Values</h3><p>Transparency, trust, and community. We grow when our resellers grow — that is the Resello promise.</p></div>
        </div>

        <div className="sp-card">
          <div className="sp-section-title">What Makes Us Different</div>
          <div className="sp-step"><div className="sp-step-num">1</div><div><h3>Zero Investment to Start</h3><p>No need to buy stock upfront. Browse our catalog, set your prices, and start selling within minutes.</p></div></div>
          <div className="sp-step"><div className="sp-step-num">2</div><div><h3>150,000+ Verified Products</h3><p>From fashion and electronics to cosmetics and kitchenware — all quality-checked and ready to ship.</p></div></div>
          <div className="sp-step"><div className="sp-step-num">3</div><div><h3>We Handle Logistics</h3><p>Delivery starting from PKR 90 via TCS, Leopards, and PostEx. Cash collection handled for you.</p></div></div>
          <div className="sp-step"><div className="sp-step-num">4</div><div><h3>Full Refund Policy</h3><p>Hassle-free returns and full refunds if a product does not meet expectations.</p></div></div>
        </div>

        <div className="sp-cta-strip">
          <h3>Have Questions? Let's Talk.</h3>
          <p>Email us at <a href="mailto:support@resello.pk">support@resello.pk</a> or call <a href="tel:+923001234567">+92 300 1234567</a></p>
        </div>

    </StaticPageLayout>
  );
};

export default AboutPage;
