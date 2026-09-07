import { Bell, CheckCheck, PackageCheck, Star, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header/Header";
import AccountHero from "@/components/sections/AccountHero";
import { get } from "@/api/client";
import endpoints from "@/api/endpoints";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    get(endpoints.notifications.root)
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <div className="animate-fade-in">
      <Header />
      <AccountHero
        title="Notifications &amp; Activity Alerts"
        subtitle="Stay updated on order status changes, delivered reviews, and reseller profit payout alerts."
      />
      <main className="container static-page-container">
        {notifications.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="static-card"
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 20px",
                  background: n.read ? "#ffffff" : "#fff8f0",
                  borderColor: n.read ? "#e2e8f0" : "rgba(255, 140, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#fff0e0",
                    color: "#e65100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {n.type === "REVIEW_REQUEST" ? <Star size={20} /> : <Bell size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                    {n.title || "Notification Alert"}
                  </h4>
                  <p style={{ fontSize: 13, color: "#475569", margin: "3px 0 0 0" }}>{n.message}</p>
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="static-card" style={{ textAlign: "center", padding: 48 }}>
            <Bell size={36} style={{ color: "#94a3b8", marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>No Notifications</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "6px 0 0 0" }}>
              You're all caught up! New order alerts and review prompts will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
