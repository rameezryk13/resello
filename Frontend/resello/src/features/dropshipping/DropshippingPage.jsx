import StaticPageLayout from "@/components/sections/StaticPageLayout";
import "./DropshippingPage.css";

const DropshippingPage = () => {
  return (
    <StaticPageLayout>

        <div className="sp-hero">
          <div className="sp-hero-tag">Dropshipping</div>
          <h1>Sell Without Inventory</h1>
          <p>Start a profitable online business today — no stock, no warehouse, no logistics headaches. Resello handles it all.</p>
        </div>

        <div className="sp-highlight">
          <p>💡 <strong>Did you know?</strong> 84% of e-commerce retailers say finding a reliable supplier is the #1 hurdle to starting dropshipping. With Resello, that problem is solved on day one.</p>
        </div>

        <div className="sp-card">
          <div className="sp-section-title">What is Dropshipping?</div>
          <p>Dropshipping is a business model where you sell products online without ever holding inventory. When a customer places an order, Resello ships the product directly to them on your behalf — you keep the profit margin.</p>
          <p style={{marginTop:"10px"}}>You focus on marketing and customer relationships. We handle sourcing, packaging, shipping, and cash-on-delivery collection.</p>
        </div>

        <div className="sp-grid-2">
          <div className="sp-card" style={{marginBottom:0}}>
            <div className="sp-section-title">How It Works</div>
            <div className="sp-step"><div className="sp-step-num">1</div><div><h3>Browse Products</h3><p>Choose from 150,000+ verified products across 20+ categories.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">2</div><div><h3>Set Your Price</h3><p>Add your profit margin — no restrictions, completely your call.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">3</div><div><h3>Share &amp; Sell</h3><p>Share product links on WhatsApp, Facebook, Instagram.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">4</div><div><h3>We Deliver</h3><p>Resello ships and collects payment. Profit credited to you.</p></div></div>
          </div>
          <div className="sp-card" style={{marginBottom:0}}>
            <div className="sp-section-title">Earnings Example</div>
            <p className="sp-small-label">Example: A cosmetics product</p>
            <div className="sp-profit-row"><span>Wholesale Price</span><span>PKR 800</span></div>
            <div className="sp-profit-row"><span>Your Selling Price</span><span>PKR 1,200</span></div>
            <div className="sp-profit-row"><span>Delivery Fee</span><span>PKR 90</span></div>
            <div className="sp-profit-row"><span>Platform Fee</span><span>PKR 0</span></div>
            <div className="sp-profit-row sp-profit-total"><span>Your Profit 🎉</span><span>PKR 310</span></div>
            <div className="sp-divider" />
            <p className="sp-small-label">Sell 5 items/day → <strong style={{color:"var(--primary-color)"}}>~PKR 46,500/month</strong></p>
          </div>
        </div>

        <div className="sp-grid-3" style={{marginTop:"24px"}}>
          <div className="sp-icon-card"><div className="sp-icon-wrap">🚀</div><h3>Zero Investment</h3><p>Start earning with PKR 0 upfront. No warehouse, no advance stock buying.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">📦</div><h3>Fast Delivery</h3><p>Nationwide via TCS, Leopards &amp; PostEx. Starting at just PKR 90.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">💰</div><h3>Cash on Delivery</h3><p>We collect COD from your customers and transfer your profit directly.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">📱</div><h3>Mobile First</h3><p>Manage your entire dropshipping business from your smartphone, anytime.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">🛡️</div><h3>Verified Products</h3><p>All products sourced from trusted Pakistani manufacturers and suppliers.</p></div>
          <div className="sp-icon-card"><div className="sp-icon-wrap">📊</div><h3>Live Tracking</h3><p>Track every order in real-time. Stay updated, keep customers happy.</p></div>
        </div>

        <div className="sp-cta-strip">
          <h3>Ready to Start Dropshipping?</h3>
          <p>Download the Resello app and launch your store in under 5 minutes.</p>
        </div>

    </StaticPageLayout>
  );
};

export default DropshippingPage;
