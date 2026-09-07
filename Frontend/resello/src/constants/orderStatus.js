// The statuses an order moves through, and how each one is presented.
//
// These lived in three copies — OrdersPage, TrackOrderPage and
// ProfitSummaryPage each had their own list, and two of them also had their own
// hash-of-the-orderId derivation. The status is now stored on the order by the
// backend, so all that is left to share is the vocabulary and its presentation.
// The list must stay in step with Backend/src/lib/orderStatus.js.

export const ORDER_STATUSES = [
  "In-progress",
  "Under Verification",
  "Verification Failed",
  "Delivered",
  "Returned",
  "Cancelled",
];

// A commission is only money once the order is delivered.
export const CLEARED_STATUS = "Delivered";

// The status that costs the reseller a penalty.
export const PENALTY_STATUS = "Returned";

// Neither is going to pay out, so neither counts as pending commission.
export const DEAD_STATUSES = ["Returned", "Cancelled", "Verification Failed"];

// How far along Track Order's 5-step rail each status sits.
export const STATUS_PROGRESS = {
  "In-progress": 2,
  "Under Verification": 2,
  "Verification Failed": 1,
  Delivered: 5,
  Returned: 4,
  Cancelled: 1,
};

// Drives the badge colour. The values are CSS class suffixes, not colours, so
// the palette stays in the stylesheets.
export const STATUS_TONE = {
  "In-progress": "warning",
  "Under Verification": "info",
  "Verification Failed": "danger",
  Delivered: "success",
  Returned: "return",
  Cancelled: "danger",
};

// Whether an order still owes the reseller a commission.
export const isPendingStatus = (status) =>
  status !== CLEARED_STATUS && !DEAD_STATUSES.includes(status);
