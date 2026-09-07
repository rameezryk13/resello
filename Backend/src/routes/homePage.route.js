const express = require('express');
const { products, shops, productReviews } = require('../../defaultPagesData/products');
const visualCategories = require('../../defaultPagesData/categories');
const heroPosters = require('../../defaultPagesData/poster');
const row = require("../../defaultPagesData/row");
const { userBucket, saveDb } = require('../lib/store');
const { requireAuth } = require('../middleware/auth');
const {
  ORDER_STATUSES,
  DEFAULT_ORDER_STATUS,
  isValidStatus,
} = require('../lib/orderStatus');
const {
  round2,
  parsePrice,
  computeItemProfit,
  summarizeOrder,
} = require('../lib/orders');
const {
  DEACTIVATED_MESSAGE,
  getDeactivatedMessage,
  isDeactivated,
  settleOrder,
  walletSummary,
} = require('../lib/wallet');

const router = express.Router();

// Favourites, cart, followed shops, addresses and orders used to be five
// module-level arrays here, which meant every visitor shared one cart and the
// lot was lost on restart. They now live per user in the JSON store — read a
// request's own bucket with userBucket(req.user.id), then call saveDb().
// Browsing (/home/*, /products/*, /shops, /events/*) stays open to everyone;
// only the routes below that touch a user's own data require a session.

// ================= NORMALIZE FUNCTION =================
function normalize(str) {
  if (!str) return "";
  return str.toString().toLowerCase().trim();
}

// ================= HOME =================

// Visual categories + posters
router.get('/home/visualCategories', (req, res) => {
  res.status(200).json({
    visualCategories,
    heroPosters
  });
});

// All products
router.get('/home/products', (req, res) => {
  res.status(200).json({
    products
  });
});

// Rows
router.get('/home/rows', (req, res) => {
  res.status(200).json({
    row
  });
});


// ================= EVENTS (hero banner) =================
// Returns the poster/event plus the products that go along with it, so a
// click on a hero banner can open a page dedicated to that event.
router.get('/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const poster = heroPosters.find((p) => String(p.id) === String(eventId));

  if (!poster) {
    return res.status(404).json({ message: 'Event not found' });
  }

  let matched = products.slice();

  if (poster.tag) {
    matched = matched.filter(
      (p) => Array.isArray(p.tags) && p.tags.includes(poster.tag)
    );
  }

  if (poster.category) {
    matched = matched.filter(
      (p) => normalize(p.category) === normalize(poster.category)
    );
  }

  // Fallback so an event page is never empty even if tags don't line up.
  if (matched.length === 0) {
    matched = products.slice(0, 12);
  }

  matched = matched
    .slice()
    .sort((a, b) => String(a.productId || "").localeCompare(String(b.productId || "")));

  res.json({ poster, products: matched, total: matched.length });
});

// ================= PRODUCT DETAIL =================
// Filter API
router.get('/products/filter', (req, res) => {
  const category = String(req.query.category || "").trim();
  const subCategory = String(req.query.subCategory || "").trim();
  const ratingRaw = req.query.rating;
  const sortPriceRaw = req.query.sortPrice;
  const sortPrice = String(
    Array.isArray(sortPriceRaw) ? sortPriceRaw[0] : sortPriceRaw || ""
  )
    .trim()
    .toLowerCase();

  let filtered = products.slice();

  /** First numeric price in string (handles "$1,299", "$99.99", etc.) */
  const parsePriceNum = (p) => {
    const raw = p.price ?? p.salePrice ?? "";
    const cleaned = String(raw).replace(/,/g, "");
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1], 10) : 0;
  };

  const catEq = (a, b) =>
    String(a || "").toLowerCase() === String(b || "").toLowerCase();

  // Category can be a single value or a comma-separated list (e.g. the
  // header's "Fashion" link groups Men's/Women's/Kids Fashion together).
  if (category) {
    const categoryList = category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    filtered = filtered.filter((p) =>
      categoryList.some((c) => catEq(p.category, c))
    );
  }

  // Subcategory only applies with a category (avoids ambiguous names like "Accessories" across departments)
  if (subCategory && category) {
    filtered = filtered.filter((p) => catEq(p.subCategory, subCategory));
  }

  if (ratingRaw !== undefined && ratingRaw !== "") {
    const ratingNum = Number(ratingRaw);
    if (!Number.isNaN(ratingNum)) {
      filtered = filtered.filter((p) => p.rating >= ratingNum);
    }
  }

  const sortByProductId = (a, b) =>
    String(a.productId || "").localeCompare(String(b.productId || ""));

  if (sortPrice === "asc" || sortPrice === "desc") {
    filtered = filtered.slice().sort((a, b) => {
      const na = parsePriceNum(a);
      const nb = parsePriceNum(b);
      const cmp = sortPrice === "asc" ? na - nb : nb - na;
      return cmp !== 0 ? cmp : sortByProductId(a, b);
    });
  } else {
    filtered.sort(sortByProductId);
  }

  res.json({ products: filtered, total: filtered.length });
});

router.get('/products/subcategories', (req, res) => {
  const category = String(req.query.category || "").trim();

  // Grouped categories (comma-separated, e.g. the "Fashion" nav link)
  // don't expose a single subcategory list.
  if (!category || category.includes(",")) {
    return res.json({ subCategories: [] });
  }

  const source = products.filter(
    (p) => (p.category || "").toLowerCase() === category.toLowerCase()
  );

  const subCategories = [
    ...new Set(source.map((p) => p.subCategory).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  res.json({ subCategories });
});

// Related products for PDP rows: by category or by category + subcategory
router.get("/products/related", (req, res) => {
  const type = String(req.query.type || "").toLowerCase();
  const category = String(req.query.category || "").trim();
  const subCategory = String(req.query.subCategory || "").trim();
  const exclude = String(req.query.exclude || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 24);

  const catEq = (a, b) =>
    String(a || "").toLowerCase() === String(b || "").toLowerCase();

  let list = products.slice();
  if (exclude) {
    list = list.filter((p) => p.productId !== exclude);
  }

  if (type === "subcategory" && category && subCategory) {
    list = list.filter(
      (p) => catEq(p.category, category) && catEq(p.subCategory, subCategory)
    );
  } else if (type === "category" && category) {
    list = list.filter((p) => catEq(p.category, category));
  } else {
    return res
      .status(400)
      .json({ message: "Use type=category&category=... or type=subcategory&category=...&subCategory=..." });
  }

  list.sort((a, b) =>
    String(a.productId || "").localeCompare(String(b.productId || ""))
  );
  res.json({ products: list.slice(0, limit), total: list.length });
});

// ================= SEARCH (must be before /products/:id) =================
function normalizeSearchQuery(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .replace(/['",]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

router.get("/products/search", (req, res) => {
  const q = normalizeSearchQuery(req.query.q);
  if (!q) return res.json([]);

  let exactId = [];
  let idMatch = [];
  let nameMatch = [];
  let categoryMatch = [];
  let tagMatch = [];

  products.forEach((p) => {
    const pid = normalizeSearchQuery(p.productId || "");
    const name = normalizeSearchQuery(p.name);
    const category = normalizeSearchQuery(p.category);
    const subCategory = normalizeSearchQuery(p.subCategory);
    const tags = (p.tags || []).join(" ").toLowerCase();

    if (pid === q) {
      exactId.push(p);
    } else if (pid.includes(q)) {
      idMatch.push(p);
    } else if (name.includes(q)) {
      nameMatch.push(p);
    } else if (category.includes(q) || subCategory.includes(q)) {
      categoryMatch.push(p);
    } else if (tags.includes(q)) {
      tagMatch.push(p);
    }
  });

  const results = [
    ...exactId,
    ...idMatch,
    ...nameMatch,
    ...categoryMatch,
    ...tagMatch,
  ];

  res.json(results.slice(0, 10));
});

router.get("/products/:productId", (req, res) => {
  const pid = req.params.productId;
  const product = products.find((p) => p.productId === pid);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const shop = shops.find((s) => s.shopId === product.shopId);
  res.json({ product, shop });
});

router.get("/products/:productId/reviews", (req, res) => {
  const productId = req.params.productId;
  const product = products.find((p) => p.productId === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const reviews = productReviews[productId] || [];
  const rating = Number(product.rating) || 0;
  const totalRatings = Number(product.reviews) || reviews.length;
  const fiveStarShare = rating >= 5 ? 100 : rating >= 4 ? 72 : rating >= 3 ? 45 : 24;
  const fourStarShare = rating >= 5 ? 0 : rating >= 4 ? 21 : rating >= 3 ? 28 : 18;
  const threeStarShare = rating >= 4 ? 0 : rating >= 3 ? 18 : 26;
  const twoStarShare = rating >= 3 ? 0 : rating >= 2 ? 20 : 16;
  const oneStarShare = Math.max(
    0,
    100 - fiveStarShare - fourStarShare - threeStarShare - twoStarShare
  );

  // Compute category averages
  let deliverySum = 0, qualitySum = 0, priceSum = 0;
  reviews.forEach((r) => {
    deliverySum += Number(r.ratings?.delivery || r.rating || 4.8);
    qualitySum += Number(r.ratings?.quality || r.rating || 4.9);
    priceSum += Number(r.ratings?.price || r.rating || 4.8);
  });
  const count = Math.max(1, reviews.length);

  const categoryRatings = {
    delivery: Math.round((deliverySum / count) * 10) / 10 || 4.8,
    quality: Math.round((qualitySum / count) * 10) / 10 || 4.9,
    price: Math.round((priceSum / count) * 10) / 10 || 4.8,
  };

  res.json({
    reviews,
    summary: {
      averageRating: rating,
      totalRatings,
      categoryRatings,
      mentions: product.reviewMentions || ["price", "delivery", "quality", "value", "recommended"],
      distribution: [
        { stars: 5, percentage: fiveStarShare },
        { stars: 4, percentage: fourStarShare },
        { stars: 3, percentage: threeStarShare },
        { stars: 2, percentage: twoStarShare },
        { stars: 1, percentage: oneStarShare },
      ],
    },
  });
});

router.post("/products/:productId/reviews", requireAuth, (req, res) => {
  const productId = req.params.productId;
  const product = products.find((p) => p.productId === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { rating, comment, image, images, ratings } = req.body;
  const baseRating = Number(rating) || 5;

  const categoryRatingsInput = {
    delivery: Math.max(1, Math.min(5, Number(ratings?.delivery || baseRating))),
    quality: Math.max(1, Math.min(5, Number(ratings?.quality || baseRating))),
    price: Math.max(1, Math.min(5, Number(ratings?.price || baseRating))),
  };

  const computedAvg = Math.round(
    ((categoryRatingsInput.delivery + categoryRatingsInput.quality + categoryRatingsInput.price) / 3) * 10
  ) / 10;

  if (!productReviews[productId]) {
    productReviews[productId] = [];
  }

  const reviewImagesList = Array.isArray(images) && images.length > 0
    ? images
    : image
      ? [image]
      : [];

  const newReview = {
    reviewId: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reviewerName: req.user?.name || "Verified Customer",
    rating: computedAvg,
    ratings: categoryRatingsInput,
    comment: String(comment || "").trim() || "Great quality product!",
    images: reviewImagesList,
    image: reviewImagesList[0] || null,
    date: new Date().toISOString(),
    verified: true,
  };

  productReviews[productId].unshift(newReview);

  const allRatings = productReviews[productId].map((r) => Number(r.rating) || 5);
  const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviews = productReviews[productId].length;

  res.status(201).json({
    message: "Review submitted successfully!",
    review: newReview,
    product: { rating: product.rating, reviews: product.reviews },
  });
});

// The whole wholesaler list. Registered before '/shops/:shopId' so the literal
// path is matched first and never read as a shopId of "".
router.get('/shops', (req, res) => {
  res.json({ shops });
});

router.get('/shops/:shopId', (req, res) => {
  const shopId = req.params.shopId;
  const shop = shops.find((s) => s.shopId === shopId);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  const shopProducts = products.filter((product) => product.shopId === shopId);
  res.json({ shop, products: shopProducts });
});

// ================= FOLLOWED SHOPS =================

router.get('/followed-shops', requireAuth, (req, res) => {
  const { followedShops } = userBucket(req.user.id);
  res.json({ followedShops });
});

router.post('/followed-shops', requireAuth, (req, res) => {
  const { shopId } = req.body;

  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }

  const shop = shops.find((entry) => entry.shopId === shopId);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  const bucket = userBucket(req.user.id);
  const existing = bucket.followedShops.find((entry) => entry.shopId === shopId);

  if (existing) {
    bucket.followedShops = bucket.followedShops.filter((entry) => entry.shopId !== shopId);
  } else {
    bucket.followedShops.push({
      ...shop,
      followedAt: new Date().toISOString(),
    });
  }

  saveDb();

  res.json({
    followedShops: bucket.followedShops,
    followed: bucket.followedShops.some((entry) => entry.shopId === shopId),
  });
});

// ================= FAVORITES =================

// Get all favorites
router.get('/favorites', requireAuth, (req, res) => {
  const { favorites } = userBucket(req.user.id);
  res.json({ favorites });
});

// Add / Remove favorite
router.post('/favorites', requireAuth, (req, res) => {
  const { productId } = req.body;

  const product = products.find(p => p.productId === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const bucket = userBucket(req.user.id);
  const exists = bucket.favorites.find(p => p.productId === productId);

  if (exists) {
    // Remove from favorites
    bucket.favorites = bucket.favorites.filter(p => p.productId !== productId);
  } else {
    // Add to favorites
    bucket.favorites.push(product);
  }

  saveDb();
  res.json({ favorites: bucket.favorites });
});

// ================= CART =================
function buildCartItemId({ productId, selectedSize = "", selectedColor = "", profit = 0 }) {
  const safe = (value) => String(value || "").replace(/[|:]/g, "-");
  return `${safe(productId)}|${safe(selectedSize)}|${safe(selectedColor)}|${Number(profit)}`;
}

router.get('/cart', requireAuth, (req, res) => {
  const { cart } = userBucket(req.user.id);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart, totalItems });
});

router.post('/cart', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  if (isDeactivated(bucket)) {
    return res.status(403).json({ message: getDeactivatedMessage(bucket), deactivated: true });
  }

  const { productId, quantity = 1, selectedSize = "", selectedColor = "", profit = 0 } = req.body;
  const parsedQuantity = Number(quantity) || 1;
  const parsedProfit = Number(profit) || 0;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  if (parsedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  const product = products.find((p) => p.productId === productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const itemId = buildCartItemId({ productId, selectedSize, selectedColor, profit: parsedProfit });
  const existing = bucket.cart.find((item) => item.itemId === itemId);

  if (existing) {
    existing.quantity += parsedQuantity;
  } else {
    bucket.cart.push({
      itemId,
      product,
      quantity: parsedQuantity,
      selectedSize,
      selectedColor,
      profit: parsedProfit,
    });
  }

  saveDb();

  const totalItems = bucket.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart: bucket.cart, totalItems });
});

router.put('/cart/:itemId', requireAuth, (req, res) => {
  const itemId = req.params.itemId;
  const { quantity } = req.body;
  const parsedQuantity = Number(quantity);

  if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a valid number' });
  }

  const bucket = userBucket(req.user.id);
  const existing = bucket.cart.find((item) => item.itemId === itemId);
  if (!existing) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  if (parsedQuantity === 0) {
    bucket.cart = bucket.cart.filter((item) => item.itemId !== itemId);
  } else {
    existing.quantity = parsedQuantity;
  }

  saveDb();

  const totalItems = bucket.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart: bucket.cart, totalItems });
});

router.delete('/cart/:itemId', requireAuth, (req, res) => {
  const itemId = req.params.itemId;
  const bucket = userBucket(req.user.id);
  const existing = bucket.cart.find((item) => item.itemId === itemId);

  if (!existing) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  bucket.cart = bucket.cart.filter((item) => item.itemId !== itemId);
  saveDb();

  const totalItems = bucket.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart: bucket.cart, totalItems });
});

// One checkout can span several suppliers, and each supplier ships and is paid
// separately — so a mixed cart becomes one order per shop rather than a single
// order the customer can't track per parcel. Items without a shopId fall into
// their own "unknown-shop" group instead of being dropped.
function groupCartByShop(cartPayload) {
  const groups = [];

  cartPayload.forEach((item) => {
    const shopId = item?.product?.shopId || "unknown-shop";
    const shopName = item?.product?.shopName || "Unknown Supplier";
    const existing = groups.find((group) => group.shopId === shopId);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ shopId, shopName, items: [item] });
    }
  });

  return groups;
}

// What the goods in a group are worth to the customer: line prices plus the
// reseller's profit, i.e. everything except tax and shipping. Used as the
// weight for splitting the one total checkout quoted across the suppliers.
function groupGoodsValue(items) {
  return items.reduce((sum, item) => {
    const lineTotal = parsePrice(item?.product?.price) * (Number(item.quantity) || 0);
    return sum + lineTotal + computeItemProfit(item);
  }, 0);
}

// Divides an amount across weights so the parts add back up to exactly the
// whole — every part is rounded to 2dp and the last one absorbs the remainder,
// so the supplier orders never sum to a rupee more or less than what the
// customer was quoted. Zero total weight (a free cart) splits evenly.
function splitByWeight(amount, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.map((weight) =>
    round2(totalWeight > 0 ? (amount * weight) / totalWeight : amount / weights.length)
  );

  const remainder = round2(amount - shares.slice(0, -1).reduce((sum, share) => sum + share, 0));
  shares[shares.length - 1] = remainder;

  return shares;
}

router.get('/addresses', requireAuth, (req, res) => {
  const { addresses } = userBucket(req.user.id);
  res.json({ addresses });
});

router.post('/addresses', requireAuth, (req, res) => {
  const { name, line1, line2, city, phone, phone2 } = req.body;

  if (!name || !line1 || !city || !phone) {
    return res.status(400).json({ message: 'Please provide all required address fields' });
  }

  const bucket = userBucket(req.user.id);

  // Namespaced by user id for the same reason the seeded ids are: an address id
  // is what POST /orders trusts, so it must never collide across accounts.
  const newAddress = {
    id: `${req.user.id}-address-${Date.now()}`,
    name,
    line1,
    line2: line2 || "",
    city,
    phone,
    phone2: phone2 || "",
  };

  bucket.addresses.push(newAddress);
  saveDb();

  res.status(201).json({ addresses: bucket.addresses });
});

router.post('/orders', requireAuth, (req, res) => {
  const { addressId, cart: cartPayload, totalAmount, shippingCharge, paymentType } = req.body;
  const bucket = userBucket(req.user.id);

  // Checked before anything else is validated: a deactivated reseller can't
  // place an order however well-formed it is, and the frontend disables the
  // button for the same reason — but the rule has to hold without it.
  if (isDeactivated(bucket)) {
    return res.status(403).json({ message: getDeactivatedMessage(bucket), deactivated: true });
  }

  const selectedAddress = bucket.addresses.find((address) => address.id === addressId);

  if (!selectedAddress) {
    return res.status(400).json({ message: 'Selected address is invalid' });
  }

  if (!Array.isArray(cartPayload) || cartPayload.length === 0) {
    return res.status(400).json({ message: 'Cart must contain at least one item' });
  }

  const orderTotal = Number(totalAmount) || 0;
  const computedShipping = Number(shippingCharge) || 0;

  // One checkout, one order per supplier. checkoutId ties the siblings back
  // together for anything that needs to show them as a single purchase.
  const placedAt = Date.now();
  const checkoutId = `checkout-${placedAt}`;
  const createdAt = new Date().toISOString();

  const shopGroups = groupCartByShop(cartPayload);
  const weights = shopGroups.map((group) => groupGoodsValue(group.items));
  const totalShares = splitByWeight(orderTotal, weights);
  const shippingShares = splitByWeight(computedShipping, weights);

  const newOrders = shopGroups.map((group, index) => ({
    orderId: `order-${placedAt}-${index + 1}`,
    checkoutId,
    // Position in the split, so the UI can say "1 of 3" without recounting.
    supplierIndex: index + 1,
    supplierCount: shopGroups.length,
    shopId: group.shopId,
    shopName: group.shopName,
    address: selectedAddress,
    cart: group.items,
    totalAmount: totalShares[index],
    shippingCharge: shippingShares[index],
    paymentType: paymentType || "cod",
    status: DEFAULT_ORDER_STATUS,
    createdAt,
  }));

  bucket.orders.push(...newOrders);
  bucket.cart = [];
  saveDb();

  res.status(201).json({
    orders: newOrders,
    // Kept so existing single-order callers keep working.
    order: newOrders[0],
    checkoutId,
    cart: bucket.cart,
    totalItems: 0,
  });
});

router.get('/orders', requireAuth, (req, res) => {
  const enrichedOrders = userBucket(req.user.id).orders
    .slice()
    // Orders split from the same checkout share a createdAt to the
    // millisecond, so orderId breaks the tie and keeps the list stable.
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      || String(a.orderId).localeCompare(String(b.orderId)))
    .map(summarizeOrder);

  res.json({ orders: enrichedOrders });
});

// Stands in for the courier webhook a real deployment would have. A reseller
// obviously can't decide their own order was delivered — but until couriers are
// wired in, this is the only way to walk the commission and penalty rules, so
// the frontend labels it as a demo control.
router.put('/orders/:orderId/status', requireAuth, (req, res) => {
  const { status } = req.body;

  if (!isValidStatus(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
    });
  }

  const bucket = userBucket(req.user.id);
  const order = bucket.orders.find((item) => item.orderId === req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  if (status === 'Delivered' && !order.deliveredAt) {
    order.deliveredAt = new Date().toISOString();
  }

  const summary = summarizeOrder(order);
  settleOrder(bucket, order, summary.profit);

  if (status === 'Delivered') {
    bucket.notifications = bucket.notifications || [];
    const exists = bucket.notifications.some((n) => n.orderId === order.orderId && n.type === 'review');
    if (!exists) {
      bucket.notifications.unshift({
        id: `notif_review_${order.orderId}`,
        type: 'review',
        title: 'Order Delivered - Give a Review!',
        message: `Order ${order.orderId} was delivered. Tap here to rate your product and add a photo review!`,
        time: 'Just now',
        unread: true,
        orderId: order.orderId,
        order: summary,
      });
    }
  }

  saveDb();

  res.json({
    order: summary,
    wallet: walletSummary(bucket, bucket.orders.map(summarizeOrder)),
  });
});

router.post('/orders/:orderId/return', requireAuth, (req, res) => {
  const { reason, description, mediaUrl, mediaType, productId, productName, mistakeType } = req.body || {};

  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ message: 'Please provide a return reason.' });
  }

  if (!mediaUrl || !String(mediaUrl).trim()) {
    return res.status(400).json({ message: 'Please provide a photo or video proof of the defective product.' });
  }

  const bucket = userBucket(req.user.id);
  const order = bucket.orders.find((item) => item.orderId === req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Derive mistake classification if not explicitly given
  const derivedMistake =
    mistakeType ||
    (String(reason).toLowerCase().includes('damage') || String(reason).toLowerCase().includes('transit')
      ? 'Shipping Mistake'
      : 'Vendor Mistake');

  const returnPayload = {
    id: `ret_${Date.now()}`,
    reason: String(reason).trim(),
    description: String(description || '').trim(),
    mediaUrl: String(mediaUrl).trim(),
    mediaType: mediaType || 'image',
    productId: productId || null,
    productName: productName || null,
    mistakeType: derivedMistake,
    requestedAt: new Date().toISOString(),
    status: 'In Progress',
  };

  order.returnRequest = returnPayload;
  order.status = 'Returned';

  const summary = summarizeOrder(order);
  settleOrder(bucket, order, summary.profit);

  bucket.notifications = bucket.notifications || [];
  bucket.notifications.unshift({
    id: `notif_return_${order.orderId}_${Date.now()}`,
    type: 'shipping',
    title: 'Return Request Submitted',
    message: `Return request for Order #${order.orderId} (${returnPayload.reason} - ${derivedMistake}) has been submitted with proof.`,
    time: 'Just now',
    unread: true,
    orderId: order.orderId,
    order: summary,
  });

  saveDb();

  res.json({
    message: 'Return request submitted successfully.',
    order: summary,
    returnRequest: returnPayload,
    wallet: walletSummary(bucket, bucket.orders.map(summarizeOrder)),
  });
});

router.put('/orders/:orderId/return-status', requireAuth, (req, res) => {
  const { returnStatus, mistakeType, resolutionNote } = req.body || {};

  const allowedStatuses = ['In Progress', 'Accepted', 'Rejected'];
  if (!returnStatus || !allowedStatuses.includes(returnStatus)) {
    return res.status(400).json({ message: `Invalid return status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  const bucket = userBucket(req.user.id);
  const order = bucket.orders.find((item) => item.orderId === req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!order.returnRequest) {
    // If order was marked as Returned without returnRequest, create one now
    order.returnRequest = {
      id: `ret_${Date.now()}`,
      reason: 'Product Return Claim',
      requestedAt: order.deliveredAt || order.createdAt || new Date().toISOString(),
      status: returnStatus,
      mistakeType: mistakeType || 'Vendor Mistake',
    };
  }

  order.returnRequest.status = returnStatus;
  if (mistakeType) {
    order.returnRequest.mistakeType = mistakeType;
  }
  if (resolutionNote !== undefined) {
    order.returnRequest.resolutionNote = resolutionNote;
  }

  if (returnStatus === 'Accepted') {
    order.returnRequest.acceptedAt = new Date().toISOString();
    order.returnRequest.rejectedAt = null;
    bucket.notifications = bucket.notifications || [];
    bucket.notifications.unshift({
      id: `notif_ret_acc_${order.orderId}_${Date.now()}`,
      type: 'shipping',
      title: 'Return Request Accepted',
      message: `Return for Order #${order.orderId} was accepted as ${order.returnRequest.mistakeType || 'Vendor Mistake'}. Refund/claim has been approved.`,
      time: 'Just now',
      unread: true,
      orderId: order.orderId,
    });
  } else if (returnStatus === 'Rejected') {
    order.returnRequest.rejectedAt = new Date().toISOString();
    order.returnRequest.acceptedAt = null;
    bucket.notifications = bucket.notifications || [];
    bucket.notifications.unshift({
      id: `notif_ret_rej_${order.orderId}_${Date.now()}`,
      type: 'shipping',
      title: 'Return Request Declined',
      message: `Return for Order #${order.orderId} was declined per inspection policy.`,
      time: 'Just now',
      unread: true,
      orderId: order.orderId,
    });
  }

  const summary = summarizeOrder(order);
  settleOrder(bucket, order, summary.profit);
  saveDb();

  res.json({
    message: `Return request for order #${order.orderId} updated to ${returnStatus}.`,
    order: summary,
    returnRequest: order.returnRequest,
    wallet: walletSummary(bucket, bucket.orders.map(summarizeOrder)),
  });
});

router.get('/notifications', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  res.json({ notifications: bucket.notifications || [] });
});

router.post('/notifications/mark-read', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  bucket.notifications = (bucket.notifications || []).map((n) => ({ ...n, unread: false }));
  saveDb();
  res.json({ notifications: bucket.notifications });
});

router.get('/profit-summary', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  const enrichedOrders = bucket.orders.map(summarizeOrder);
  const totalProfit = enrichedOrders.reduce((sum, order) => sum + order.profit, 0);
  const grossSales = enrichedOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const itemsSold = enrichedOrders.reduce((sum, order) => sum + order.itemCount, 0);
  const shippingCollected = enrichedOrders.reduce((sum, order) => sum + (Number(order.shippingCharge) || 0), 0);

  // The payment summary page shows earnings and deductions side by side, so it
  // gets the whole wallet picture rather than making a second call for the half
  // of the page that is about penalties.
  const wallet = walletSummary(bucket, enrichedOrders);

  res.json({
    totals: {
      ordersCount: enrichedOrders.length,
      itemsSold,
      grossSales,
      totalProfit,
      shippingCollected,
    },
    wallet,
    recentOrders: enrichedOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
  });
});

module.exports = router;
