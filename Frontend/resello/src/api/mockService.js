// Self-contained client mock service for GitHub Pages / offline demo.
// Implements the Resello backend endpoints directly in the browser using
// mock data and localStorage, so no external server or credit card is required.

import visualCategories from "@/mockData/categories";
import heroPosters from "@/mockData/poster";
import row from "@/mockData/row";
import defaultAddresses from "@/mockData/addresses";
import { products as initialProducts, shops as initialShops, productReviews as initialReviews } from "@/mockData/products";

const STORAGE_PREFIX = "resello_demo_";

function getStore(key, defaultValue) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStore(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn("Storage write failed", err);
  }
}

// Initial seed data
const products = [...initialProducts];
const shops = [...initialShops];
const productReviews = { ...initialReviews };

// Seed initial orders if storage is empty
const INITIAL_DEMO_ORDERS = [
  {
    orderId: "order-1724000000000-1",
    checkoutId: "checkout-1724000000000",
    supplierIndex: 1,
    supplierCount: 1,
    shopId: "shop_01",
    shopName: "Glamour Apparel & Co",
    address: defaultAddresses[0],
    cart: [
      {
        itemId: "MZ65800000108TW|||500",
        product: products.find((p) => p.productId === "MZ65800000108TW") || products[0],
        quantity: 1,
        selectedSize: "M",
        selectedColor: "Blue",
        profit: 500,
      },
    ],
    totalAmount: 2499,
    shippingCharge: 200,
    paymentType: "cod",
    status: "Delivered",
    deliveredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    itemCount: 1,
    subtotal: 1999,
    profit: 500,
  },
  {
    orderId: "order-1725000000000-1",
    checkoutId: "checkout-1725000000000",
    supplierIndex: 1,
    supplierCount: 1,
    shopId: "shop_02",
    shopName: "Apex Tech Hub",
    address: defaultAddresses[0],
    cart: [
      {
        itemId: "MZ65800000101TW|||800",
        product: products.find((p) => p.productId === "MZ65800000101TW") || products[1],
        quantity: 1,
        selectedSize: "",
        selectedColor: "Black",
        profit: 800,
      },
    ],
    totalAmount: 3799,
    shippingCharge: 200,
    paymentType: "bank",
    status: "In Transit",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    itemCount: 1,
    subtotal: 2999,
    profit: 800,
  },
];

const DEFAULT_USER = {
  id: "usr_demo_101",
  name: "Hamza Reseller",
  email: "demo@resello.pk",
  phone: "+92 300 1234567",
  shopName: "Hamza Deals",
  role: "reseller",
};

// State accessors
const getCart = () => getStore("cart", []);
const setCart = (cart) => setStore("cart", cart);

const getFavorites = () => getStore("favorites", []);
const setFavorites = (favs) => setStore("favorites", favs);

const getFollowedShops = () => getStore("followedShops", []);
const setFollowedShops = (shops) => setStore("followedShops", shops);

const getAddresses = () => getStore("addresses", defaultAddresses);
const setAddresses = (addrs) => setStore("addresses", addrs);

const getOrders = () => getStore("orders", INITIAL_DEMO_ORDERS);
const setOrders = (orders) => setStore("orders", orders);

const getNotifications = () =>
  getStore("notifications", [
    {
      id: "notif_welcome",
      type: "system",
      title: "Welcome to Resello Demo!",
      message: "Browse thousands of wholesale products, share on WhatsApp, and earn profit per sale.",
      time: "Just now",
      unread: true,
    },
    {
      id: "notif_order_1",
      type: "review",
      title: "Order Delivered - Give a Review!",
      message: "Order order-1724000000000-1 was delivered. Tap here to rate your product and add a photo review!",
      time: "2 days ago",
      unread: true,
      orderId: "order-1724000000000-1",
    },
  ]);
const setNotifications = (notifs) => setStore("notifications", notifs);

const getWithdrawRequests = () =>
  getStore("withdrawRequests", [
    {
      id: "wdr_101",
      amount: 500,
      bankName: "Meezan Bank",
      accountTitle: "Hamza Reseller",
      accountNumber: "010203040506",
      status: "Approved",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ]);
const setWithdrawRequests = (reqs) => setStore("withdrawRequests", reqs);

function parsePriceNum(raw) {
  if (!raw) return 0;
  const match = String(raw).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function calculateWallet() {
  const orders = getOrders();
  const withdrawRequests = getWithdrawRequests();

  let totalProfit = 0;
  let pendingProfit = 0;
  let deliveredProfit = 0;

  orders.forEach((o) => {
    const profit = Number(o.profit) || 0;
    totalProfit += profit;
    if (o.status === "Delivered") {
      deliveredProfit += profit;
    } else if (o.status !== "Cancelled" && o.status !== "Returned") {
      pendingProfit += profit;
    }
  });

  const totalWithdrawn = withdrawRequests
    .filter((r) => r.status === "Approved")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const pendingWithdrawal = withdrawRequests
    .filter((r) => r.status === "Pending")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const availableBalance = Math.max(0, deliveredProfit - totalWithdrawn - pendingWithdrawal);

  return {
    balance: availableBalance,
    availableBalance,
    pendingProfit,
    totalProfit,
    totalWithdrawn,
    pendingWithdrawal,
    deliveredProfit,
    canWithdraw: availableBalance >= 500,
    ledger: [
      ...orders.map((o) => ({
        id: `led_${o.orderId}`,
        type: o.status === "Delivered" ? "credit" : "pending",
        title: `Order Commission: ${o.orderId}`,
        amount: o.profit,
        status: o.status,
        date: o.createdAt,
      })),
      ...withdrawRequests.map((r) => ({
        id: `led_${r.id}`,
        type: "debit",
        title: `Payout Withdrawal (${r.bankName})`,
        amount: -r.amount,
        status: r.status,
        date: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
}

export async function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};

  // Parse path and params
  const [pathPart, queryPart] = endpoint.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const params = new URLSearchParams(queryPart || "");

  // Small synthetic delay (40ms) to feel natural
  await new Promise((r) => setTimeout(r, 40));

  // --- HOME ---
  if (path === "/home/visualCategories") {
    return { visualCategories, heroPosters };
  }

  if (path === "/home/products") {
    return { products };
  }

  if (path === "/home/rows") {
    return { row };
  }

  // --- EVENTS ---
  if (path.startsWith("/events/")) {
    const eventId = path.split("/")[2];
    const poster = heroPosters.find((p) => String(p.id) === String(eventId)) || heroPosters[0];
    return { poster, products: products.slice(0, 12), total: 12 };
  }

  // --- PRODUCT FILTERS & SEARCH ---
  if (path === "/products/filter") {
    const category = params.get("category");
    const subCategory = params.get("subCategory");
    const ratingRaw = params.get("rating");
    const sortPrice = params.get("sortPrice");

    let filtered = products.slice();

    if (category) {
      const catList = category.split(",").map((c) => c.trim().toLowerCase());
      filtered = filtered.filter((p) => catList.includes((p.category || "").toLowerCase()));
    }

    if (subCategory) {
      filtered = filtered.filter((p) => (p.subCategory || "").toLowerCase() === subCategory.toLowerCase());
    }

    if (ratingRaw) {
      filtered = filtered.filter((p) => (Number(p.rating) || 0) >= Number(ratingRaw));
    }

    if (sortPrice === "asc") {
      filtered.sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));
    } else if (sortPrice === "desc") {
      filtered.sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price));
    }

    return { products: filtered, total: filtered.length };
  }

  if (path === "/products/subcategories") {
    const category = params.get("category");
    const source = category ? products.filter((p) => (p.category || "").toLowerCase() === category.toLowerCase()) : products;
    const subCategories = [...new Set(source.map((p) => p.subCategory).filter(Boolean))].sort();
    return { subCategories };
  }

  if (path === "/products/related") {
    const category = params.get("category");
    const exclude = params.get("exclude");
    let list = products.slice();
    if (exclude) list = list.filter((p) => p.productId !== exclude);
    if (category) list = list.filter((p) => (p.category || "").toLowerCase() === category.toLowerCase());
    return { products: list.slice(0, 12), total: list.length };
  }

  if (path === "/products/search") {
    const q = (params.get("q") || "").toLowerCase().trim();
    if (!q) return [];
    const results = products.filter(
      (p) =>
        (p.productId || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
    return results.slice(0, 10);
  }

  // --- PRODUCT REVIEWS ---
  if (path.match(/^\/products\/[^/]+\/reviews$/)) {
    const productId = path.split("/")[2];
    const product = products.find((p) => p.productId === productId);
    const reviews = productReviews[productId] || [];
    const rating = Number(product?.rating) || 4.5;
    return {
      reviews,
      summary: {
        averageRating: rating,
        totalRatings: reviews.length || 24,
        categoryRatings: { delivery: 4.8, quality: 4.9, price: 4.7 },
        mentions: ["price", "delivery", "quality", "recommended"],
        distribution: [
          { stars: 5, percentage: 70 },
          { stars: 4, percentage: 20 },
          { stars: 3, percentage: 7 },
          { stars: 2, percentage: 2 },
          { stars: 1, percentage: 1 },
        ],
      },
    };
  }

  // --- SINGLE PRODUCT ---
  if (path.startsWith("/products/")) {
    const productId = path.split("/")[2];
    const product = products.find((p) => p.productId === productId) || products[0];
    const shop = shops.find((s) => s.shopId === product?.shopId) || shops[0];
    return { product, shop };
  }

  // --- SHOPS ---
  if (path === "/shops") {
    return { shops };
  }

  if (path.startsWith("/shops/")) {
    const shopId = path.split("/")[2];
    const shop = shops.find((s) => s.shopId === shopId) || shops[0];
    const shopProducts = products.filter((p) => p.shopId === shop?.shopId);
    return { shop, products: shopProducts };
  }

  // --- FOLLOWED SHOPS ---
  if (path === "/followed-shops") {
    if (method === "POST") {
      const { shopId } = body;
      let followed = getFollowedShops();
      const exists = followed.some((s) => s.shopId === shopId);
      if (exists) {
        followed = followed.filter((s) => s.shopId !== shopId);
      } else {
        const target = shops.find((s) => s.shopId === shopId);
        if (target) followed.push({ ...target, followedAt: new Date().toISOString() });
      }
      setFollowedShops(followed);
      return { followedShops: followed, followed: !exists };
    }
    return { followedShops: getFollowedShops() };
  }

  // --- FAVORITES ---
  if (path === "/favorites") {
    if (method === "POST") {
      const { productId } = body;
      let favs = getFavorites();
      const exists = favs.some((p) => p.productId === productId);
      if (exists) {
        favs = favs.filter((p) => p.productId !== productId);
      } else {
        const item = products.find((p) => p.productId === productId);
        if (item) favs.push(item);
      }
      setFavorites(favs);
      return { favorites: favs };
    }
    return { favorites: getFavorites() };
  }

  // --- CART ---
  if (path === "/cart") {
    let cart = getCart();
    if (method === "POST") {
      const { productId, quantity = 1, selectedSize = "", selectedColor = "", profit = 0 } = body;
      const product = products.find((p) => p.productId === productId);
      const itemId = `${productId}|${selectedSize}|${selectedColor}|${profit}`;
      const existing = cart.find((i) => i.itemId === itemId);
      if (existing) {
        existing.quantity += Number(quantity) || 1;
      } else if (product) {
        cart.push({
          itemId,
          product,
          quantity: Number(quantity) || 1,
          selectedSize,
          selectedColor,
          profit: Number(profit) || 0,
        });
      }
      setCart(cart);
    }
    const totalItems = cart.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return { cart, totalItems };
  }

  if (path.startsWith("/cart/")) {
    const itemId = decodeURIComponent(path.split("/")[2]);
    let cart = getCart();
    if (method === "DELETE") {
      cart = cart.filter((i) => i.itemId !== itemId);
    } else if (method === "PUT") {
      const qty = Number(body.quantity);
      if (qty <= 0) {
        cart = cart.filter((i) => i.itemId !== itemId);
      } else {
        const item = cart.find((i) => i.itemId === itemId);
        if (item) item.quantity = qty;
      }
    }
    setCart(cart);
    const totalItems = cart.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return { cart, totalItems };
  }

  // --- ADDRESSES ---
  if (path === "/addresses") {
    let addrs = getAddresses();
    if (method === "POST") {
      const newAddr = {
        id: `addr_${Date.now()}`,
        name: body.name || "Default Address",
        line1: body.line1 || "",
        line2: body.line2 || "",
        city: body.city || "Islamabad",
        phone: body.phone || "+92 300 1234567",
        phone2: body.phone2 || "",
      };
      addrs.push(newAddr);
      setAddresses(addrs);
      return { addresses: addrs };
    }
    return { addresses: addrs };
  }

  // --- ORDERS ---
  if (path === "/orders") {
    let orders = getOrders();
    if (method === "POST") {
      const { addressId, cart: cartPayload = [], totalAmount, shippingCharge = 200, paymentType = "cod" } = body;
      const addrs = getAddresses();
      const addr = addrs.find((a) => a.id === addressId) || addrs[0];

      const newOrder = {
        orderId: `order-${Date.now()}-1`,
        checkoutId: `checkout-${Date.now()}`,
        supplierIndex: 1,
        supplierCount: 1,
        shopId: cartPayload[0]?.product?.shopId || "shop_01",
        shopName: cartPayload[0]?.product?.shopName || "Glamour Apparel & Co",
        address: addr,
        cart: cartPayload,
        totalAmount: Number(totalAmount) || 2500,
        shippingCharge: Number(shippingCharge) || 200,
        paymentType,
        status: "In Transit",
        createdAt: new Date().toISOString(),
        itemCount: cartPayload.reduce((s, i) => s + (Number(i.quantity) || 0), 0),
        subtotal: cartPayload.reduce((s, i) => s + parsePriceNum(i.product?.price) * (Number(i.quantity) || 0), 0),
        profit: cartPayload.reduce((s, i) => s + (Number(i.profit) || 0), 0),
      };

      orders.unshift(newOrder);
      setOrders(orders);
      setCart([]); // Clear cart after order

      return {
        orders: [newOrder],
        order: newOrder,
        checkoutId: newOrder.checkoutId,
        cart: [],
        totalItems: 0,
      };
    }
    return { orders };
  }

  if (path.match(/^\/orders\/[^/]+\/status$/)) {
    const orderId = path.split("/")[2];
    const { status } = body;
    let orders = getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (target) {
      target.status = status;
      if (status === "Delivered" && !target.deliveredAt) {
        target.deliveredAt = new Date().toISOString();
        const notifs = getNotifications();
        notifs.unshift({
          id: `notif_${Date.now()}`,
          type: "review",
          title: "Order Delivered - Give a Review!",
          message: `Order ${orderId} was marked as Delivered. Profit credited to your wallet!`,
          time: "Just now",
          unread: true,
          orderId,
        });
        setNotifications(notifs);
      }
      setOrders(orders);
    }
    return { order: target, wallet: calculateWallet() };
  }

  if (path.match(/^\/orders\/[^/]+\/return$/)) {
    const orderId = path.split("/")[2];
    let orders = getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (target) {
      target.status = "Returned";
      setOrders(orders);
    }
    return { message: "Return request submitted successfully.", order: target };
  }

  // --- WALLET ---
  if (path === "/wallet") {
    return { wallet: calculateWallet() };
  }

  if (path === "/wallet/withdraw-request") {
    const amount = Number(body.amount) || 500;
    const reqs = getWithdrawRequests();
    const newReq = {
      id: `wdr_${Date.now()}`,
      amount,
      bankName: "Meezan Bank",
      accountTitle: "Hamza Reseller",
      accountNumber: "010203040506",
      status: "Approved",
      createdAt: new Date().toISOString(),
    };
    reqs.unshift(newReq);
    setWithdrawRequests(reqs);
    return { wallet: calculateWallet(), request: newReq };
  }

  if (path === "/wallet/demo-date") {
    return { wallet: calculateWallet(), message: "Demo date updated" };
  }

  // --- NOTIFICATIONS ---
  if (path === "/notifications") {
    return { notifications: getNotifications() };
  }

  if (path.match(/^\/notifications\/[^/]+\/read$/)) {
    const id = path.split("/")[2];
    const notifs = getNotifications().map((n) => (n.id === id ? { ...n, unread: false } : n));
    setNotifications(notifs);
    return { success: true };
  }

  // --- SUPPORT ---
  if (path === "/support/issues") {
    return {
      issues: [
        {
          id: "ISS-409218",
          userName: "Hamza Deals",
          issueType: "Delivery Issues",
          description: "Customer parcel delivered successfully. Verified with TCS.",
          status: "resolved",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      active: [],
      resolved: [],
    };
  }

  if (path === "/support/settlement-orders") {
    return { orders: getOrders().filter((o) => o.status === "Delivered") };
  }

  // --- AUTH ---
  if (path === "/auth/me") {
    return { user: DEFAULT_USER };
  }

  if (path === "/auth/login" || path === "/auth/signup") {
    const user = {
      ...DEFAULT_USER,
      name: body.name || body.email?.split("@")[0] || "Hamza Reseller",
      email: body.email || "demo@resello.pk",
    };
    return { token: "demo-jwt-token-resello", user };
  }

  if (path === "/auth/logout") {
    return { message: "Logged out" };
  }

  // Fallback for unhandled paths
  console.warn("Mock handler unhandled path:", path);
  return { success: true };
}
