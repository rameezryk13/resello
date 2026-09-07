import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import useAuthGate from "@/features/auth/useAuthGate";
import useWallet from "@/features/wallet/useWallet";

const guessFileExtension = (url) => {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (match?.[1]) return match[1].toLowerCase();
  } catch {
    // ignore
  }
  return "jpg";
};

// Owns the side-effecting actions on a product page: favourite toggling,
// add-to-cart / buy-now, copying the share link and downloading the media.
const useProductActions = ({
  product,
  images,
  quantity,
  selectedSize,
  selectedColor,
  profitValue,
  hasVariantStock,
  currentVariantStock,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, blocked } = useAuthGate();
  const { wallet } = useWallet();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const favoriteMessageTimer = useRef(null);

  const productId = product?.productId;

  // Derived rather than reset inside the effect: logging out empties the heart on
  // the next render instead of scheduling a second pass.
  const isFav = isAuthenticated && favorited;

  // Favourites are per-user, so with no session this request is a guaranteed
  // 401. Skipping it keeps the console clean.
  useEffect(() => {
    if (!productId || !isAuthenticated) return undefined;
    let cancelled = false;

    get(endpoints.favorites)
      .then((data) => {
        if (cancelled) return;
        const favIds = (data.favorites || []).map((p) => p.productId);
        setFavorited(favIds.includes(productId));
      })
      .catch(() => {
        // If favorites fail, keep the UI in non-favorite state.
      });

    return () => {
      cancelled = true;
    };
  }, [productId, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (favoriteMessageTimer.current) {
        clearTimeout(favoriteMessageTimer.current);
      }
    };
  }, []);

  const showFavoriteMessage = (message) => {
    setFavoriteMessage(message);
    if (favoriteMessageTimer.current) {
      clearTimeout(favoriteMessageTimer.current);
    }
    favoriteMessageTimer.current = setTimeout(() => {
      setFavoriteMessage("");
    }, 1800);
  };

  const toggleFavorite = async () => {
    if (!productId || favLoading) return;
    if (blocked()) return;
    setFavLoading(true);
    setActionError(null);

    try {
      const data = await post(endpoints.favorites, { productId });

      const favIds = (data.favorites || []).map((p) => p.productId);
      const nextIsFav = favIds.includes(productId);
      setFavorited(nextIsFav);
      showFavoriteMessage(
        nextIsFav ? "Added to favorites" : "Removed from favorites"
      );
    } catch (e) {
      setActionError(e?.message || "Could not update favorite");
      showFavoriteMessage("Could not update favorite");
    } finally {
      setFavLoading(false);
    }
  };

  const saveToCart = async () => {
    if (!productId || addingToCart) return false;
    // Gated before the spinner starts: the visitor is leaving for /login, so a
    // button that flips to "Adding…" on the way out would be describing nothing.
    if (blocked()) return false;

    if (wallet?.deactivated) {
      const email = wallet.support?.email || "support@resello.pk";
      setActionError(
        wallet.deactivationMessage ||
          `Your account is disabled because you have received 5 return penalties. You cannot place orders. Please contact admin at ${email}`
      );
      return false;
    }

    setAddingToCart(true);
    setActionError(null);
    setCartMessage(null);
    const profit = Number(profitValue) || 0;

    if (hasVariantStock && currentVariantStock <= 0) {
      setAddingToCart(false);
      setActionError("Selected variant is out of stock");
      return false;
    }

    if (hasVariantStock && quantity > currentVariantStock) {
      setAddingToCart(false);
      setActionError(`Only ${currentVariantStock} available for this variant`);
      return false;
    }

    try {
      await post(endpoints.cart.root, {
        productId,
        quantity,
        selectedSize,
        selectedColor,
        profit,
      });

      setCartMessage("Product added to cart");
      window.dispatchEvent(new CustomEvent("resello:cart-updated"));
      return true;
    } catch (e) {
      setActionError(e?.message || "Could not add to cart");
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const addToCart = async () => {
    await saveToCart();
  };

  const handleBuyNow = async () => {
    if (wallet?.deactivated) {
      const email = wallet.support?.email || "support@resello.pk";
      setActionError(
        wallet.deactivationMessage ||
          `Your account is disabled because you have received 5 return penalties. You cannot place orders. Please contact admin at ${email}`
      );
      return;
    }
    const success = await saveToCart();
    if (success) {
      navigate("/checkout");
    }
  };

  const copyProductLink = async () => {
    setActionError(null);
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard fallback for older browsers / non-HTTPS contexts.
      try {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      } catch (err) {
        setActionError(err?.message || "Could not copy link");
      }
    }
  };

  const downloadAllMedia = async () => {
    if (!images?.length || downloadLoading) return;

    setDownloadLoading(true);
    setActionError(null);
    const safeName = (product?.name || "product")
      .toString()
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "");

    try {
      for (let i = 0; i < images.length; i++) {
        const src = images[i];
        const ext = guessFileExtension(src);
        const filename = `${safeName}_${i + 1}.${ext}`;

        // Prefer blob download to avoid cross-origin download issues.
        try {
          const res = await fetch(src, { mode: "cors" });
          if (!res.ok) throw new Error(`Fetch failed for image ${i + 1}`);

          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();

          URL.revokeObjectURL(blobUrl);
        } catch {
          // Fallback: let browser try downloading the remote asset directly.
          const a = document.createElement("a");
          a.href = src;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      }
    } catch (e) {
      setActionError(e?.message || "Download failed");
    } finally {
      setDownloadLoading(false);
    }
  };

  return {
    isFav,
    favLoading,
    favoriteMessage,
    downloadLoading,
    addingToCart,
    cartMessage,
    actionError,
    toggleFavorite,
    addToCart,
    handleBuyNow,
    copyProductLink,
    downloadAllMedia,
  };
};

export default useProductActions;
