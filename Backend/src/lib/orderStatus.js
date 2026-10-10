// The set of statuses an order can be in, and the fallback for orders that
// predate the status field.
//
// Statuses used to exist only in the frontend, derived from a hash of the
// orderId in three separate files. That made them stable across a refresh but
// impossible to change — and a return penalty needs an order that can actually
// become "Returned". Orders now carry a real status; this module is what the
// routes and the seed script agree on.

const ORDER_STATUSES = [
  'Under Verification',
  'Verification Failed',
  'In-progress',
  'In Transit',
  'Delivered',
  'Returned',
  'Cancelled',
];

const DEFAULT_ORDER_STATUS = 'Under Verification';

const LEGACY_STATUS_MAP = {
  'In Progress': 'In-progress',
  'inprogress': 'In-progress',
  'intransit': 'In Transit',
  'Return': 'Returned',
};

// The old frontend derivation, kept for orders already sitting in db.json with
// no status of their own. Without it every historic order would snap to
// "Under Verification" on first read, which reads as data loss to anyone who had the
// app open before this change.
function hashStatus(orderId) {
  const source = String(orderId || '');
  let total = 0;

  for (let index = 0; index < source.length; index += 1) {
    total += source.charCodeAt(index);
  }

  return ORDER_STATUSES[total % ORDER_STATUSES.length];
}

const isValidStatus = (status) =>
  ORDER_STATUSES.includes(status) || Boolean(LEGACY_STATUS_MAP[status]);

// Every read of an order's status goes through here, so a stored status always
// wins and an unstored one stays what it has always looked like.
const resolveStatus = (order) => {
  const current = order?.status;
  if (ORDER_STATUSES.includes(current)) return current;
  if (LEGACY_STATUS_MAP[current]) return LEGACY_STATUS_MAP[current];
  return hashStatus(order?.orderId);
};

module.exports = {
  ORDER_STATUSES,
  DEFAULT_ORDER_STATUS,
  hashStatus,
  isValidStatus,
  resolveStatus,
};
