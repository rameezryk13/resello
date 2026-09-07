// Every backend route the frontend talks to, in one place.
//
// Keeping the paths here means a backend rename is a one-line change, and it
// makes the app's full API surface reviewable at a glance. Mirrors
// Backend/src/routes/homePage.route.js.

const enc = encodeURIComponent;

export const endpoints = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    meBank: "/auth/me/bank",
  },

  home: {
    visualCategories: "/home/visualCategories",
    products: "/home/products",
    rows: "/home/rows",
  },

  products: {
    byId: (productId) => `/products/${enc(productId)}`,
    reviews: (productId) => `/products/${enc(productId)}/reviews`,
    addReview: (productId) => `/products/${enc(productId)}/reviews`,
    search: (query) => `/products/search?q=${enc(query)}`,
    subcategories: "/products/subcategories",
    filterBase: "/products/filter",
    related: (params) => `/products/related?${new URLSearchParams(params)}`,
  },

  notifications: {
    root: "/notifications",
    markRead: "/notifications/mark-read",
  },

  shops: {
    root: "/shops",
    byId: (shopId) => `/shops/${enc(shopId)}`,
  },

  events: {
    byId: (eventId) => `/events/${enc(eventId)}`,
  },

  favorites: "/favorites",
  followedShops: "/followed-shops",
  addresses: "/addresses",
  orders: "/orders",
  // The demo status switcher on My Orders; stands in for a courier webhook.
  orderStatus: (orderId) => `/orders/${enc(orderId)}/status`,
  returnOrder: (orderId) => `/orders/${enc(orderId)}/return`,
  returnOrderStatus: (orderId) => `/orders/${enc(orderId)}/return-status`,
  profitSummary: "/profit-summary",

  wallet: {
    root: "/wallet",
    withdraw: "/wallet/withdraw",
    demoDate: "/wallet/demo-date",
    withdrawRequest: "/wallet/withdraw-request",
    approveRequest: (id) => `/wallet/withdraw-request/${enc(id)}/approve`,
    rejectRequest: (id) => `/wallet/withdraw-request/${enc(id)}/reject`,
  },

  cart: {
    root: "/cart",
    item: (itemId) => `/cart/${enc(itemId)}`,
  },

  support: {
    issues: "/support/issues",
    reply: (id) => `/support/issues/${enc(id)}/reply`,
    status: (id) => `/support/issues/${enc(id)}/status`,
  },
};

export default endpoints;
