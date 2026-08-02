// Every backend route the frontend talks to, in one place.
//
// Keeping the paths here means a backend rename is a one-line change, and it
// makes the app's full API surface reviewable at a glance. Mirrors
// Backend/src/routes/homePage.route.js.

const enc = encodeURIComponent;

export const endpoints = {
  home: {
    visualCategories: "/home/visualCategories",
    products: "/home/products",
    rows: "/home/rows",
  },

  products: {
    byId: (productId) => `/products/${enc(productId)}`,
    reviews: (productId) => `/products/${enc(productId)}/reviews`,
    search: (query) => `/products/search?q=${enc(query)}`,
    subcategories: "/products/subcategories",
    // MoreProducts builds its own query string from the filter panel, so it
    // needs the bare path; related() takes params it already has in hand.
    filterBase: "/products/filter",
    related: (params) => `/products/related?${new URLSearchParams(params)}`,
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
  profitSummary: "/profit-summary",

  cart: {
    root: "/cart",
    item: (itemId) => `/cart/${enc(itemId)}`,
  },
};

export default endpoints;
