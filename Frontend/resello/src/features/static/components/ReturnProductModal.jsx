import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileVideo,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { post } from "@/api/client";
import endpoints from "@/api/endpoints";
import { useToast } from "@/context/ToastContext";
import { formatRupees } from "@/utils/currency";
import "./ReturnProductModal.css";

const RETURN_REASONS = [
  { id: "defective", label: "Defective / Not Working Properly" },
  { id: "damaged", label: "Damaged / Broken in Transit" },
  { id: "wrong_item", label: "Wrong Item / Size / Color Delivered" },
  { id: "missing_parts", label: "Missing Parts or Accessories" },
  { id: "quality_mismatch", label: "Item Defect / Not as Described" },
  { id: "other", label: "Other Defect Issue" },
];

export const ReturnProductModal = ({ open, order, onClose, onSubmitSuccess }) => {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reason, setReason] = useState(RETURN_REASONS[0].label);
  const [description, setDescription] = useState("");

  // Video Proof State (MANDATORY - 1 Video)
  const [videoMode, setVideoMode] = useState("file"); // "file" | "paste"
  const [pastedVideoUrl, setPastedVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);

  // Picture Proof State (OPTIONAL - Minimum 3 Pictures if provided)
  const [photoMode, setPhotoMode] = useState("file"); // "file" | "paste"
  const [pastedPhotoUrl, setPastedPhotoUrl] = useState("");
  const [pictures, setPictures] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  // Initialize selected product and reset form when order changes
  useEffect(() => {
    if (order?.cart?.length) {
      setSelectedProductId(order.cart[0]?.product?.productId || "");
    }
    setReason(RETURN_REASONS[0].label);
    setDescription("");
    setPastedVideoUrl("");
    setVideoPreview(null);
    setVideoMode("file");
    setPastedPhotoUrl("");
    setPictures([]);
    setPhotoMode("file");
  }, [order]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !order) return null;

  const cartItems = Array.isArray(order.cart) ? order.cart : [];
  const activeItem =
    cartItems.find((item) => item?.product?.productId === selectedProductId) ||
    cartItems[0];
  const activeProduct = activeItem?.product;

  // --- Video Handlers ---
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      toast.error("Please upload a valid video file (MP4, WEBM, MOV).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be under 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
      toast.success("Video proof attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handlePastedVideoUrlChange = (url) => {
    setPastedVideoUrl(url);
    const trimmed = url.trim();
    if (!trimmed) {
      setVideoPreview(null);
      return;
    }
    setVideoPreview(trimmed);
  };

  const clearVideo = () => {
    setVideoPreview(null);
    setPastedVideoUrl("");
  };

  // --- Pictures Handlers ---
  const handlePhotoFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) {
      toast.error("Please upload valid image files (PNG, JPG, WEBP).");
      return;
    }

    let loadedCount = 0;
    const newPictures = [];

    validImageFiles.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`Image "${file.name}" exceeds 15MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPictures.push(reader.result);
        loadedCount += 1;
        if (loadedCount === validImageFiles.length) {
          setPictures((prev) => {
            const combined = [...prev, ...newPictures];
            if (combined.length > 10) {
              toast.error("You can attach up to 10 photos maximum.");
              return combined.slice(0, 10);
            }
            return combined;
          });
          toast.success(`${newPictures.length} photo(s) added.`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same files can be re-selected if needed
    e.target.value = "";
  };

  const handleAddPastedPhotoUrl = () => {
    const trimmed = pastedPhotoUrl.trim();
    if (!trimmed) return;
    if (pictures.length >= 10) {
      toast.error("You can attach up to 10 photos maximum.");
      return;
    }
    setPictures((prev) => [...prev, trimmed]);
    setPastedPhotoUrl("");
    toast.success("Photo URL added.");
  };

  const handleRemovePicture = (index) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllPictures = () => {
    setPictures([]);
    setPastedPhotoUrl("");
  };

  const handleClipboardPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i += 1) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          if (pictures.length >= 10) {
            toast.error("Maximum 10 photos reached.");
            return;
          }
          setPictures((prev) => [...prev, event.target.result]);
          toast.success("Photo pasted from clipboard!");
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory 1 Video validation
    if (!videoPreview) {
      toast.error("Please add 1 video proof of the defective product (Mandatory).");
      return;
    }

    // 2. Optional minimum 3 pictures validation
    if (pictures.length > 0 && pictures.length < 3) {
      toast.error(
        `If including pictures, a minimum of 3 pictures is required (currently ${pictures.length} attached). Please add at least 3 pictures or remove them.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        orderId: order.orderId,
        productId: activeProduct?.productId || selectedProductId,
        productName: activeProduct?.name || "Product",
        reason,
        description: description.trim(),
        videoUrl: videoPreview,
        mediaUrl: videoPreview,
        mediaType: "video",
        images: pictures,
      };

      const data = await post(endpoints.returnOrder(order.orderId), payload);
      toast.success(
        data.message || `Return request for order #${order.orderId} submitted successfully!`
      );
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to submit return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderVideoEmbed = (url) => {
    if (typeof url === "string" && url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Defective product video proof"
          className="return-media-video-embed"
          allowFullScreen
        />
      );
    }
    if (typeof url === "string" && url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Defective product video proof"
          className="return-media-video-embed"
          allowFullScreen
        />
      );
    }
    return (
      <video src={url} controls className="return-media-video-player">
        Your browser does not support playing this video directly.
      </video>
    );
  };

  return (
    <div className="return-modal-backdrop" onClick={onClose} onPaste={handleClipboardPaste}>
      <div
        className="return-modal-card animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="return-modal-header">
          <div className="return-modal-title-group">
            <div className="return-icon-badge">
              <AlertTriangle size={20} className="text-primary" />
            </div>
            <div>
              <h2 id="return-modal-title">Return Defective Product</h2>
              <p className="return-modal-sub">
                Order #{order.orderId} • Delivered within last 7 days
              </p>
            </div>
          </div>
          <button
            type="button"
            className="return-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="return-modal-body">
          {/* Order / Product Selection */}
          {cartItems.length > 1 ? (
            <div className="return-form-group">
              <label htmlFor="return-product-select" className="return-form-label">
                Select Defective Item from Order
              </label>
              <select
                id="return-product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="return-select-input"
              >
                {cartItems.map((item) => (
                  <option
                    key={item.itemId || item.product?.productId}
                    value={item.product?.productId}
                  >
                    {item.product?.name} ({item.quantity} pcs) - {formatRupees(item.product?.price)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Active Product Bar */}
          {activeProduct && (
            <div className="return-product-preview-bar">
              {activeProduct.images?.[0] ? (
                <img
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  className="return-product-thumb"
                />
              ) : (
                <div className="return-product-thumb-placeholder">
                  <Package size={22} />
                </div>
              )}
              <div className="return-product-info">
                <strong>{activeProduct.name}</strong>
                <div className="return-product-subtext">
                  <span>Price: {formatRupees(activeProduct.price)}</span>
                  {activeItem?.selectedSize && <span>Size: {activeItem.selectedSize}</span>}
                  {activeItem?.selectedColor && <span>Color: {activeItem.selectedColor}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Return Reason Selection */}
          <div className="return-form-group">
            <label htmlFor="return-reason-select" className="return-form-label">
              Reason for Return <span className="text-required">*</span>
            </label>
            <select
              id="return-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="return-select-input"
              required
            >
              {RETURN_REASONS.map((r) => (
                <option key={r.id} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Defect Description */}
          <div className="return-form-group">
            <label htmlFor="return-description" className="return-form-label">
              Defect Description &amp; Details <span className="text-required">*</span>
            </label>
            <textarea
              id="return-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the defect, malfunction, or damage observed upon opening the package..."
              className="return-textarea"
              required
            />
          </div>

          {/* SECTION 1: MANDATORY 1 VIDEO PROOF */}
          <div className="return-proof-section required-section">
            <div className="return-proof-header">
              <div className="return-section-label-group">
                <label className="return-form-label">
                  <Video size={16} className="text-primary" />
                  1 Video Proof <span className="text-required">* (Mandatory)</span>
                </label>
                <span className="return-hint-pill mandatory">Must add 1 video</span>
              </div>
              <div className="return-mode-toggle">
                <button
                  type="button"
                  className={`return-mode-btn ${videoMode === "file" ? "active" : ""}`}
                  onClick={() => setVideoMode("file")}
                >
                  <Upload size={13} /> Upload Video
                </button>
                <button
                  type="button"
                  className={`return-mode-btn ${videoMode === "paste" ? "active" : ""}`}
                  onClick={() => setVideoMode("paste")}
                >
                  <LinkIcon size={13} /> Paste Link
                </button>
              </div>
            </div>

            {!videoPreview ? (
              videoMode === "file" ? (
                <label className="return-file-dropzone video-dropzone">
                  <FileVideo size={30} className="text-primary" />
                  <span>Click to browse 1 video file showing the defect</span>
                  <small>MP4, WEBM, MOV (Max 50MB) • Mandatory unboxing or defect video</small>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="return-file-input"
                  />
                </label>
              ) : (
                <div className="return-url-input-wrap">
                  <input
                    type="url"
                    value={pastedVideoUrl}
                    onChange={(e) => handlePastedVideoUrlChange(e.target.value)}
                    placeholder="Paste video link (YouTube, Vimeo, or direct MP4/video URL)"
                    className="return-url-input"
                  />
                  <span className="return-paste-tip">
                    Attach a direct video URL showing the defect or unboxing of this item.
                  </span>
                </div>
              )
            ) : (
              <div className="return-media-preview-container">
                <div className="return-preview-header">
                  <span className="return-preview-tag success">
                    <CheckCircle2 size={14} /> 1 Video Proof Attached
                  </span>
                  <button
                    type="button"
                    className="return-media-remove-btn"
                    onClick={clearVideo}
                    title="Remove attached video"
                  >
                    <Trash2 size={14} /> Remove Video
                  </button>
                </div>
                <div className="return-preview-media-box">
                  {renderVideoEmbed(videoPreview)}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: OPTIONAL PICTURES (MINIMUM 3 REQUIRED IF PROVIDED) */}
          <div className="return-proof-section optional-section">
            <div className="return-proof-header">
              <div className="return-section-label-group">
                <label className="return-form-label">
                  <ImageIcon size={16} className="text-primary" />
                  Defect Pictures <span className="text-optional">(Optional)</span>
                </label>
                <span className="return-hint-pill optional">Option: Mini 3 Pictures</span>
              </div>
              <div className="return-mode-toggle">
                <button
                  type="button"
                  className={`return-mode-btn ${photoMode === "file" ? "active" : ""}`}
                  onClick={() => setPhotoMode("file")}
                >
                  <Upload size={13} /> Upload Photos
                </button>
                <button
                  type="button"
                  className={`return-mode-btn ${photoMode === "paste" ? "active" : ""}`}
                  onClick={() => setPhotoMode("paste")}
                >
                  <LinkIcon size={13} /> Paste URL
                </button>
              </div>
            </div>

            <div className="return-pictures-status-bar">
              {pictures.length === 0 ? (
                <span className="photo-status-tag neutral">
                  📷 0 photos attached (Optional — leave empty or add at least 3)
                </span>
              ) : pictures.length < 3 ? (
                <span className="photo-status-tag warning">
                  <AlertTriangle size={13} /> {pictures.length} / 3 min photos added (Add {3 - pictures.length} more, or clear photos)
                </span>
              ) : (
                <span className="photo-status-tag success">
                  <CheckCircle2 size={13} /> {pictures.length} photos attached (Requirement met)
                </span>
              )}

              {pictures.length > 0 && (
                <button
                  type="button"
                  className="photo-clear-all-btn"
                  onClick={clearAllPictures}
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {photoMode === "file" ? (
              <label className="return-file-dropzone photo-dropzone">
                <Camera size={26} className="text-primary" />
                <span>Click to select multiple photo files (or paste with Ctrl+V)</span>
                <small>PNG, JPG, WEBP • If providing photos, add at least 3 different angles/views</small>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoFileUpload}
                  className="return-file-input"
                />
              </label>
            ) : (
              <div className="return-url-input-wrap">
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="url"
                    value={pastedPhotoUrl}
                    onChange={(e) => setPastedPhotoUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="return-url-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPastedPhotoUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-outline return-add-photo-btn"
                    onClick={handleAddPastedPhotoUrl}
                    disabled={!pastedPhotoUrl.trim()}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
                <span className="return-paste-tip">
                  💡 Tip: You can also paste screenshots directly from your clipboard (Ctrl+V).
                </span>
              </div>
            )}

            {/* Gallery Thumbnails */}
            {pictures.length > 0 && (
              <div className="return-photos-gallery-grid">
                {pictures.map((picUrl, index) => (
                  <div key={index} className="return-photo-thumb-card">
                    <img
                      src={picUrl}
                      alt={`Defect photo proof ${index + 1}`}
                      className="return-photo-thumb-img"
                    />
                    <span className="return-photo-index-badge">#{index + 1}</span>
                    <button
                      type="button"
                      className="return-photo-remove-btn"
                      onClick={() => handleRemovePicture(index)}
                      title={`Remove photo #${index + 1}`}
                      aria-label={`Remove photo #${index + 1}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-Day Guarantee Assurance */}
          <div className="return-assurance-box">
            <CheckCircle2 size={18} className="text-success" />
            <p>
              <strong>7-Day Replacement Guarantee:</strong> Resellers must provide 1 video proof
              demonstrating the defect. Product pictures are optional, but if submitted, a minimum
              of 3 photos is required for warehouse verification.
            </p>
          </div>

          {/* Actions */}
          <div className="return-modal-actions">
            <button
              type="button"
              className="btn-outline return-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary return-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting Return..." : "Submit Return Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnProductModal;
