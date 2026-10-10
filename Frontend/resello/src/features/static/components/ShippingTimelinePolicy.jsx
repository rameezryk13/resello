import { RefreshCw, Truck } from "lucide-react";

const ShippingTimelinePolicy = () => {
  return (
    <div className="static-grid-2">
      <div className="static-card">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <Truck size={24} className="text-primary" />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
            Shipping &amp; Delivery Timeline
          </h3>
        </div>
        <ul className="timeline-list">
          <li className="timeline-step">
            <span className="timeline-dot" />
            <strong style={{ display: "block", fontSize: 14 }}>Order Dispatch (24 Hours)</strong>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0 0" }}>
              Orders are verified and handed over to courier partners (TCS, Leopard, M&amp;P)
              within 24 hours.
            </p>
          </li>

          <li className="timeline-step">
            <span className="timeline-dot" />
            <strong style={{ display: "block", fontSize: 14 }}>
              Major Cities Delivery (2 - 3 Days)
            </strong>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0 0" }}>
              Deliveries to Lahore, Karachi, Islamabad, Rawalpindi, and Faisalabad take 2 to 3
              working days.
            </p>
          </li>

          <li className="timeline-step">
            <span className="timeline-dot" />
            <strong style={{ display: "block", fontSize: 14 }}>
              Other Regions (3 - 5 Days)
            </strong>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0 0" }}>
              Remote areas and other districts across Pakistan are fulfilled within 3 to 5
              business days.
            </p>
          </li>
        </ul>
      </div>

      <div className="static-card">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <RefreshCw size={24} className="text-primary" />
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
            Returns &amp; Replacement Policy
          </h3>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
          We ensure 100% customer satisfaction. If an order arrives damaged, defective, or
          incorrect, you or your customer can initiate a return within 7 days of delivery using
          the portal above.
        </p>
        <div
          style={{
            background: "#fff8f0",
            border: "1px solid rgba(255,140,0,0.3)",
            borderRadius: 10,
            padding: 16,
            fontSize: 13,
            color: "#92400e",
          }}
        >
          <strong>⚠️ Defect Return &amp; Proof Requirements:</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
            <li>
              <strong>Mandatory Video (1 Video):</strong> You must provide 1 video proof
              demonstrating the defect, malfunction, or courier transit damage upon opening.
            </li>
            <li>
              <strong>Optional Photos (Minimum 3 Pictures):</strong> Adding photos is optional, but if
              you include pictures, a minimum of 3 clear photos (product defect, full item, and courier parcel label) is required.
            </li>
            <li>
              Ensure the customer keeps the original packaging and accessories intact for courier pickup.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShippingTimelinePolicy;
