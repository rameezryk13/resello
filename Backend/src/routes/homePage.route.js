const express = require('express');
const { products, shops, productReviews } = require('../../defaultPagesData/products');
const visualCategories = require('../../defaultPagesData/categories');
const heroPosters = require('../../defaultPagesData/poster');
const row = require("../../defaultPagesData/row");

const router = express.Router();

let favorites = [];
let cart = [];
let followedShops = [];

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

  res.json({
    reviews,
    summary: {
      averageRating: rating,
      totalRatings,
      mentions: product.reviewMentions || [],
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

router.get('/followed-shops', (req, res) => {
  res.json({ followedShops });
});

router.post('/followed-shops', (req, res) => {
  const { shopId } = req.body;

  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }

  const shop = shops.find((entry) => entry.shopId === shopId);
  if (!shop) {
    return res.status(404).json({ message: 'Shop not found' });
  }

  const existing = followedShops.find((entry) => entry.shopId === shopId);

  if (existing) {
    followedShops = followedShops.filter((entry) => entry.shopId !== shopId);
  } else {
    followedShops.push({
      ...shop,
      followedAt: new Date().toISOString(),
    });
  }

  res.json({
    followedShops,
    followed: followedShops.some((entry) => entry.shopId === shopId),
  });
});

// ================= FAVORITES =================

// Get all favorites
router.get('/favorites', (req, res) => {
  res.json({ favorites });
});

// Add / Remove favorite
router.post('/favorites', (req, res) => {
  const { productId } = req.body;

  const product = products.find(p => p.productId === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const exists = favorites.find(p => p.productId === productId);

  if (exists) {
    // Remove from favorites
    favorites = favorites.filter(p => p.productId !== productId);
  } else {
    // Add to favorites
    favorites.push(product);
  }

  res.json({ favorites });
});

// ================= CART =================
function buildCartItemId({ productId, selectedSize = "", selectedColor = "", profit = 0 }) {
  const safe = (value) => String(value || "").replace(/[|:]/g, "-");
  return `${safe(productId)}|${safe(selectedSize)}|${safe(selectedColor)}|${Number(profit)}`;
}

router.get('/cart', (req, res) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart, totalItems });
});

router.post('/cart', (req, res) => {
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
  const existing = cart.find((item) => item.itemId === itemId);

  if (existing) {
    existing.quantity += parsedQuantity;
  } else {
    cart.push({
      itemId,
      product,
      quantity: parsedQuantity,
      selectedSize,
      selectedColor,
      profit: parsedProfit,
    });
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart, totalItems });
});

router.put('/cart/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  const { quantity } = req.body;
  const parsedQuantity = Number(quantity);

  if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a valid number' });
  }

  const existing = cart.find((item) => item.itemId === itemId);
  if (!existing) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  if (parsedQuantity === 0) {
    cart = cart.filter((item) => item.itemId !== itemId);
  } else {
    existing.quantity = parsedQuantity;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart, totalItems });
});

router.delete('/cart/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  const existing = cart.find((item) => item.itemId === itemId);

  if (!existing) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  cart = cart.filter((item) => item.itemId !== itemId);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.json({ cart, totalItems });
});

const addresses = [
  {
    id: "address-1",
    name: "Home",
    line1: "House Abcd, Street A, Phase 5",
    line2: "Block B, Islamabad",
    city: "Islamabad",
    postalCode: "44000",
    country: "Pakistan",
    phone: "+92 300 1234567",
  },
  {
    id: "address-2",
    name: "Office",
    line1: "Suite 23, Business Tower",
    line2: "F-8 Markaz, Islamabad",
    city: "Islamabad",
    postalCode: "44000",
    country: "Pakistan",
    phone: "+92 300 9876543",
  },
];

let orders = [];

function parsePrice(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, "");
  const match = cleaned.match(/-?[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : 0;
}

function computeItemProfit(item) {
  const rawProfit = item?.profit;
  if (rawProfit !== undefined && rawProfit !== null && !Number.isNaN(Number(rawProfit))) {
    return Number(rawProfit);
  }

  const price = parsePrice(item?.product?.price);
  const original = parsePrice(item?.product?.originalPrice);
  return original > price ? Math.max(0, original - price) : 0;
}

function summarizeOrder(order) {
  const items = Array.isArray(order?.cart) ? order.cart : [];
  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const profit = items.reduce((sum, item) => sum + computeItemProfit(item), 0);
  const subtotal = items.reduce((sum, item) => {
    return sum + parsePrice(item?.product?.price) * (Number(item.quantity) || 0);
  }, 0);

  return {
    ...order,
    itemCount,
    subtotal,
    profit,
  };
}

router.get('/addresses', (req, res) => {
  res.json({ addresses });
});

router.post('/addresses', (req, res) => {
  const { name, line1, line2, city, postalCode, country, phone } = req.body;

  if (!name || !line1 || !city || !postalCode || !country || !phone) {
    return res.status(400).json({ message: 'Please provide all required address fields' });
  }

  const newAddress = {
    id: `address-${Date.now()}`,
    name,
    line1,
    line2: line2 || "",
    city,
    postalCode,
    country,
    phone,
  };

  addresses.push(newAddress);
  res.status(201).json({ addresses });
});

router.post('/orders', (req, res) => {
  const { addressId, cart: cartPayload, totalAmount, shippingCharge } = req.body;
  const selectedAddress = addresses.find((address) => address.id === addressId);

  if (!selectedAddress) {
    return res.status(400).json({ message: 'Selected address is invalid' });
  }

  if (!Array.isArray(cartPayload) || cartPayload.length === 0) {
    return res.status(400).json({ message: 'Cart must contain at least one item' });
  }

  const orderTotal = Number(totalAmount) || 0;
  const computedShipping = Number(shippingCharge) || 0;
  const orderId = `order-${Date.now()}`;

  const newOrder = {
    orderId,
    address: selectedAddress,
    cart: cartPayload,
    totalAmount: orderTotal,
    shippingCharge: computedShipping,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  cart = [];

  res.status(201).json({ order: newOrder, cart, totalItems: 0 });
});

router.get('/orders', (req, res) => {
  const enrichedOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(summarizeOrder);

  res.json({ orders: enrichedOrders });
});

router.get('/profit-summary', (req, res) => {
  const enrichedOrders = orders.map(summarizeOrder);
  const totalProfit = enrichedOrders.reduce((sum, order) => sum + order.profit, 0);
  const grossSales = enrichedOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const itemsSold = enrichedOrders.reduce((sum, order) => sum + order.itemCount, 0);
  const shippingCollected = enrichedOrders.reduce((sum, order) => sum + (Number(order.shippingCharge) || 0), 0);

  res.json({
    totals: {
      ordersCount: enrichedOrders.length,
      itemsSold,
      grossSales,
      totalProfit,
      shippingCollected,
    },
    recentOrders: enrichedOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
  });
});

module.exports = router;
