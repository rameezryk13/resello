import { CheckCircle2, Clock3, PlusCircle } from "lucide-react";

const ContactTabsNav = ({
  activeTab,
  setActiveTab,
  activeIssuesCount,
  resolvedIssuesCount,
}) => {
  return (
    <div className="contact-tabs-container">
      <div className="contact-tabs">
        <button
          className={`contact-tab ${activeTab === "new" ? "active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          <PlusCircle size={18} />
          <span>New Request</span>
        </button>

        <button
          className={`contact-tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <Clock3 size={18} />
          <span>Active Issues</span>
          <span className="tab-badge badge-active">{activeIssuesCount}</span>
        </button>

        <button
          className={`contact-tab ${activeTab === "resolved" ? "active" : ""}`}
          onClick={() => setActiveTab("resolved")}
        >
          <CheckCircle2 size={18} />
          <span>Resolved Issues</span>
          <span className="tab-badge badge-resolved">{resolvedIssuesCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ContactTabsNav;
