const { resolveStatus } = require('./orderStatus');

// Turning a stored order into the shape pages read: item count, subtotal, the
// reseller's profit and a resolved status.
//
// This used to live inside homePage.route.js. It moved here when the wallet
// arrived, because a commission *is* an order's profit — so the wallet route
// needs the same derivation, and two copies of it would eventually pay out two
// different numbers for the same order.

const round2 = (value) => Math.round(value * 100) / 100;

// Prices are seeded as strings like "$299" / "1,250", so the number has to be
// pulled out of the text rather than cast.
function parsePrice(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, '');
  const match = cleaned.match(/-?[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : 0;
}

// A reseller's margin on a line: whatever they set explicitly, otherwise the
// gap between the listed price and the original.
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
    // Resolved rather than read straight off the record: orders placed before
    // statuses were stored have none, and resolveStatus keeps those showing
    // what they have always shown.
    status: resolveStatus(order),
    itemCount,
    subtotal,
    profit,
  };
}

module.exports = {
  round2,
  parsePrice,
  computeItemProfit,
  summarizeOrder,
};
