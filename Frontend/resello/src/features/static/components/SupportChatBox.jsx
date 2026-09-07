import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckCircle2,
  Maximize2,
  X,
  Download,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Paperclip,
  Check,
} from "lucide-react";

const formatChatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const SupportChatBox = ({ issue }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!issue) return null;

  const isResolved = issue.status === "resolved";
  const userAttachments = issue.attachments || [];
  const adminAttachments = issue.adminReply?.attachments || [];

  return (
    <div className="support-chatbox-container">
      {/* CHAT HEADER */}
      <div className="support-chatbox-header">
        <div className="chatbox-header-left">
          <div className="chatbox-header-title-row">
            <span className="chatbox-ticket-id">#{issue.id}</span>
            <span className="chatbox-topic-badge">
              <MessageSquare size={13} /> {issue.issueType || "General Support"}
            </span>
            {isResolved ? (
              <span className="chatbox-status-badge resolved">
                <CheckCircle2 size={13} /> Resolved & Closed
              </span>
            ) : (
              <span className="chatbox-status-badge active">
                <Clock size={13} /> In Progress / Awaiting Review
              </span>
            )}
          </div>
          <span className="chatbox-timestamp">
            Started: {formatChatDate(issue.createdAt)}
          </span>
        </div>
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="support-chatbox-messages">
        {/* ============================================================ */}
        {/* MESSAGE 1: USER'S CARD (LEFT SIDE) */}
        {/* ============================================================ */}
        <div className="chat-card user-card">
          <div className="chat-card-sender user-sender">
            {issue.senderName || issue.userName || "Hamza Deals"}
          </div>

          <p className="chat-card-text">{issue.description}</p>

          {/* User Attachments / Images */}
          {userAttachments.length > 0 && (
            <div className="chat-card-attachments">
              {userAttachments.map((file, idx) => (
                <div
                  key={idx}
                  className="chat-card-thumb-wrap"
                  onClick={() =>
                    setSelectedImage({
                      url: file.url || file.previewUrl,
                      name: file.name || "Customer Proof",
                      sender: issue.senderName || issue.userName || "Hamza Deals",
                    })
                  }
                  title="Click to zoom image"
                >
                  <img
                    src={file.url || file.previewUrl}
                    alt={file.name || "Proof"}
                    className="chat-card-thumb-img"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="chat-card-timestamp">
            {formatChatDate(issue.createdAt)}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MESSAGE 2: ADMIN REPLY CARD (RIGHT SIDE) */}
        {/* ============================================================ */}
        {issue.adminReply ? (
          <div className="chat-card admin-card animate-fade-in">
            <div className="chat-card-sender admin-sender">
              {issue.adminReply.adminName || "Admin"}
            </div>

            <p className="chat-card-text">{issue.adminReply.text}</p>

            {/* Admin Attachments */}
            {adminAttachments.length > 0 && (
              <div className="chat-card-attachments admin-attachments">
                {adminAttachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="chat-card-thumb-wrap admin-thumb"
                    onClick={() =>
                      setSelectedImage({
                        url: file.url || file.previewUrl,
                        name: file.name || "Admin Proof",
                        sender: issue.adminReply.adminName || "Admin",
                      })
                    }
                    title="Click to zoom image"
                  >
                    <img
                      src={file.url || file.previewUrl}
                      alt={file.name || "Admin Proof"}
                      className="chat-card-thumb-img admin-thumb-img"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="chat-card-timestamp">
              {formatChatDate(issue.adminReply.repliedAt || issue.resolvedAt || issue.createdAt)}
            </div>
          </div>
        ) : (
          <div className="chat-pending-banner">
            <div className="pending-pulse-dot" />
            <div className="pending-content">
              <strong>Support Ticket In Review</strong>
              <p>
                Our support team is actively investigating your request. Admin will share official details, confirmation
                proofs, and resolve your issue shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CHAT FOOTER STATUS */}
      {isResolved && (
        <div className="chatbox-resolution-footer">
          <div className="resolution-footer-icon">
            <Check size={18} />
          </div>
          <div className="resolution-footer-text">
            <strong>Case Resolution Complete</strong>
            <span>
              This inquiry has been verified and resolved by Resello Support on{" "}
              {new Date(issue.resolvedAt || issue.adminReply?.repliedAt || issue.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}
              .
            </span>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR FULL-SIZE IMAGE PREVIEWS */}
      {selectedImage && (
        <div className="support-lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="support-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-lightbox-header">
              <div className="support-lightbox-title">
                <ImageIcon size={18} />
                <span>{selectedImage.name}</span>
                <span className="lightbox-sender-pill">Shared by {selectedImage.sender}</span>
              </div>
              <button
                type="button"
                className="support-lightbox-close"
                onClick={() => setSelectedImage(null)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="support-lightbox-body">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="support-lightbox-img"
              />
            </div>
            <div className="support-lightbox-actions">
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noreferrer"
                className="support-lightbox-btn"
              >
                <ExternalLink size={15} /> Open Full Resolution
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatBox;
