import { Heart, Instagram, Linkedin, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  const footerGroups = [
    {
      title: "Information",
      links: [
        { label: "About us", path: "/about" },
        { label: "How Resello Works", path: "/how-it-works" },
        { label: "Dropshipping", path: "/dropshipping" },
        { label: "Reseller Program", path: "/reseller" },
        { label: "Terms & conditions", path: "/terms" },
        { label: "Privacy policy", path: "/privacy" },
      ],
    },
    {
      title: "Customer care",
      links: [
        { label: "Contact Support", path: "/contact" },
        { label: "FAQs & Help Center", path: "/faq" },
        { label: "Shipping & Returns", path: "/shipping-policy" },
      ],
    },
    {
      title: "My account",
      links: [
        { label: "My favorites", path: "/favorites" },
        { label: "Shopping bag", path: "/cart" },
        { label: "Order history", path: "/my-orders" },
        { label: "Profit account", path: "/profit-account" },
      ],
    },
    {
      title: "Popular categories",
      links: [
        { label: "Electronics", path: "#" },
        { label: "Cosmetics", path: "#" },
        { label: "Women's Fashion", path: "#" },
        { label: "Men's Fashion", path: "#" },
        { label: "Kids Clothing", path: "#" },
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
          <button type="button" className="footer-logo" onClick={() => navigate("/")}>
            <span className="footer-logo-mark">R</span>
            <span>ReSello</span>
          </button>
          <p className="footer-copy">
            ReSello is a reseller marketplace for fashion, beauty, electronics, home and everyday
            essentials. Shop from trusted sellers with fast delivery and a simple return window.
          </p>

          <div className="footer-contact">
            <h3>Contact</h3>
            <p><Mail size={16} /> hello@resello.app</p>

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
            {group.links.map((link) => (
              <button
                key={link.label}
                type="button"
                className="footer-link"
                onClick={() => handleLinkClick(link)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
