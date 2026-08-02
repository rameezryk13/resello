import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header.jsx";
import ProductBreadcrumb from "./components/ProductBreadcrumb/ProductBreadcrumb";
import ProductGallery from "./components/ProductGallery/ProductGallery";
import ProductSummary from "./components/ProductSummary/ProductSummary";
import VariantSelector from "./components/VariantSelector/VariantSelector";
import QuantitySelector from "./components/QuantitySelector/QuantitySelector";
import ProfitInputRow from "./components/ProfitInputRow/ProfitInputRow";
import ProductActions from "./components/ProductActions/ProductActions";
import ProductUtilityRow from "./components/ProductUtilityRow/ProductUtilityRow";
import ShopCard from "./components/ShopCard/ShopCard";
import ReturnPolicy from "./components/ReturnPolicy/ReturnPolicy";
import ProductDetailsSection from "./components/ProductDetailsSection/ProductDetailsSection";
import RelatedProductRows from "./components/RelatedProductRows/RelatedProductRows";
import ReviewSection from "./components/ReviewSection/ReviewSection";
import StickyBuyBar from "./components/StickyBuyBar/StickyBuyBar";
import useProductData from "./hooks/useProductData";
import useProductVariants from "./hooks/useProductVariants";
import useProductActions from "./hooks/useProductActions";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { product, shop, loading, error, reviewData, relatedCat, relatedSub } =
    useProductData(id);

  const [mainIdx, setMainIdx] = useState(0);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [returnPolicyExpanded, setReturnPolicyExpanded] = useState(false);
  const [productDetailsExpanded, setProductDetailsExpanded] = useState(false);
  const [reviewsSectionShown, setReviewsSectionShown] = useState(false);
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);
  const [viewKey, setViewKey] = useState(null);
  const primaryActionsRef = useRef(null);

  // Every expand/reveal control starts closed again on a different product.
  if (product && product !== viewKey) {
    setViewKey(product);
    setMainIdx(0);
    setReviewsExpanded(false);
    setReturnPolicyExpanded(false);
    setProductDetailsExpanded(false);
    setReviewsSectionShown(false);
  }

  const images =
    product?.images?.length > 0
      ? product.images
      : product?.img
        ? [product.img]
        : [];

  const variants = useProductVariants(product);
  const actions = useProductActions({
    product,
    images,
    quantity: variants.quantity,
    selectedSize: variants.selectedSize,
    selectedColor: variants.selectedColor,
    profitValue: variants.profitValue,
    hasVariantStock: variants.hasVariantStock,
    currentVariantStock: variants.currentVariantStock,
  });

  // Show the floating desktop buy bar once the person scrolls past the
  // in-page Add to Cart / Buy Now buttons, hide it again once those
  // buttons are back in view (e.g. scrolling back up).
  useEffect(() => {
    const target = primaryActionsRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBuyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [product]);

  if (loading) {
    return (
      <div className="pdp-page">
        <Header />
        <div className="container pdp-loading">Loading product…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-page">
        <Header />
        <div className="container pdp-error">
          <p>{error || "Product not found"}</p>
          <button type="button" className="btn-primary" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = variants.hasVariantStock && variants.currentVariantStock <= 0;
  const favoriteCount = product.favoriteCount ?? product.likes ?? 30;
  const displayProductCode = product.productId
    ? product.productId.replace(/^MZ/i, "RS")
    : "";
  const reviewSummary = reviewData.summary || {
    averageRating: product.rating || 0,
    totalRatings: product.reviews || 0,
    mentions: [],
    distribution: [],
  };
  const visibleReviews = reviewsExpanded
    ? reviewData.reviews
    : reviewData.reviews.slice(0, 2);

  return (
    <div className="pdp-page animate-fade-in">
      <Header />
      <div className="container">
        <ProductBreadcrumb category={product.category} name={product.name} />

        <div className="pdp-main-grid">
          <ProductGallery
            images={images}
            name={product.name}
            mainIdx={mainIdx}
            onSelectImage={setMainIdx}
          />

          <div className="pdp-info">
            <ProductSummary product={product} displayProductCode={displayProductCode} />

            <VariantSelector
              sizes={product.sizes}
              colors={variants.currentColors}
              selectedSize={variants.selectedSize}
              selectedColor={variants.selectedColor}
              selectedColorLabel={variants.selectedColorLabel}
              hasVariantStock={variants.hasVariantStock}
              currentVariantStock={variants.currentVariantStock}
              normalizeColorValue={variants.normalizeColorValue}
              onSelectSize={variants.selectSize}
              onSelectColor={variants.selectColor}
            />

            <QuantitySelector
              quantity={variants.quantity}
              hasVariantStock={variants.hasVariantStock}
              currentVariantStock={variants.currentVariantStock}
              onChangeQuantity={variants.updateQuantity}
            />

            <ProfitInputRow
              profitValue={variants.profitValue}
              onChangeProfit={variants.setProfitValue}
              isFav={actions.isFav}
              favLoading={actions.favLoading}
              downloadLoading={actions.downloadLoading}
              onShare={actions.copyProductLink}
              onToggleFavorite={actions.toggleFavorite}
              onDownload={actions.downloadAllMedia}
            />

            <ProductActions
              containerRef={primaryActionsRef}
              addingToCart={actions.addingToCart}
              isOutOfStock={isOutOfStock}
              cartMessage={actions.cartMessage}
              actionError={actions.actionError}
              onAddToCart={actions.addToCart}
              onBuyNow={actions.handleBuyNow}
            >
              <ProductUtilityRow
                isFav={actions.isFav}
                favLoading={actions.favLoading}
                favoriteCount={favoriteCount}
                favoriteMessage={actions.favoriteMessage}
                downloadLoading={actions.downloadLoading}
                onShare={actions.copyProductLink}
                onToggleFavorite={actions.toggleFavorite}
                onDownload={actions.downloadAllMedia}
              />
            </ProductActions>

            {actions.actionError ? (
              <div className="pdp-action-error">{actions.actionError}</div>
            ) : null}

            <ShopCard shop={shop} fallbackShopName={product.shopName} />
          </div>
        </div>

        <ReturnPolicy
          variant="desktop"
          expanded={returnPolicyExpanded}
          onToggle={() => setReturnPolicyExpanded((current) => !current)}
        />
        <ReturnPolicy
          variant="mobile"
          expanded={returnPolicyExpanded}
          onToggle={() => setReturnPolicyExpanded((current) => !current)}
        />

        <ProductDetailsSection
          description={product.description}
          expanded={productDetailsExpanded}
          onToggle={() => setProductDetailsExpanded((current) => !current)}
        />

        <RelatedProductRows
          category={product.category}
          subCategory={product.subCategory}
          relatedCat={relatedCat}
          relatedSub={relatedSub}
        />

        <ReviewSection
          reviewData={reviewData}
          reviewSummary={reviewSummary}
          visibleReviews={visibleReviews}
          sectionShown={reviewsSectionShown}
          onToggleSection={() => setReviewsSectionShown((current) => !current)}
          reviewsExpanded={reviewsExpanded}
          onToggleReviews={() => setReviewsExpanded((current) => !current)}
        />
      </div>

      <StickyBuyBar
        visible={showStickyBuyBar}
        image={images[mainIdx]}
        name={product.name}
        price={product.price}
        addingToCart={actions.addingToCart}
        isOutOfStock={isOutOfStock}
        onAddToCart={actions.addToCart}
        onBuyNow={actions.handleBuyNow}
      />
    </div>
  );
};

export default ProductDetailPage;
