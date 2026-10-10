import { Heart, Instagram, Linkedin, Mail, MapPin, Phone, ShoppingBag, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  const footerGroups = [
    {
      title: "POLICIES & DETAILS",
      links: [
        { label: "About us", path: "/about" },
        { label: "How Resello Works", path: "/how-it-works" },
        { label: "Dropshipping", path: "/dropshipping" },
        { label: "Reseller Program", path: "/reseller" },
        { label: "Terms & conditions", path: "/terms" },
        { label: "Privacy policy", path: "/privacy" },
        { label: "Refund policy", path: "/shipping-policy", highlight: "red" },
      ],
    },
    {
      title: "CUSTOMER SUPPORT",
      links: [
        { label: "Track Your Order", path: "/track-order", highlight: "gold", hasTruck: true },
        { label: "My Orders & Status", path: "/my-orders" },
        { label: "Contact Support Helpline", path: "/contact" },
        { label: "FAQs & Help Center", path: "/faq" },
        { label: "Shipping & Returns", path: "/shipping-policy", highlight: "red" },
      ],
    },
    {
      title: "MY ACCOUNT",
      links: [
        { label: "My favorites", path: "/favorites" },
        { label: "Shopping bag", path: "/cart" },
        { label: "Order history", path: "/my-orders" },
        { label: "Profit account", path: "/profit-account" },
        { label: "Wallet & Payouts", path: "/wallet" },
      ],
    },
    {
      title: "HELPLINE & OFFICE",
      isOfficeColumn: true,
      links: [
        { label: "Electronics", path: "#" },
        { label: "Cosmetics", path: "#" },
        { label: "Women's Fashion", path: "#" },
        { label: "Men's Fashion", path: "#" },
      ],
    },
  ];

  const handleLinkClick = (link) => {
    if (link.path && link.path !== "#") {
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-column">
          <button type="button" className="footer-logo" onClick={() => navigate("/")} aria-label="ReSello Home">
            <span className="footer-logo-mark">
              <img src="/images/resello_icon.png" alt="" className="footer-logo-icon" />
            </span>
            <span>ReSello</span>
          </button>
          <p className="footer-copy">
            Pakistan's premier wholesale and reseller marketplace for imported fashion, accessories,
            electronics, home, and lifestyle essentials at guaranteed wholesale rates.
          </p>

          <div className="footer-delivery-card">
            <div className="footer-delivery-title">
              <Truck size={17} className="footer-delivery-icon" />
              <strong>Nationwide Express Delivery</strong>
            </div>
            <p className="footer-delivery-text">
              TCS, Leopards Courier, &amp; Trax with live parcel tracking.
            </p>
          </div>

          <div className="footer-socials" aria-label="Social links">
            <button type="button" aria-label="Instagram"><Instagram size={18} /></button>
            <button type="button" aria-label="LinkedIn"><Linkedin size={18} /></button>
            <button type="button" aria-label="Favorites" onClick={() => navigate("/favorites")}>
              <Heart size={18} />
            </button>
            <button type="button" aria-label="Cart" onClick={() => navigate("/cart")}>
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>

        {footerGroups.map((group) => (
          <nav key={group.title} className="footer-link-column" aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.isOfficeColumn ? (
              <div className="footer-office-info">
                <p className="footer-office-line"><MapPin size={15} /> Naseerabad, Peshawar Road, Rawalpindi, Pakistan</p>
                <p className="footer-office-line"><Phone size={15} /> +92 341-5133443</p>
                <p className="footer-office-line"><Mail size={15} /> sales@resello.pk</p>

                <div className="footer-developer-credit">
                  <span className="dev-credit-label">Website developed by <strong>Muhammad Rameez Khan</strong></span>
                  <a href="https://wa.me/923005575390" target="_blank" rel="noopener noreferrer" className="dev-credit-link">
                    <Phone size={13} /> Contact: 03005575390
                  </a>
                  <a href="mailto:rameezryk13@gmail.com" className="dev-credit-link">
                    <Mail size={13} /> Email: rameezryk13@gmail.com
                  </a>
                </div>
              </div>
            ) : (
              group.links.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  className={`footer-link ${link.highlight ? `highlight-${link.highlight}` : ""}`}
                  onClick={() => handleLinkClick(link)}
                >
                  {link.hasTruck && <Truck size={15} className="footer-inline-truck-icon" />}
                  <span>{link.label}</span>
                </button>
              ))
            )}
          </nav>
        ))}
      </div>

      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <div className="footer-bottom-copy">
            <p>© 2026 ReSello. All rights reserved.</p>
            <p className="footer-bottom-dev">
              Website developed by <strong>Muhammad Rameez Khan</strong> • Contact: 03005575390 • Email: rameezryk13@gmail.com
            </p>
          </div>
          <div className="footer-bottom-nav">
            <button type="button" onClick={() => navigate("/terms")}>Terms of service</button>
            <button type="button" onClick={() => navigate("/privacy")}>Privacy Policy</button>
            <button type="button" className="footer-link highlight-red" onClick={() => navigate("/shipping-policy")}>
              Refund policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
