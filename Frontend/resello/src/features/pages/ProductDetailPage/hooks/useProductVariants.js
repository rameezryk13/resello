import { useState } from "react";

export const normalizeColorValue = (color) =>
  typeof color === "string" ? color : color.value;

// Owns the size / color / quantity / profit selection for a product, plus the
// stock figures derived from whichever variant is currently selected.
//
// Selections reset during render when the product changes (rather than in an
// effect) so the first paint of a new product never shows the previous
// product's size and colour.
const useProductVariants = (product) => {
  const [productKey, setProductKey] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [profitValue, setProfitValue] = useState("");

  if (product && product !== productKey) {
    const availableColors = product.sizes?.[0]?.colors || product.colors || [];

    setProductKey(product);
    setSelectedSize(product.sizes?.[0]?.size || "");
    setSelectedColor(
      availableColors.length > 0 ? normalizeColorValue(availableColors[0]) : ""
    );
    setQuantity(1);
    setProfitValue("");
  }

  const currentColors =
    product?.sizes?.length && selectedSize
      ? product.sizes.find((variant) => variant.size === selectedSize)?.colors || []
      : product?.colors || [];

  const currentColorOption = currentColors.find(
    (color) => normalizeColorValue(color) === selectedColor
  );
  const currentVariantStock = Number(currentColorOption?.stock ?? product?.stock);
  const hasVariantStock = Number.isFinite(currentVariantStock);
  const selectedColorLabel =
    typeof currentColorOption === "string"
      ? currentColorOption
      : currentColorOption?.name || "";

  // Clamp to the selected variant's stock. Previously an effect; doing it here
  // avoids rendering a quantity the variant can't satisfy.
  const clampedQuantity =
    hasVariantStock && currentVariantStock >= 1
      ? Math.min(quantity, currentVariantStock)
      : quantity;

  const updateQuantity = (nextQuantity) => {
    const parsedQuantity = Number(nextQuantity);

    if (Number.isNaN(parsedQuantity)) {
      setQuantity(1);
      return;
    }

    const next = Math.max(1, Math.floor(parsedQuantity));
    if (hasVariantStock && currentVariantStock > 0) {
      setQuantity(Math.min(next, currentVariantStock));
      return;
    }

    setQuantity(next);
  };

  // Picking a size also moves to that size's first colour.
  const selectSize = (sizeOption) => {
    setSelectedSize(sizeOption.size);
    setSelectedColor(
      (sizeOption.colors?.[0] && normalizeColorValue(sizeOption.colors[0])) || ""
    );
  };

  return {
    selectedSize,
    selectedColor,
    quantity: clampedQuantity,
    profitValue,
    currentColors,
    currentVariantStock,
    hasVariantStock,
    selectedColorLabel,
    normalizeColorValue,
    setProfitValue,
    selectSize,
    selectColor: setSelectedColor,
    updateQuantity,
  };
};

export default useProductVariants;
