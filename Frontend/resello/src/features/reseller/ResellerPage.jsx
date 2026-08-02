import StaticPageLayout from "@/components/sections/StaticPageLayout";

const ResellerPage = () => {
  return (
    <StaticPageLayout>

        <div className="sp-hero">
          <div className="sp-hero-tag">Reseller Program</div>
          <h1>Turn Selling Into a Career</h1>
          <p>Join Pakistan's fastest-growing community of resellers. Earn up to PKR 100,000 monthly working from home — on your own schedule.</p>
        </div>

        <div className="sp-stats">
          <div className="sp-stat"><div className="sp-stat-num">PKR 100K</div><div className="sp-stat-lbl">Max Monthly Earning</div></div>
          <div className="sp-stat"><div className="sp-stat-num">150K+</div><div className="sp-stat-lbl">Products to Sell</div></div>
          <div className="sp-stat"><div className="sp-stat-num">PKR 90</div><div className="sp-stat-lbl">Min Delivery Cost</div></div>
          <div className="sp-stat"><div className="sp-stat-num">PKR 0</div><div className="sp-stat-lbl">Upfront Investment</div></div>
        </div>

        <div className="sp-card">
          <div className="sp-section-title">Who Can Be a Reseller?</div>
          <p>Anyone! Resello is designed for people from all walks of life who want to earn money online without leaving home.</p>
          <div className="sp-badges">
            {["👩‍🏫 Housewives","🎓 Students","💼 Working Women","👔 Businesspeople","✂️ Boutique Owners","💄 Beauticians","🧑‍💻 Freelancers"].map(b => (
              <span key={b} className="sp-badge">{b}</span>
            ))}
          </div>
        </div>

        <div className="sp-grid-2">
          <div className="sp-card" style={{marginBottom:0}}>
            <div className="sp-section-title">How to Become a Reseller</div>
            <div className="sp-step"><div className="sp-step-num">1</div><div><h3>Create Your Account</h3><p>Sign up free on Resello — takes less than 2 minutes.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">2</div><div><h3>Pick Your Niche</h3><p>Choose categories you love — fashion, cosmetics, electronics, and more.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">3</div><div><h3>Set Your Prices</h3><p>Add your markup freely — no limits, no restrictions.</p></div></div>
            <div className="sp-step"><div className="sp-step-num">4</div><div><h3>Share &amp; Earn</h3><p>Post on WhatsApp, Facebook, Instagram — start collecting orders.</p></div></div>
          </div>
          <div className="sp-card" style={{marginBottom:0}}>
            <div className="sp-section-title">Reseller Benefits</div>
            <div className="sp-step"><div className="sp-step-num sp-check">✓</div><div><h3>Wholesale Prices</h3><p>Access supplier-direct pricing unavailable anywhere else.</p></div></div>
            <div className="sp-step"><div className="sp-step-num sp-check">✓</div><div><h3>No Inventory Risk</h3><p>Never get stuck with unsold stock. Order only when customers pay.</p></div></div>
            <div className="sp-step"><div className="sp-step-num sp-check">✓</div><div><h3>COD Support</h3><p>We collect cash on delivery and credit your profit directly.</p></div></div>
            <div className="sp-step"><div className="sp-step-num sp-check">✓</div><div><h3>Reseller Community</h3><p>Join WhatsApp groups, share tips with top sellers nationwide.</p></div></div>
          </div>
        </div>

        <div className="sp-card" style={{marginTop:"24px"}}>
          <div className="sp-section-title">Top Reselling Categories</div>
          <div className="sp-grid-3">
            <div className="sp-icon-card"><div className="sp-icon-wrap">💄</div><h3>Cosmetics</h3><p>High demand, great margins. Perfect for female resellers targeting local networks.</p></div>
            <div className="sp-icon-card"><div className="sp-icon-wrap">👗</div><h3>Women's Fashion</h3><p>Trending styles, seasonal collections — always in high demand across Pakistan.</p></div>
            <div className="sp-icon-card"><div className="sp-icon-wrap">📱</div><h3>Electronics</h3><p>Gadgets and accessories with strong demand and repeat buying behaviour.</p></div>
          </div>
        </div>

        <div className="sp-cta-strip">
          <h3>Start Your Reselling Journey Today</h3>
          <p>Hundreds of thousands of Pakistanis are already earning. Join Resello free and start today.</p>
        </div>

    </StaticPageLayout>
  );
};

export default ResellerPage;
