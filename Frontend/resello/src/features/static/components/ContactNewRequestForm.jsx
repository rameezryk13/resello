import {
  AlertCircle,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Video,
  X,
} from "lucide-react";

const ContactNewRequestForm = ({
  onSubmit,
  selectedIssueType,
  setSelectedIssueType,
  customIssueType,
  setCustomIssueType,
  isDropdownOpen,
  setIsDropdownOpen,
  issueOptions,
  description,
  setDescription,
  isDescriptionValid,
  wordCount,
  attachments,
  handleFileSelect,
  removeAttachment,
  isDragActive,
  setIsDragActive,
  submitting,
}) => {
  return (
    <div className="static-card" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
        <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
          Submit a Support Request
        </h3>
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Select your issue type, describe your concern in detail (minimum 5 words), and attach files/screenshots.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* INPUT 1: ISSUE TYPE (CUSTOM DROPDOWN MATCHING USER MOCKUP) */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>
            Issue Type <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div className="issue-dropdown-container">
            <div
              className={`dropdown-trigger-box ${isDropdownOpen ? "open" : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedIssueType || "Select issue type"}</span>
              <ChevronDown
                size={18}
                style={{
                  color: "#64748b",
                  transition: "transform 0.2s ease",
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu-card">
                {issueOptions.map((option) => {
                  const isActive = selectedIssueType === option;
                  return (
                    <div
                      key={option}
                      className={`dropdown-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setSelectedIssueType(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom text input when 'Other' is selected */}
          {selectedIssueType === "Other" && (
            <div className="other-issue-input-box">
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                Write Issue Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Specify your issue type (e.g. Account deactivation, Cashback query...)"
                value={customIssueType}
                onChange={(e) => setCustomIssueType(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>

        {/* INPUT 2: DESCRIPTION (MINIMUM 5 WORDS VALIDATION) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#475569",
              }}
            >
              Issue Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <span className={`word-count-badge ${isDescriptionValid ? "valid" : "invalid"}`}>
              {wordCount} / 5 words minimum
            </span>
          </div>
          <textarea
            required
            rows={5}
            placeholder="Describe your issue clearly (e.g. 'I placed an order for shoes yesterday but payment status shows pending in wallet...')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: `1.5px solid ${
                description && !isDescriptionValid ? "#fca5a5" : "#cbd5e1"
              }`,
              fontSize: 14,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
            }}
          />
          {description && !isDescriptionValid && (
            <p
              style={{
                fontSize: 12,
                color: "#dc2626",
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertCircle size={14} /> Please write at least 5 words to explain your issue clearly.
            </p>
          )}
        </div>

        {/* INPUT 3: ATTACHMENTS (PIC, VIDEOS, FILES) */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 8,
              color: "#475569",
            }}
          >
            Attachments (Pictures, Screenshots, Files)
          </label>
          <div
            className={`file-dropzone ${isDragActive ? "drag-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragActive(false);
              if (e.dataTransfer.files?.length) {
                handleFileSelect(e.dataTransfer.files);
              }
            }}
            onClick={() => document.getElementById("file-input-element")?.click()}
          >
            <input
              id="file-input-element"
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.length && handleFileSelect(e.target.files)}
            />
            <div style={{ display: "flex", gap: 10, color: "var(--color-primary, #ff8c00)" }}>
              <ImageIcon size={22} />
              <Video size={22} />
              <Paperclip size={22} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Click to browse or drop files here
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Supports PNG, JPG, MP4, PDF, and screenshots
            </div>
          </div>

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="attachment-preview-grid">
              {attachments.map((item) => (
                <div key={item.id} className="attachment-preview-card">
                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={() => removeAttachment(item.id)}
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                  {item.isImage && item.url ? (
                    <img src={item.url} alt={item.name} className="attachment-thumbnail" />
                  ) : item.isVideo ? (
                    <div
                      className="attachment-file-icon"
                      style={{ background: "#e0f2fe", color: "#0284c7" }}
                    >
                      <Video size={24} />
                    </div>
                  ) : (
                    <div className="attachment-file-icon">
                      <FileText size={24} />
                    </div>
                  )}
                  <span className="attachment-name">{item.name}</span>
                  <span className="attachment-size">{item.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || !isDescriptionValid}
          style={{ height: 48, fontSize: 15, fontWeight: 700, marginTop: 8 }}
        >
          <Send size={18} /> {submitting ? "Submitting Request..." : "Submit Support Request"}
        </button>
      </form>
    </div>
  );
};

export default ContactNewRequestForm;
