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
  title,
  setTitle,
  selectedIssueType,
  setSelectedIssueType,
  customIssueType,
  setCustomIssueType,
  isDropdownOpen,
  setIsDropdownOpen,
  issueOptions,
  description,
  setDescription,
  attachments,
  handleFileSelect,
  removeAttachment,
  isDragActive,
  setIsDragActive,
  submitting,
}) => {
  const isTitleValid = title.trim().length >= 5 && title.trim().length <= 20;
  const isDescriptionValid = description.trim().length >= 20 && description.trim().length <= 1000;
  const areAttachmentsValid = attachments.length >= 1 && attachments.length <= 3;
  const isFormValid = isTitleValid && isDescriptionValid && areAttachmentsValid;

  return (
    <div className="static-card" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
        <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
          Submit a Support Request
        </h3>
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Provide a concise title, select your issue type, describe your concern (20–1,000 chars), and attach 1 to 3 pictures.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* INPUT 1: TITLE (MIN 5, MAX 20 CHARACTERS INCLUDE SPACE) */}
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
              Request Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <span
              className={`word-count-badge ${isTitleValid ? "valid" : "invalid"}`}
              style={{ fontSize: 12 }}
            >
              {title.length} / 20 chars (min 5)
            </span>
          </div>
          <input
            type="text"
            required
            maxLength={20}
            placeholder="e.g. Broken watch screen (5-20 chars)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              height: 44,
              padding: "0 14px",
              borderRadius: 10,
              border: `1.5px solid ${title && !isTitleValid ? "#fca5a5" : "#cbd5e1"}`,
              fontSize: 14,
              outline: "none",
            }}
          />
          {title && !isTitleValid && (
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
              <AlertCircle size={14} /> Title must be between 5 and 20 characters (including spaces).
            </p>
          )}
        </div>

        {/* INPUT 2: ISSUE TYPE (DROPDOWN) */}
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

        {/* INPUT 3: DESCRIPTION (MINIMUM 20, MAX 1000 CHARACTERS) */}
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
            <span className={`word-count-badge ${isDescriptionValid ? "valid" : "invalid"}`} style={{ fontSize: 12 }}>
              {description.length} / 1,000 chars (min 20)
            </span>
          </div>
          <textarea
            required
            rows={5}
            maxLength={1000}
            placeholder="Describe your issue clearly in detail (minimum 20 characters, up to 1,000 characters)..."
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
              <AlertCircle size={14} /> Description must be between 20 and 1,000 characters.
            </p>
          )}
        </div>

        {/* INPUT 4: PICTURES (1 MUST, 3 MAX) */}
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
              Pictures <span style={{ color: "#ef4444" }}>* (1 required, max 3)</span>
            </label>
            <span
              className={`word-count-badge ${areAttachmentsValid ? "valid" : "invalid"}`}
              style={{ fontSize: 12 }}
            >
              {attachments.length} / 3 pictures (min 1)
            </span>
          </div>

          {attachments.length < 3 && (
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
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.length && handleFileSelect(e.target.files)}
              />
              <div style={{ display: "flex", gap: 10, color: "var(--color-primary, #ff8c00)" }}>
                <ImageIcon size={22} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Click to browse or drop picture(s) here
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                1 picture required, up to 3 pictures max (JPG, PNG, WebP)
              </div>
            </div>
          )}

          {attachments.length === 0 && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertCircle size={14} /> Please attach at least 1 picture for proof/reference.
            </p>
          )}

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="attachment-preview-grid" style={{ marginTop: 12 }}>
              {attachments.map((item) => (
                <div key={item.id} className="attachment-preview-card">
                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={() => removeAttachment(item.id)}
                    title="Remove picture"
                  >
                    <X size={12} />
                  </button>
                  {item.url && (
                    <img src={item.url} alt={item.name} className="attachment-thumbnail" />
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
          disabled={submitting || !isFormValid}
          style={{ height: 48, fontSize: 15, fontWeight: 700, marginTop: 8 }}
        >
          <Send size={18} /> {submitting ? "Submitting Request..." : "Submit Support Request"}
        </button>
      </form>
    </div>
  );
};

export default ContactNewRequestForm;
