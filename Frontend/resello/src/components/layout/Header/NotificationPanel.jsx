import { useEffect, useRef } from "react";
import { BadgePercent, CheckCheck, Package, Star, Truck, Wallet, X } from "lucide-react";
import "./NotificationPanel.css";

const TYPE_ICONS = {
  promo: BadgePercent,
  order: Package,
  shipping: Truck,
  wallet: Wallet,
  review: Star,
};

const NotificationPanel = ({ open, notifications, onClose, onMarkAllRead, onSelectNotification }) => {
  const closeButtonRef = useRef(null);
  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.documentElement.style.overflow;
    const previousPadding = document.documentElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.paddingRight = previousPadding;
      document.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <aside
        className="notif-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="notif-panel-head">
          <div className="notif-panel-title">
            <h2>Notifications</h2>
            {unreadCount > 0 ? <span className="notif-panel-count">{unreadCount} new</span> : null}
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            className="notif-close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>

        {unreadCount > 0 ? (
          <button type="button" className="notif-mark-all" onClick={onMarkAllRead}>
            <CheckCheck size={15} aria-hidden="true" />
            Mark all as read
          </button>
        ) : null}

        <ul className="notif-list">
          {notifications.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Package;

            return (
              <li
                key={item.id}
                className={`notif-item ${item.unread ? "unread" : ""} ${item.type === "review" ? "review-actionable" : ""}`}
                onClick={() => {
                  if (onSelectNotification) onSelectNotification(item);
                }}
              >
                <span className={`notif-item-icon type-${item.type}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div className="notif-item-body">
                  <div className="notif-item-title">
                    {item.title}
                    {item.unread ? <span className="notif-dot" aria-label="Unread" /> : null}
                  </div>
                  <p className="notif-item-message">{item.message}</p>
                  <span className="notif-item-time">{item.time}</span>
                  {item.type === "review" && (
                    <span className="notif-review-cta">★ Click to Rate & Add Photo</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
};

export default NotificationPanel;
