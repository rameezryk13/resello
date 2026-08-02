import "./ProductGallery.css";

const ProductGallery = ({ images = [], name, mainIdx, onSelectImage }) => (
  <div className="pdp-gallery">
    <div className="pdp-main-image">
      <img src={images[mainIdx]} alt={name} />
    </div>
    <div className="pdp-thumbs" role="tablist" aria-label="Product images">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === mainIdx}
          className={`pdp-thumb ${i === mainIdx ? "active" : ""}`}
          onClick={() => onSelectImage(i)}
        >
          <img src={src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  </div>
);

export default ProductGallery;
