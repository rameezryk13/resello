import { useEffect, useRef, useState } from "react";
import { Bell, Heart, LayoutDashboard, Landmark, LogIn, LogOut, Menu, Package, ShoppingCart, Store, TrendingUp, Truck, User, Wallet, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import NotificationPanel from "./NotificationPanel";
import ReviewModal from "@/components/ui/ReviewModal/ReviewModal";
import { SAMPLE_NOTIFICATIONS } from "@/constants/notifications";
import useAuthGate from "@/features/auth/useAuthGate";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import "./Header.css";

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
  const { user, logout } = useAuth();
  const { isAuthenticated, sendToLogin } = useAuthGate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const data = await get(endpoints.notifications.root);
        if (Array.isArray(data?.notifications) && data.notifications.length > 0) {
          // Put live review/order notifications at top
          const live = data.notifications;
          const merged = [...live, ...SAMPLE_NOTIFICATIONS.filter((s) => !live.some((l) => l.id === s.id))];
          setNotifications(merged);
        }
      } catch (err) {
        // Fallback to sample notifications on error
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchCartAndFavorites = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setFavoritesCount(0);
      return;
    }
    try {
      const [cartData, favData] = await Promise.all([
        get(endpoints.cart.root).catch(() => ({ cart: [] })),
        get(endpoints.favorites).catch(() => ({ favorites: [] })),
      ]);
      const totalCartQuantity = Array.isArray(cartData?.cart)
        ? cartData.cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
        : 0;
      const totalFavorites = Array.isArray(favData?.favorites) ? favData.favorites.length : 0;
      setCartCount(totalCartQuantity);
      setFavoritesCount(totalFavorites);
    } catch {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    fetchCartAndFavorites();

    const handleCartUpdate = (e) => {
      if (typeof e?.detail?.count === "number") {
        setCartCount(e.detail.count);
      } else {
        fetchCartAndFavorites();
      }
    };

    const handleFavUpdate = (e) => {
      if (typeof e?.detail?.count === "number") {
        setFavoritesCount(e.detail.count);
      } else {
        fetchCartAndFavorites();
      }
    };

    window.addEventListener("resello:cart-updated", handleCartUpdate);
    window.addEventListener("resello:favorites-updated", handleFavUpdate);

    return () => {
      window.removeEventListener("resello:cart-updated", handleCartUpdate);
      window.removeEventListener("resello:favorites-updated", handleFavUpdate);
    };
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const notificationsLabel =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  const openNotifications = () => {
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    setShowNotifications(true);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    if (isAuthenticated) {
      try {
        await post(endpoints.notifications.markRead);
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleSelectNotification = (item) => {
    // Mark clicked notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.type === "review" || item.order) {
      setShowNotifications(false);
      setReviewModalOrder(item.order || { orderId: item.orderId });
      setReviewModalProduct(null);
      setReviewModalOpen(true);
    }
  };

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
    { label: "My Profile", path: "/profile", icon: User },
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

  // Favourites and Cart hold per-user data, so signed out they're an empty
  // promise — send the visitor to sign in and return them here afterwards.
  const goToAccountArea = (path, close) => {
    close?.();
    if (isAuthenticated) navigate(path);
    else sendToLogin();
  };

  const handleLogout = async (close) => {
    close?.();
    await logout();
    // Home rather than staying put: half the account pages are gated, and
    // bouncing off a RequireAuth redirect is a worse exit than landing home.
    navigate("/");
  };

  // "Account" is what the button says to a stranger; once they're in, their own
  // name is the more useful label.
  const accountLabel = user?.name ? user.name.split(" ")[0] : "Account";

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
      "/profile", "/favorites", "/cart", "/checkout",
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
            <button
              type="button"
              onClick={() => goToAccountArea("/favorites")}
              className="icon-btn header-badge-wrap"
              aria-label={favoritesCount > 0 ? `Favorites, ${favoritesCount} items` : "Favorites"}
            >
              <Heart size={18} />
              {favoritesCount > 0 ? (
                <span className="notif-badge" aria-hidden="true">{favoritesCount}</span>
              ) : null}
              <span className="icon-label">Favorites</span>
            </button>
            <button
              type="button"
              onClick={() => goToAccountArea("/cart")}
              className="icon-btn header-badge-wrap"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="notif-badge" aria-hidden="true">{cartCount}</span>
              ) : null}
              <span className="icon-label">Cart</span>
            </button>
            {/* Signed out, Alerts and Account have nothing to show, so they
                collapse into the one thing that does: sign in. */}
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={openNotifications}
                  className="icon-btn notif-bell-wrap"
                  aria-label={notificationsLabel}
                  aria-haspopup="dialog"
                  aria-expanded={showNotifications}
                >
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="notif-badge" aria-hidden="true">{unreadCount}</span>
                  ) : null}
                  <span className="icon-label">Alerts</span>
                </button>
                <div className="profile-menu-container" ref={profileMenuRef}>
                  <button
                    type="button" className="icon-btn" aria-label={`Account, signed in as ${user?.name}`}
                    aria-haspopup="menu" aria-expanded={showProfileMenu}
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                  >
                    <User size={18} />
                    <span className="icon-label">{accountLabel}</span>
                  </button>
                  <div className={`profile-dropdown ${showProfileMenu ? "active" : ""}`}>
                    {profileMenuItems.map((item) => (
                      <button key={item.path} type="button" className="profile-dropdown-link" onClick={() => goToProfilePage(item.path)}>
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="profile-dropdown-link profile-dropdown-logout"
                      onClick={() => handleLogout(() => setShowProfileMenu(false))}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button type="button" onClick={sendToLogin} className="icon-btn header-login-btn">
                <LogIn size={18} />
                <span className="icon-label">Log in</span>
              </button>
            )}
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
              <button
                type="button"
                onClick={() => goToAccountArea("/favorites", () => setShowMobileMenu(false))}
              >
                <Heart size={18} /> Favorites
                {favoritesCount > 0 ? (
                  <span className="mobile-notif-count" aria-hidden="true">{favoritesCount}</span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => goToAccountArea("/cart", () => setShowMobileMenu(false))}
              >
                <ShoppingCart size={18} /> Cart
                {cartCount > 0 ? (
                  <span className="mobile-notif-count" aria-hidden="true">{cartCount}</span>
                ) : null}
              </button>
              {isAuthenticated ? (
                <>
                  <button type="button" onClick={openNotifications} aria-label={notificationsLabel}>
                    <Bell size={18} /> Notifications
                    {unreadCount > 0 ? (
                      <span className="mobile-notif-count" aria-hidden="true">{unreadCount}</span>
                    ) : null}
                  </button>
                  <div className="mobile-action-menu-divider">{accountLabel}</div>
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.path} type="button" onClick={() => goToMobilePage(item.path)}>
                        <Icon size={18} /> {item.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleLogout(() => setShowMobileMenu(false))}
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileMenu(false);
                    sendToLogin();
                  }}
                >
                  <LogIn size={18} /> Log in
                </button>
              )}
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

      <NotificationPanel
        open={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllRead={markAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      <ReviewModal
        open={reviewModalOpen}
        order={reviewModalOrder}
        product={reviewModalProduct}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
};

export default Header;
