import { useEffect, useRef, useState } from "react";
import { Heart, LayoutDashboard, Landmark, Menu, Package, ShoppingCart, Store, TrendingUp, Truck, User, Wallet, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "./Header.css";

// Maps each top-nav label to the category value(s) used by the products
// filter API. Comma-separated values group several backend categories
// under one nav link (e.g. "Fashion" covers Men's/Women's/Kids).
const CATEGORY_NAV_LINKS = [
  { label: "All Categories", value: "" },
  { label: "Fashion", value: "Men's Fashion,Women's Fashion,Kids Clothing" },
  { label: "Electronics", value: "Electronics" },
  { label: "Home & Garden", value: "Home Appliances,Furniture" },
  { label: "Sports", value: "Sports Equipment" },
  { label: "Toys", value: "Toys" },
];

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setShowProfileMenu(false);
      if (!mobileMenuRef.current?.contains(event.target)) setShowMobileMenu(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener(  "keydown", handleEscape);
    };
  }, []);

  const profileMenuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Orders", path: "/my-orders", icon: Package },
    { label: "Track Order", path: "/track-order", icon: Truck },
    { label: "Wallet", path: "/wallet", icon: Wallet },
    { label: "Profit Account", path: "/profit-account", icon: Landmark },
    { label: "Payment Summary", path: "/profit-summary", icon: TrendingUp },
    { label: "Followed Shop", path: "/followed-shops", icon: Store },
  ];

  const goToProfilePage = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const goToMobilePage = (path) => {
    setShowMobileMenu(false);
    navigate(path);
  };

  const staticPages = [
    { label: "About Us", path: "/about" },
    { label: "Dropshipping", path: "/dropshipping" },
    { label: "Reseller", path: "/reseller" },
    { label: "Terms", path: "/terms" },
    { label: "Privacy", path: "/privacy" },
  ];

  const isStaticPage = staticPages.some((p) => pathname === p.path);

  const goToCategory = (value) => {
    setShowMobileMenu(false);
    const params = new URLSearchParams({ section: "more" });
    if (value) params.set("category", value);
    navigate(`/?${params.toString()}`);
  };

  const hideCategoryNav =
    pathname.startsWith("/product/") ||
    isStaticPage ||
    [
      "/favorites", "/cart", "/checkout",
      "/dashboard", "/my-orders", "/track-order",
      "/wallet", "/profit-account",
      "/profit-summary", "/followed-shops",
    ].includes(pathname);

  return (
    <div className="site-header animate-fade-in">
      {/* Top info bar */}
      <div className="header-info-bar">
        <div className="container">
          <span className="header-info-tagline">🇵🇰 Pakistan's #1 Reselling Platform &nbsp;·&nbsp; Free to join &nbsp;·&nbsp; Earn up to PKR 100,000/month</span>
          <div className="header-info-links">
            <span>✉ support@resello.pk</span>
          </div>
        </div>
      </div>

      {/* Main top bar */}
      <div className="top-bar">
        <div className="container">
          <div className="logo" onClick={() => navigate("/")}>ReSello</div>
          <SearchBar />
          <div className="nav-icons">
            <button type="button" onClick={() => navigate("/favorites")} className="icon-btn" aria-label="Favorites">
              <Heart size={18} />
              <span className="icon-label">Favorites</span>
            </button>
            <button type="button" onClick={() => navigate("/cart")} className="icon-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              <span className="icon-label">Cart</span>
            </button>
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                type="button" className="icon-btn" aria-label="Account"
                aria-haspopup="menu" aria-expanded={showProfileMenu}
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <User size={18} />
                <span className="icon-label">Account</span>
              </button>
              <div className={`profile-dropdown ${showProfileMenu ? "active" : ""}`}>
                {profileMenuItems.map((item) => (
                  <button key={item.path} type="button" className="profile-dropdown-link" onClick={() => goToProfilePage(item.path)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mobile-menu-container" ref={mobileMenuRef}>
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMobileMenu}
              aria-controls="mobile-account-menu"
              onClick={() => setShowMobileMenu((current) => !current)}
            >
              {showMobileMenu ? <X size={21} /> : <Menu size={21} />}
            </button>
            <div
              id="mobile-account-menu"
              className={`mobile-action-menu ${showMobileMenu ? "active" : ""}`}
            >
              <button type="button" onClick={() => goToMobilePage("/favorites")}>
                <Heart size={18} /> Favorites
              </button>
              <button type="button" onClick={() => goToMobilePage("/cart")}>
                <ShoppingCart size={18} /> Cart
              </button>
              <div className="mobile-action-menu-divider">Account</div>
              {profileMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.path} type="button" onClick={() => goToMobilePage(item.path)}>
                    <Icon size={18} /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category / static-page nav */}
      {!hideCategoryNav && (
        <nav className="main-nav">
          <div className="container">
            <ul>
              {CATEGORY_NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToCategory(link.value);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {/* Static pages secondary nav */}
      {isStaticPage && (
        <nav className="main-nav static-pages-nav">
          <div className="container">
            <ul>
              {staticPages.map((p) => (
                <li key={p.path}>
                  <a
                    href="#"
                    className={pathname === p.path ? "active-static-link" : ""}
                    onClick={(e) => { e.preventDefault(); navigate(p.path); window.scrollTo({top:0,behavior:"smooth"}); }}
                  >
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Header;
