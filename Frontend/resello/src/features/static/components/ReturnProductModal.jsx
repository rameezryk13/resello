import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
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
  const [uploadMode, setUploadMode] = useState("paste"); // "paste" | "file"
  const [pastedUrl, setPastedUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [submitting, setSubmitting] = useState(false);

  // Initialize selected product when order changes
  useEffect(() => {
    if (order?.cart?.length) {
      setSelectedProductId(order.cart[0]?.product?.productId || "");
    }
    setReason(RETURN_REASONS[0].label);
    setDescription("");
    setPastedUrl("");
    setMediaPreview(null);
    setMediaType("image");
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      toast.error("Please upload a valid image (PNG, JPG, WEBP) or video (MP4, WEBM).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB.");
      return;
    }

    const determinedType = isVideo ? "video" : "image";
    setMediaType(determinedType);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePastedUrlChange = (url) => {
    setPastedUrl(url);
    const trimmed = url.trim();
    if (!trimmed) {
      setMediaPreview(null);
      return;
    }

    const isVideoLink =
      trimmed.includes("youtube.com") ||
      trimmed.includes("youtu.be") ||
      trimmed.includes("vimeo.com") ||
      trimmed.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);

    setMediaType(isVideoLink ? "video" : "image");
    setMediaPreview(trimmed);
  };

  const handleClipboardPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i += 1) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setMediaPreview(event.target.result);
          setMediaType("image");
          setUploadMode("file");
          toast.success("Image pasted from clipboard!");
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setPastedUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeProof = mediaPreview || pastedUrl.trim();
    if (!activeProof) {
      toast.error("Please paste or upload a video/picture proof of the defective product.");
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
        mediaUrl: activeProof,
        mediaType,
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
    if (url.includes("youtube.com/watch?v=")) {
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
    if (url.includes("youtu.be/")) {
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
      <video
        src={url}
        controls
        className="return-media-video-player"
      >
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

          {/* Picture / Video Proof Attachment Section */}
          <div className="return-form-group">
            <div className="return-proof-header">
              <label className="return-form-label">
                Defective Product Picture / Video Proof <span className="text-required">*</span>
              </label>
              <div className="return-mode-toggle">
                <button
                  type="button"
                  className={`return-mode-btn ${uploadMode === "paste" ? "active" : ""}`}
                  onClick={() => setUploadMode("paste")}
                >
                  <LinkIcon size={14} /> Paste Link
                </button>
                <button
                  type="button"
                  className={`return-mode-btn ${uploadMode === "file" ? "active" : ""}`}
                  onClick={() => setUploadMode("file")}
                >
                  <Upload size={14} /> Upload File
                </button>
              </div>
            </div>

            {uploadMode === "paste" ? (
              <div className="return-url-input-wrap">
                <input
                  type="url"
                  value={pastedUrl}
                  onChange={(e) => handlePastedUrlChange(e.target.value)}
                  placeholder="Paste picture or video URL (e.g. https://... or YouTube video link)"
                  className="return-url-input"
                />
                <span className="return-paste-tip">
                  💡 Tip: You can also paste image from clipboard (Ctrl+V) directly.
                </span>
              </div>
            ) : (
              <label className="return-file-dropzone">
                <Camera size={26} className="text-primary" />
                <span>Click to browse photo or video file</span>
                <small>PNG, JPG, WEBP, MP4 or WEBM (Max 25MB)</small>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="return-file-input"
                />
              </label>
            )}

            {/* Media Preview Box */}
            {mediaPreview && (
              <div className="return-media-preview-container">
                <div className="return-preview-header">
                  <span className="return-preview-tag">
                    {mediaType === "video" ? (
                      <>
                        <Video size={14} /> Video Proof Attached
                      </>
                    ) : (
                      <>
                        <ImageIcon size={14} /> Photo Proof Attached
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    className="return-media-remove-btn"
                    onClick={clearMedia}
                    title="Remove attached proof"
                  >
                    <Trash2 size={15} /> Remove Proof
                  </button>
                </div>

                <div className="return-preview-media-box">
                  {mediaType === "video" ? (
                    renderVideoEmbed(mediaPreview)
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Defective product proof"
                      className="return-media-img"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 7-Day Guarantee Assurance */}
          <div className="return-assurance-box">
            <CheckCircle2 size={18} className="text-success" />
            <p>
              <strong>7-Day Replacement Guarantee:</strong> Our inspection team will verify the
              provided defective proof and arrange a free courier pickup.
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
