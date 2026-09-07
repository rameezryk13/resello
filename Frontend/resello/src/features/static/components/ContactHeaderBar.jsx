import { Clock, Mail } from "lucide-react";

const ContactHeaderBar = () => {
  return (
    <div
      className="static-card"
      style={{
        padding: "20px 28px",
        background: "linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Mail className="text-primary" size={22} />
          <div>
            <strong style={{ fontSize: 13, display: "block", color: "#64748b" }}>
              Email Support
            </strong>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              support@resello.app
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Clock className="text-primary" size={22} />
          <div>
            <strong style={{ fontSize: 13, display: "block", color: "#64748b" }}>
              Support Hours
            </strong>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Mon - Sat (9 AM - 8 PM PKT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHeaderBar;
