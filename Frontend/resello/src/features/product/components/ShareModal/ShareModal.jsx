import { useEffect, useRef, useState } from "react";
import { Copy, Facebook, MessageCircle, Share2, X, Check, Download, Images, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import "./ShareModal.css";

const PRESET_OPTIONS = [
  { label: "+20%", pct: 20 },
  { label: "+30%", pct: 30 },
  { label: "+50%", pct: 50 },
  { label: "+80%", pct: 80 },
  { label: "Custom", pct: null },
];

const fetchImageViaCanvas = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

const ShareModal = ({ open, onClose, product, initialProfit }) => {
  const { user } = useAuth();
  const modalBodyRef = useRef(null);

  const basePrice = Number(product?.price) || 0;
  const productImages =
    product?.images?.length > 0
      ? product.images
      : product?.img
        ? [product.img]
        : [];

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Preset & selling price calculation
  const [selectedPreset, setSelectedPreset] = useState("+30%");
  const [sellingPrice, setSellingPrice] = useState(() => {
    if (initialProfit && Number(initialProfit) > 0) {
      return basePrice + Number(initialProfit);
    }
    return Math.round(basePrice * 1.3);
  });

  // Toggles & Inputs for ON IMAGE & CAPTION details
  const [showShopName, setShowShopName] = useState(true);
  const [shopName, setShopName] = useState(user?.shopName || "Ali Sports");

  const [showYourName, setShowYourName] = useState(true);
  const [yourName, setYourName] = useState(user?.name || "FlashCart");

  const [showPhone, setShowPhone] = useState(true);
  const [phone, setPhone] = useState(user?.phone || "+923005575390");

  const [showCod, setShowCod] = useState(true);
  const [showFreeDelivery, setShowFreeDelivery] = useState(false);

  // Toggles for Caption Text Content
  const [showDescription, setShowDescription] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  // Caption & Sharing state
  const [caption, setCaption] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Update default shopName / yourName / phone when user profile updates
  useEffect(() => {
    if (user?.shopName) setShopName(user.shopName);
    if (user?.name) setYourName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Reset image index & recalculate selling price on open
  useEffect(() => {
    if (!open) return;
    setSelectedImgIdx(0);
    if (initialProfit && Number(initialProfit) > 0) {
      setSellingPrice(basePrice + Number(initialProfit));
      setSelectedPreset("Custom");
    } else {
      setSellingPrice(Math.round(basePrice * 1.3));
      setSelectedPreset("+30%");
    }
  }, [open, basePrice, initialProfit]);

  // Sync caption when options/price/description/details change
  useEffect(() => {
    if (!product) return;
    const lines = [
      `🛍️ ${product.name || "Product"}`,
      `💰 Only PKR ${Number(sellingPrice || 0).toLocaleString()}`,
      "",
    ];

    // Include Product Description in text caption
    if (showDescription && product.description) {
      lines.push("📝 Description:");
      lines.push(product.description);
      lines.push("");
    }

    // Include Product Details & Specs in text caption
    if (showDetails) {
      const detailLines = [];
      if (product.category) detailLines.push(`• Category: ${product.category}`);
      if (product.subCategory) detailLines.push(`• Subcategory: ${product.subCategory}`);

      const displayProductCode = product.productId
        ? product.productId.replace(/^MZ/i, "RS")
        : "";
      if (displayProductCode) detailLines.push(`• Product Code: ${displayProductCode}`);

      if (product.sizes?.length) {
        const sizesStr = Array.isArray(product.sizes)
          ? product.sizes.join(", ")
          : product.sizes;
        detailLines.push(`• Available Sizes: ${sizesStr}`);
      }

      if (product.colors?.length) {
        const colorsStr = Array.isArray(product.colors)
          ? product.colors.map((c) => (typeof c === "object" ? c.name || c.label : c)).join(", ")
          : product.colors;
        detailLines.push(`• Colors: ${colorsStr}`);
      }

      if (detailLines.length > 0) {
        lines.push("📌 Product Details:");
        lines.push(...detailLines);
        lines.push("");
      }
    }

    // Include Delivery Info
    if (showCod || showFreeDelivery) {
      const deliveryBadges = [];
      if (showCod) deliveryBadges.push("✓ Cash on Delivery");
      if (showFreeDelivery) deliveryBadges.push("✓ Free Delivery");
      lines.push(`🚚 ${deliveryBadges.join(" | ")}`);
      lines.push("");
    }

    // Include Contact & Call to Action
    if (showPhone && phone) {
      lines.push(`📞 WhatsApp ${phone} — DM to order now!`);
    } else {
      lines.push("📲 DM to order now!");
    }

    setCaption(lines.join("\n"));
  }, [
    product,
    sellingPrice,
    showCod,
    showFreeDelivery,
    showPhone,
    phone,
    showDescription,
    showDetails,
  ]);

  // Handle ESC key listener
  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !product) return null;

  const earnings = Math.max(0, Number(sellingPrice || 0) - basePrice);
  const currentProductImg = productImages[selectedImgIdx] || product.img || "";

  const handleSelectPreset = (option) => {
    setSelectedPreset(option.label);
    if (option.pct !== null) {
      const calculated = Math.round(basePrice * (1 + option.pct / 100));
      setSellingPrice(calculated);
    }
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    setSellingPrice(val === "" ? "" : Number(val));
    setSelectedPreset("Custom");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg("");
    }, 3200);
  };

  // Generate HTML5 Canvas Composite Image Card of the Selected Product Image + Badge + Overlays
  const generateCanvasBlob = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 640;
      const height = 820;
      canvas.width = width;
      canvas.height = height;

      // Outer White Canvas Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Card Inner Box Background
      ctx.fillStyle = "#fff7ed"; // Light warm orange background
      ctx.fillRect(16, 16, width - 32, height - 32);

      const img = new Image();
      img.crossOrigin = "anonymous";

      const renderCanvasContent = () => {
        // Draw Main Product Image
        const imgSize = 440;
        const imgX = (width - imgSize) / 2;
        const imgY = 32;

        // White frame behind image
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(imgX - 8, imgY - 8, imgSize + 16, imgSize + 16, 12);
        ctx.fill();

        try {
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        } catch {
          // fallback if drawImage fails
        }

        // Draw Tilted Orange Badge Ribbon "ONLY PKR XXX"
        ctx.save();
        ctx.translate(width - 100, 85);
        ctx.rotate((-12 * Math.PI) / 180);

        // Ribbon box with gradient fill
        const gradient = ctx.createLinearGradient(-85, -28, 85, 28);
        gradient.addColorStop(0, "#ff6b00");
        gradient.addColorStop(1, "#ea580c");
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.roundRect(-90, -28, 180, 56, 10);
        ctx.fill();

        // Ribbon dashed border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();

        // Ribbon text
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("ONLY", 0, -8);
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`PKR ${Number(sellingPrice || 0).toLocaleString()}`, 0, 14);
        ctx.restore();

        // Details Section Below Image
        let currentY = 510;

        // Product Title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "left";
        const titleText =
          (product.name || "").length > 40
            ? (product.name || "").substring(0, 40) + "…"
            : product.name || "";
        ctx.fillText(titleText, 40, currentY);
        currentY += 34;

        // Reseller Shop / Name
        ctx.fillStyle = "#334155";
        ctx.font = "600 15px sans-serif";
        if (showShopName && shopName) {
          ctx.fillText(`👤  ${shopName}`, 40, currentY);
          currentY += 26;
        } else if (showYourName && yourName) {
          ctx.fillText(`👤  ${yourName}`, 40, currentY);
          currentY += 26;
        }

        // Phone Number
        if (showPhone && phone) {
          ctx.fillStyle = "#ea580c";
          ctx.font = "bold 17px sans-serif";
          ctx.fillText(`📞  ${phone}`, 40, currentY);
          currentY += 32;
        }

        // Cash on Delivery Pill Tag
        if (showCod) {
          ctx.fillStyle = "#ffedd5";
          ctx.beginPath();
          ctx.roundRect(40, currentY, 160, 28, 14);
          ctx.fill();
          ctx.fillStyle = "#c2410c";
          ctx.font = "bold 13px sans-serif";
          ctx.fillText("✓ Cash on Delivery", 52, currentY + 19);
          currentY += 42;
        }

        // Footer Order Prompt
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ORDER NOW", width / 2, currentY);
        currentY += 18;
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("WhatsApp the number above to order", width / 2, currentY);

        canvas.toBlob((blob) => resolve(blob), "image/png");
      };

      img.onload = renderCanvasContent;
      img.onerror = () => {
        // Fallback drawing if cross-origin image fails to load
        ctx.fillStyle = "#ea580c";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(product.name || "Product", 40, 100);
        renderCanvasContent();
      };

      if (currentProductImg) {
        img.src = currentProductImg;
      } else {
        renderCanvasContent();
      }
    });
  };

  // Helper to generate File objects for ALL product images + generated card image
  const generateAllImageFiles = async () => {
    const files = [];

    // 1. Add the composite price-tagged canvas card image
    try {
      const cardBlob = await generateCanvasBlob();
      if (cardBlob) {
        const safeTitle = (product.name || "product")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_");
        files.push(
          new File([cardBlob], `00_resello_card_${safeTitle}.png`, { type: "image/png" })
        );
      }
    } catch {
      // continue
    }

    // 2. Add ALL product gallery images as File objects
    for (let i = 0; i < productImages.length; i++) {
      const src = productImages[i];
      try {
        const res = await fetch(src, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const ext = (blob.type || "").includes("png") ? "png" : "jpg";
          files.push(
            new File([blob], `product_photo_${i + 1}.${ext}`, {
              type: blob.type || "image/jpeg",
            })
          );
        } else {
          throw new Error("Cors fetch failed");
        }
      } catch {
        // Fallback: draw image on offscreen canvas to get blob
        try {
          const imgBlob = await fetchImageViaCanvas(src);
          if (imgBlob) {
            files.push(
              new File([imgBlob], `product_photo_${i + 1}.png`, { type: "image/png" })
            );
          }
        } catch {
          // continue
        }
      }
    }

    return files;
  };

  // Helper to share ALL picture files via native Web Share API or download fallback
  const sharePictureAndCaption = async (targetApp = "native") => {
    setIsSharing(true);
    showToast("Preparing all pictures & product details for sharing...");

    try {
      const allFiles = await generateAllImageFiles();
      if (!allFiles.length) throw new Error("Could not prepare images");

      // Check if native Web Share API with File list payload is supported
      if (
        navigator.canShare &&
        navigator.canShare({ files: allFiles }) &&
        targetApp !== "clipboard"
      ) {
        await navigator.share({
          title: product.name,
          text: caption,
          files: allFiles,
        });
        showToast(`Shared all ${allFiles.length} pictures, description & details!`);
      } else {
        // Fallback for desktop / browsers where multi-file sharing is limited:
        // 1. Copy text caption (with description & details) to clipboard
        try {
          await navigator.clipboard.writeText(caption);
        } catch {
          // ignore
        }

        // 2. Download ALL image files sequentially so user has all pictures saved on device
        for (let i = 0; i < allFiles.length; i++) {
          const file = allFiles[i];
          const blobUrl = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
          await new Promise((r) => setTimeout(r, 200));
        }

        if (targetApp === "whatsapp") {
          const encodedText = encodeURIComponent(caption);
          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
          showToast(`Downloaded ${allFiles.length} pictures & copied full text! Opening WhatsApp...`);
        } else if (targetApp === "facebook") {
          const pageUrl = encodeURIComponent(window.location.href);
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, "_blank");
          showToast(`Downloaded ${allFiles.length} pictures & copied full text! Opening Facebook...`);
        } else {
          showToast(`Downloaded ${allFiles.length} pictures & copied full text!`);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        showToast("Sharing completed!");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const blob = await generateCanvasBlob();
      if (!blob) throw new Error("Could not generate image");

      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
        showToast("Picture card copied to clipboard!");
      } catch {
        // Fallback download if clipboard item is restricted
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resello_share_${product.productId || "product"}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Picture card downloaded!");
      }
    } catch {
      showToast("Could not copy picture");
    }
  };

  return (
    <div className="pitch-studio-modal-backdrop" onClick={onClose}>
      <div
        className="pitch-studio-modal-card orange-theme animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pitch-studio-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="pitch-studio-head">
          <div className="pitch-studio-title-block">
            <span className="pitch-studio-tag">PITCH STUDIO</span>
            <h2 id="pitch-studio-title">{product.name}</h2>
          </div>
          <button
            type="button"
            className="pitch-studio-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="pitch-studio-body" ref={modalBodyRef}>
          {toastMsg && <div className="pitch-studio-toast">{toastMsg}</div>}

          <div className="pitch-studio-grid">
            {/* LEFT COLUMN: LIVE PREVIEW & GALLERY SELECTOR */}
            <div className="pitch-studio-preview-col">
              <span className="pitch-studio-section-label">LIVE PREVIEW</span>

              <div className="pitch-studio-preview-card">
                {/* Product Image Container */}
                <div className="pitch-studio-img-wrap">
                  {currentProductImg ? (
                    <img
                      src={currentProductImg}
                      alt={product.name}
                      className="pitch-studio-preview-img"
                    />
                  ) : (
                    <div className="pitch-studio-no-img">No Image Available</div>
                  )}

                  {/* Tilted Orange Ribbon Badge */}
                  <div className="pitch-studio-ribbon-badge">
                    <span className="ribbon-only">ONLY</span>
                    <span className="ribbon-price">
                      PKR {Number(sellingPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Gallery Thumbnail Selector (if product has multiple images) */}
                {productImages.length > 1 && (
                  <div className="pitch-studio-gallery-picker">
                    <span className="gallery-picker-title">
                      Select Picture for Share Card ({productImages.length} Available):
                    </span>
                    <div className="gallery-thumb-strip">
                      {productImages.map((imgSrc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`gallery-thumb-btn ${
                            selectedImgIdx === idx ? "active" : ""
                          }`}
                          onClick={() => setSelectedImgIdx(idx)}
                          title={`Select picture ${idx + 1}`}
                        >
                          <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Content Below Image */}
                <div className="pitch-studio-card-details">
                  <h3 className="pitch-studio-card-title">{product.name}</h3>

                  {showShopName && shopName && (
                    <div className="pitch-studio-card-shop">
                      <span className="shop-icon">👤</span> {shopName}
                    </div>
                  )}

                  {showYourName && yourName && !showShopName && (
                    <div className="pitch-studio-card-shop">
                      <span className="shop-icon">👤</span> {yourName}
                    </div>
                  )}

                  {showPhone && phone && (
                    <div className="pitch-studio-card-phone">
                      <span className="phone-icon">📞</span>
                      <strong>{phone}</strong>
                    </div>
                  )}

                  {showCod && (
                    <div className="pitch-studio-cod-badge">
                      <span className="cod-check">✓</span> Cash on Delivery
                    </div>
                  )}

                  {showFreeDelivery && (
                    <div className="pitch-studio-cod-badge free-del">
                      <span className="cod-check">✓</span> Free Delivery
                    </div>
                  )}

                  <div className="pitch-studio-card-footer-prompt">
                    <small>ORDER NOW</small>
                    <p>WhatsApp the number above to order</p>
                  </div>
                </div>
              </div>

              <p className="pitch-studio-disclaimer">
                This image is what your customer receives. Resello price + URL are{" "}
                <strong>not</strong> on it.
              </p>
            </div>

            {/* RIGHT COLUMN: OPTIONS & CONTROLS */}
            <div className="pitch-studio-controls-col">
              {/* YOUR SELLING PRICE */}
              <div className="pitch-studio-field-group">
                <label className="pitch-studio-section-label">YOUR SELLING PRICE</label>
                <div className="pitch-studio-price-input-box">
                  <span className="price-currency-prefix">PKR</span>
                  <input
                    type="number"
                    min="0"
                    className="pitch-studio-price-input"
                    value={sellingPrice}
                    onChange={handlePriceChange}
                    placeholder="1000"
                  />
                </div>

                {/* PRESET PERCENTAGE BUTTONS */}
                <div className="pitch-studio-preset-row">
                  {PRESET_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={`pitch-studio-preset-btn ${
                        selectedPreset === option.label ? "active" : ""
                      }`}
                      onClick={() => handleSelectPreset(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="pitch-studio-cost-breakdown">
                  Resello cost <strong>PKR {basePrice.toLocaleString()}</strong> · You earn{" "}
                  <span className="earn-highlight">PKR {earnings.toLocaleString()}</span>
                </div>
              </div>

              {/* ON IMAGE DETAILS */}
              <div className="pitch-studio-field-group">
                <label className="pitch-studio-section-label">ON IMAGE & CAPTION DETAILS</label>
                <div className="pitch-studio-toggles-list">
                  {/* Shop name toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Shop name</strong>
                      {showShopName && (
                        <input
                          type="text"
                          className="pitch-studio-inline-input"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Ali Sports"
                        />
                      )}
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showShopName}
                        onChange={(e) => setShowShopName(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Your name toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Your name</strong>
                      {showYourName && (
                        <input
                          type="text"
                          className="pitch-studio-inline-input"
                          value={yourName}
                          onChange={(e) => setYourName(e.target.value)}
                          placeholder="e.g. FlashCart"
                        />
                      )}
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showYourName}
                        onChange={(e) => setShowYourName(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Phone number toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Phone number</strong>
                      {showPhone && (
                        <input
                          type="text"
                          className="pitch-studio-inline-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+923005575390"
                        />
                      )}
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Description in caption toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Product Description in Caption</strong>
                      <small>Include full text description</small>
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showDescription}
                        onChange={(e) => setShowDescription(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Product Details & Specs in caption toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Product Details & Specs in Caption</strong>
                      <small>Include category, code, sizes & colors</small>
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showDetails}
                        onChange={(e) => setShowDetails(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Cash on Delivery toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Cash on Delivery</strong>
                      <small>Pakistan-friendly selling phrase</small>
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showCod}
                        onChange={(e) => setShowCod(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>

                  {/* Free Delivery toggle */}
                  <div className="pitch-studio-toggle-row">
                    <div className="toggle-label-block">
                      <strong>Free Delivery</strong>
                      <small>Use if you absorb the delivery fee</small>
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={showFreeDelivery}
                        onChange={(e) => setShowFreeDelivery(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* CAPTION (SENT WITH IMAGE & DETAILS) */}
              <div className="pitch-studio-field-group">
                <label className="pitch-studio-section-label">
                  CAPTION (SENT WITH IMAGE, DESCRIPTION & DETAILS)
                </label>
                <textarea
                  className="pitch-studio-caption-textarea"
                  rows={6}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              {/* SHARE ACTION */}
              <div className="pitch-studio-field-group">
                <button
                  type="button"
                  className="pitch-studio-share-btn btn-share-primary"
                  disabled={isSharing}
                  onClick={() => sharePictureAndCaption("native")}
                >
                  <Share2 size={20} />
                  <span>{isSharing ? "Sharing..." : "Share"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
