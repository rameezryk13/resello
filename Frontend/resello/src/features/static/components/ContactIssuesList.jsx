import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Image as ImageIcon,
  MessageSquare,
  PlusCircle,
  Send,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import SupportChatBox from "./SupportChatBox";

const ContactIssuesList = ({
  type, // "active" | "resolved"
  issues = [],
  expandedIssueId,
  setExpandedIssueId,
  onSwitchToNew,
  replyInput,
  setReplyInput,
  adminAttachmentsInput,
  demoAdminProofs = [],
  addPresetAdminProof,
  handleAdminFileUpload,
  removeAdminAttachment,
  handleAdminReplySubmit,
}) => {
  const isResolved = type === "resolved";

  if (issues.length === 0) {
    return (
      <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
        <div className="empty-issues-state">
          {isResolved ? (
            <CheckCircle2 size={48} style={{ color: "#94a3b8" }} />
          ) : (
            <Clock3 size={48} style={{ color: "#94a3b8" }} />
          )}
          <h4 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {isResolved ? "No Resolved Issues Yet" : "No Active Issues"}
          </h4>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 420 }}>
            {isResolved
              ? "Once support admins resolve your active requests, they will appear here along with their final official response and shared pictures."
              : "You currently have no open support tickets. If you need help with an order or payment, create a new request."}
          </p>
          {!isResolved && (
            <button className="btn-primary" onClick={onSwitchToNew} style={{ marginTop: 8 }}>
              <PlusCircle size={16} /> Create New Request
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <div className="issues-list">
        {issues.map((issue) => {
          const isExpanded = expandedIssueId === issue.id;
          const currentAdminAttachments = adminAttachmentsInput?.[issue.id] || [];

          return (
            <div key={issue.id} className="issue-card">
              <div
                className="issue-card-header"
                onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    className="issue-type-badge"
                    style={isResolved ? { background: "#f0fdf4", color: "#166534" } : undefined}
                  >
                    {isResolved ? <CheckCircle2 size={14} /> : <MessageSquare size={14} />} {issue.issueType}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    #{issue.id}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {isResolved ? (
                    <span className="status-pill resolved">
                      <CheckCircle2 size={13} /> Solved
                    </span>
                  ) : (
                    <span className="status-pill active">
                      <Clock3 size={13} /> Active / Under Review
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {isResolved
                      ? `Resolved on ${new Date(issue.resolvedAt || issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : new Date(issue.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#64748b" />
                  ) : (
                    <ChevronDown size={18} color="#64748b" />
                  )}
                </div>
              </div>

              {/* Expandable Chat Box Body */}
              {isExpanded && (
                <div className="issue-card-body">
                  <SupportChatBox issue={issue} />

                  {/* DEMO ADMIN REPLY SIMULATOR WITH PICTURE SHARING (Active only) */}
                  {!isResolved && !issue.adminReply && (
                    <div className="admin-reply-sim-container animate-fade-in">
                      <div className="admin-sim-title">
                        <strong>
                          <ShieldCheck size={16} className="text-primary" /> Admin Reply & Picture Sharing Simulator
                        </strong>
                        <span className="admin-sim-badge">Test Admin Tools</span>
                      </div>

                      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                        Simulate how the Resello Customer Support Team replies with resolution messages and shares official picture proofs (e.g., bank transfer voucher, parcel tracking slip, replacement confirmation).
                      </p>

                      {/* Admin Text Message Input */}
                      <textarea
                        rows={3}
                        placeholder="Type official admin response message here..."
                        value={replyInput?.[issue.id] || ""}
                        onChange={(e) =>
                          setReplyInput({ ...replyInput, [issue.id]: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 12,
                          borderRadius: 10,
                          border: "1.5px solid #cbd5e1",
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          outline: "none",
                          background: "#ffffff",
                        }}
                      />

                      {/* Quick Proof Presets & File Upload */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="admin-sim-quick-proofs">
                          <span className="quick-proof-label">Quick Share Proofs:</span>
                          {demoAdminProofs.map((proof, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="quick-proof-btn"
                              onClick={() => addPresetAdminProof(issue.id, proof)}
                            >
                              <ImageIcon size={13} /> {proof.label}
                            </button>
                          ))}
                          <label
                            className="quick-proof-btn"
                            style={{ cursor: "pointer", background: "#f1f5f9" }}
                          >
                            <Upload size={13} /> Upload Custom Photo/Proof
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                e.target.files?.length &&
                                handleAdminFileUpload(issue.id, e.target.files)
                              }
                            />
                          </label>
                        </div>

                        {/* Preview of Attached Admin Proofs */}
                        {currentAdminAttachments.length > 0 && (
                          <div className="admin-sim-preview-grid">
                            {currentAdminAttachments.map((item, idx) => (
                              <div key={idx} className="admin-sim-preview-thumb">
                                {item.isImage || item.url ? (
                                  <img src={item.url} alt={item.name} />
                                ) : (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      height: "100%",
                                      background: "#e2e8f0",
                                      fontSize: 10,
                                      textAlign: "center",
                                      padding: 4,
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className="admin-sim-remove-btn"
                                  onClick={() => removeAdminAttachment(issue.id, idx)}
                                  title="Remove attachment"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Send Button */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleAdminReplySubmit(issue.id)}
                          style={{
                            height: 40,
                            padding: "0 20px",
                            fontSize: 13.5,
                            fontWeight: 700,
                            gap: 8,
                          }}
                        >
                          <Send size={15} /> Send Admin Reply & Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactIssuesList;
