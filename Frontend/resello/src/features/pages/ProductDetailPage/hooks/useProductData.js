import { useEffect, useState } from "react";
import { get } from "../../../../api/client";
import endpoints from "../../../../api/endpoints";

const EMPTY_REVIEWS = {
  reviews: [],
  summary: null,
  loading: false,
  error: null,
};

// Owns everything fetched for a product page: the product itself, its shop,
// its reviews and the two related-product rows.
//
// Note on the `loadedId` / `reviewsFor` markers below: "still loading" is
// derived by comparing the requested id against the id we last stored, rather
// than flipping a loading flag from inside the effect body. Same behaviour,
// but it keeps every state write inside an async callback.
const useProductData = (id) => {
  const [productState, setProductState] = useState({
    loadedId: null,
    product: null,
    shop: null,
    error: null,
  });
  const [reviewState, setReviewState] = useState({
    reviewsFor: null,
    data: EMPTY_REVIEWS,
  });
  const [relatedCat, setRelatedCat] = useState([]);
  const [relatedSub, setRelatedSub] = useState([]);

  const productId = productState.product?.productId;

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    get(endpoints.products.byId(id))
      .then((data) => {
        if (cancelled) return;
        setProductState({
          loadedId: id,
          product: data.product,
          shop: data.shop || null,
          error: null,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setProductState({
          loadedId: id,
          product: null,
          shop: null,
          // The client's generic 404 text is "Not found"; this page says which
          // thing was missing, since the whole route is one product.
          error:
            e?.status === 404
              ? "Product not found"
              : e.message || "Something went wrong",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!productId) return undefined;
    let cancelled = false;

    get(endpoints.products.reviews(productId))
      .then((data) => {
        if (cancelled) return;
        setReviewState({
          reviewsFor: productId,
          data: {
            reviews: data.reviews || [],
            summary: data.summary || null,
            loading: false,
            error: null,
          },
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setReviewState({
          reviewsFor: productId,
          data: {
            reviews: [],
            summary: null,
            loading: false,
            error: e?.message || "Could not load reviews",
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const current = productState.product;
    if (!current?.productId) return undefined;

    let cancelled = false;

    get(
      endpoints.products.related({
        type: "category",
        category: current.category,
        exclude: current.productId,
        limit: 10,
      })
    )
      .then((d) => {
        if (!cancelled) setRelatedCat(d.products || []);
      })
      .catch(() => {
        if (!cancelled) setRelatedCat([]);
      });

    if (current.subCategory) {
      get(
        endpoints.products.related({
          type: "subcategory",
          category: current.category,
          subCategory: current.subCategory,
          exclude: current.productId,
          limit: 10,
        })
      )
        .then((d) => {
          if (!cancelled) setRelatedSub(d.products || []);
        })
        .catch(() => {
          if (!cancelled) setRelatedSub([]);
        });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) setRelatedSub([]);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [productState.product]);

  // A fetch is outstanding whenever the id we were asked for isn't the one we
  // last resolved. Matches the original `loading` flag, including the initial
  // `useState(true)` before the first request settles.
  const loading = !id || productState.loadedId !== id;

  // Reviews belong to the previous product until the new ones arrive.
  const reviewData =
    productId && reviewState.reviewsFor === productId
      ? reviewState.data
      : { ...EMPTY_REVIEWS, loading: Boolean(productId) };

  return {
    product: productState.product,
    shop: productState.shop,
    loading,
    error: productState.error,
    reviewData,
    relatedCat,
    relatedSub,
  };
};

export default useProductData;
