const { resolveStatus } = require('./orderStatus');

// The reseller wallet: what has cleared, what is still pending, what has been
// clawed back, and whether the account is still allowed to trade.
//
// Every rule lives here rather than in a route, because three of them are
// mutually dependent — a return debits the wallet, the wallet balance decides
// deactivation, and deactivation blocks the withdrawal the balance would fund.
// Spreading that across route handlers is how the numbers start disagreeing.

// A returned order costs the reseller this much, on top of losing the sale.
const RETURN_PENALTY = 100;

// At or below this balance the account stops trading until support clears it.
const DEACTIVATION_THRESHOLD = -500;

// Receiving 5 penalties disables the account from placing orders.
const MAX_PENALTIES_THRESHOLD = 5;

// Date#getDay(): 0 is Sunday, so 1 is Monday. Withdrawals open one day a week.
const WITHDRAW_WEEKDAY = 1;
const WITHDRAW_WEEKDAY_NAME = 'Monday';

const SUPPORT_EMAIL = 'support@resello.pk';
const SUPPORT_PHONE = '0300 1234567';

// Written once here so the banner, the 403 body and the seed script can't
// drift into three different explanations of the same state.
const DEACTIVATED_MESSAGE =
  `Your account is deactivated because you have received ${MAX_PENALTIES_THRESHOLD} penalties ` +
  `or your wallet balance is Rs. ${Math.abs(DEACTIVATION_THRESHOLD)} or more in minus. ` +
  `Clear the balance or contact admin at ${SUPPORT_EMAIL}.`;

// A commission is money the reseller has earned but not yet been given. It
// clears the moment the order is delivered; a return takes it back.
const CLEARING_STATUS = 'Delivered';
const PENALTY_STATUS = 'Returned';

// Statuses where no commission is ever coming, so they don't count as pending.
const DEAD_STATUSES = ['Returned', 'Cancelled'];

const round2 = (value) => Math.round(value * 100) / 100;

const toAmount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? round2(number) : 0;
};

// Buckets written before wallets existed have no wallet key, and a hand-edited
// db.json can have one of the wrong shape. Normalising on every read means no
// caller has to defend against either.
function ensureWallet(bucket) {
  if (!bucket.wallet || typeof bucket.wallet !== 'object') {
    bucket.wallet = { balance: 0, transactions: [], withdrawalRequests: [], simulatedDate: null };
  }

  if (!Array.isArray(bucket.wallet.transactions)) {
    bucket.wallet.transactions = [];
  }

  if (!Array.isArray(bucket.wallet.withdrawalRequests)) {
    bucket.wallet.withdrawalRequests = [];
  }

  if (!Number.isFinite(Number(bucket.wallet.balance))) {
    bucket.wallet.balance = 0;
  }

  return bucket.wallet;
}

function recomputeBalance(bucket) {
  const wallet = ensureWallet(bucket);

  wallet.balance = round2(
    wallet.transactions.reduce(
      (sum, entry) =>
        entry.direction === 'out' ? sum - toAmount(entry.amount) : sum + toAmount(entry.amount),
      0
    )
  );

  return wallet.balance;
}

function addTransaction(bucket, { type, direction, amount, orderId = null, title }) {
  const wallet = ensureWallet(bucket);
  const value = toAmount(amount);

  if (value <= 0) return null;

  const entry = {
    id: `txn_${Date.now()}_${wallet.transactions.length + 1}`,
    type,
    direction,
    amount: value,
    orderId,
    title,
    createdAt: new Date().toISOString(),
  };

  wallet.transactions.push(entry);
  recomputeBalance(bucket);

  return entry;
}

const COMMISSION_ROWS = { commission: 1, 'commission-reversal': -1 };
const PENALTY_ROWS = { penalty: 1, 'penalty-reversal': -1 };
const SHIPPING_RETURN_ROWS = { 'shipping-return': 1, 'shipping-return-reversal': -1 };

function netFor(bucket, orderId, rows) {
  return round2(
    ensureWallet(bucket)
      .transactions.filter((entry) => entry.orderId === orderId && rows[entry.type])
      .reduce((sum, entry) => sum + rows[entry.type] * entry.amount, 0)
  );
}

function settleOrder(bucket, order, profit) {
  ensureWallet(bucket);

  const orderId = order?.orderId;
  if (!orderId) return;

  const status = resolveStatus(order);

  // Shipping & return applies when reseller applied for return (broken / wrong / defect issue)
  const isShippingReturn = Boolean(order?.returnRequest);
  const isAcceptedReturn = Boolean(order?.returnRequest?.status === 'Accepted');

  // When order is Delivered OR under Shipping & Return (or an accepted return):
  // Reseller retains their commission! Commission is NEVER reversed for accepted returns in shipping and return!
  const retainsCommission = status === CLEARING_STATUS || isShippingReturn || isAcceptedReturn;
  const wantedCommission = retainsCommission ? toAmount(profit) : 0;

  // Penalty applies only when order is returned to vendor by courier without reseller defect return request
  const isReturnToVendor = status === PENALTY_STATUS && !isShippingReturn;
  const wantedPenalty = isReturnToVendor ? RETURN_PENALTY : 0;

  const paymentWithoutCommission = isShippingReturn
    ? Math.max(0, round2((Number(order?.totalAmount) || 0) - toAmount(profit)))
    : 0;

  // Clean up any commission-reversal transactions for accepted shipping & return orders so reseller gets their commission back
  if (isShippingReturn || isAcceptedReturn) {
    const wallet = ensureWallet(bucket);
    const beforeCount = wallet.transactions.length;
    wallet.transactions = wallet.transactions.filter(
      (entry) => !(entry.orderId === orderId && entry.type === 'commission-reversal')
    );
    if (wallet.transactions.length !== beforeCount) {
      recomputeBalance(bucket);
    }
  }

  const heldCommission = netFor(bucket, orderId, COMMISSION_ROWS);
  const heldPenalty = netFor(bucket, orderId, PENALTY_ROWS);
  const heldShippingReturn = netFor(bucket, orderId, SHIPPING_RETURN_ROWS);

  if (wantedCommission > heldCommission) {
    addTransaction(bucket, {
      type: 'commission',
      direction: 'in',
      amount: wantedCommission - heldCommission,
      orderId,
      title: 'Commission cleared',
    });
  } else if (wantedCommission < heldCommission && !isShippingReturn && !isAcceptedReturn) {
    addTransaction(bucket, {
      type: 'commission-reversal',
      direction: 'out',
      amount: heldCommission - wantedCommission,
      orderId,
      title: 'Commission reversed',
    });
  }

  if (wantedPenalty > heldPenalty) {
    addTransaction(bucket, {
      type: 'penalty',
      direction: 'out',
      amount: wantedPenalty - heldPenalty,
      orderId,
      title: 'Return to vendor penalty',
    });
  } else if (wantedPenalty < heldPenalty) {
    addTransaction(bucket, {
      type: 'penalty-reversal',
      direction: 'in',
      amount: heldPenalty - wantedPenalty,
      orderId,
      title: 'Return penalty refunded',
    });
  }

  if (paymentWithoutCommission > heldShippingReturn) {
    const reason = order?.returnRequest?.reason ? ` (${order.returnRequest.reason})` : '';
    addTransaction(bucket, {
      type: 'shipping-return',
      direction: 'in',
      amount: paymentWithoutCommission - heldShippingReturn,
      orderId,
      title: `Shipping & return claim${reason}`,
    });
  } else if (paymentWithoutCommission < heldShippingReturn) {
    addTransaction(bucket, {
      type: 'shipping-return-reversal',
      direction: 'out',
      amount: heldShippingReturn - paymentWithoutCommission,
      orderId,
      title: 'Shipping & return claim reversed',
    });
  }
}

function getEffectiveDate(bucket) {
  const wallet = ensureWallet(bucket);
  if (wallet.simulatedDate) {
    const parsed = new Date(wallet.simulatedDate);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function setSimulatedDate(bucket, date) {
  const wallet = ensureWallet(bucket);
  if (!date) {
    wallet.simulatedDate = null;
  } else {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error('Invalid date provided.');
    }
    wallet.simulatedDate = parsed.toISOString();
  }
  return wallet.simulatedDate;
}

function getPenalties(bucket) {
  const wallet = ensureWallet(bucket);
  return [...new Set(wallet.transactions
    .filter((entry) => PENALTY_ROWS[entry.type])
    .map((entry) => entry.orderId))]
    .map((orderId) => {
      const charged = wallet.transactions.filter(
        (entry) => entry.orderId === orderId && entry.type === 'penalty'
      );
      const latest = charged[charged.length - 1];

      return {
        id: latest?.id || `penalty_${orderId}`,
        orderId,
        amount: netFor(bucket, orderId, PENALTY_ROWS),
        createdAt: latest?.createdAt || null,
      };
    })
    .filter((penalty) => penalty.amount > 0);
}

function getPenaltyCount(bucket) {
  const penalties = getPenalties(bucket);
  const returnedOrders = (bucket?.orders || []).filter(
    (order) => order.status === 'Returned'
  );
  return Math.max(penalties.length, returnedOrders.length);
}

function isDeactivated(bucket) {
  const balance = recomputeBalance(bucket);
  const penaltyCount = getPenaltyCount(bucket);
  return penaltyCount >= MAX_PENALTIES_THRESHOLD || balance <= DEACTIVATION_THRESHOLD;
}

function getDeactivatedMessage(bucket) {
  const balance = recomputeBalance(bucket);
  const penaltyCount = getPenaltyCount(bucket);
  if (penaltyCount >= MAX_PENALTIES_THRESHOLD) {
    return `Your account is disabled because you have received ${penaltyCount} return penalties. You cannot place orders. Please contact admin at ${SUPPORT_EMAIL}.`;
  }
  if (balance <= DEACTIVATION_THRESHOLD) {
    return `Your account is disabled because your wallet balance is Rs. ${Math.abs(DEACTIVATION_THRESHOLD)} or more in minus. Clear the balance or contact admin at ${SUPPORT_EMAIL}.`;
  }
  return `Your account is disabled. You cannot place orders. Please contact admin at ${SUPPORT_EMAIL}.`;
}

function canWithdrawToday(target = new Date()) {
  const date = target instanceof Date ? target : getEffectiveDate(target);
  return date.getDay() === WITHDRAW_WEEKDAY;
}

// The next date the window is open. Today counts when today is the day, so a
// reseller reading this on a Monday isn't told to come back in seven days.
function nextWithdrawalDate(target = new Date()) {
  const now = target instanceof Date ? target : getEffectiveDate(target);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAhead = (WITHDRAW_WEEKDAY - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + daysAhead);
  return next;
}

function createWithdrawalRequest(bucket, amount) {
  const wallet = ensureWallet(bucket);
  const balance = recomputeBalance(bucket);

  if (isDeactivated(bucket)) {
    throw new Error(getDeactivatedMessage(bucket));
  }

  if (balance <= 0) {
    throw new Error(
      `Your wallet balance is in negative or zero (Rs. ${balance}). You cannot request a withdrawal.`
    );
  }

  const effectiveDate = getEffectiveDate(bucket);
  if (!canWithdrawToday(effectiveDate)) {
    const nextWin = formatWindow(nextWithdrawalDate(effectiveDate));
    throw new Error(`Withdrawals are open on ${WITHDRAW_WEEKDAY_NAME}s only. The next window is ${nextWin}.`);
  }

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    throw new Error('Enter a valid amount greater than zero.');
  }

  if (numAmount > balance) {
    throw new Error(`You can withdraw up to Rs. ${balance}.`);
  }

  const request = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    amount: round2(numAmount),
    status: 'pending',
    createdAt: effectiveDate.toISOString(),
  };

  wallet.withdrawalRequests.push(request);
  return request;
}

function approveWithdrawalRequest(bucket, requestId) {
  const wallet = ensureWallet(bucket);
  const request = wallet.withdrawalRequests.find((req) => req.id === requestId);

  if (!request) {
    throw new Error('Withdrawal request not found.');
  }

  if (request.status !== 'pending') {
    throw new Error(`Request has already been ${request.status}.`);
  }

  const balance = recomputeBalance(bucket);
  if (balance < request.amount) {
    throw new Error(`Insufficient wallet balance (Rs. ${balance}) to approve withdrawal of Rs. ${request.amount}.`);
  }

  const effectiveDate = getEffectiveDate(bucket);
  request.status = 'approved';
  request.approvedAt = effectiveDate.toISOString();

  addTransaction(bucket, {
    type: 'withdrawal',
    direction: 'out',
    amount: request.amount,
    title: 'Withdrawal to bank account',
  });

  return request;
}

function rejectWithdrawalRequest(bucket, requestId) {
  const wallet = ensureWallet(bucket);
  const request = wallet.withdrawalRequests.find((req) => req.id === requestId);

  if (!request) {
    throw new Error('Withdrawal request not found.');
  }

  if (request.status !== 'pending') {
    throw new Error(`Request has already been ${request.status}.`);
  }

  const effectiveDate = getEffectiveDate(bucket);
  request.status = 'rejected';
  request.rejectedAt = effectiveDate.toISOString();

  return request;
}

const formatWindow = (date) =>
  date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

// Everything the wallet, dashboard and payment summary pages need, computed in
// one place so all three quote the same figures.
function walletSummary(bucket, orders = []) {
  const wallet = ensureWallet(bucket);
  const balance = recomputeBalance(bucket);
  const effectiveDate = getEffectiveDate(bucket);

  const pendingCommission = round2(
    orders
      .filter((order) => {
        const status = resolveStatus(order);
        return status !== CLEARING_STATUS && !DEAD_STATUSES.includes(status);
      })
      .reduce((sum, order) => sum + toAmount(order.profit), 0)
  );

  const penalties = getPenalties(bucket).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const sumOf = (type) =>
    round2(
      wallet.transactions
        .filter((entry) => entry.type === type)
        .reduce((sum, entry) => sum + entry.amount, 0)
    );

  const allowedToday = canWithdrawToday(effectiveDate);

  const penaltyTotal = round2(sumOf('penalty') - sumOf('penalty-reversal'));
  const shippingReturnFromTxns = round2(
    sumOf('shipping-return') - sumOf('shipping-return-reversal')
  );

  const ordersWithReturnRequest = orders.filter((order) => order.returnRequest);
  const fallbackShippingReturn = round2(
    ordersWithReturnRequest.reduce((sum, order) => {
      const withoutCommission = Math.max(
        0,
        (Number(order.totalAmount) || 0) - toAmount(order.profit)
      );
      return sum + withoutCommission;
    }, 0)
  );

  const effectiveShippingReturn =
    shippingReturnFromTxns > 0 ? shippingReturnFromTxns : fallbackShippingReturn;

  const deactivated = isDeactivated(bucket);
  const deactivationMessage = deactivated ? getDeactivatedMessage(bucket) : null;

  return {
    balance,
    clearedCommission: round2(sumOf('commission') - sumOf('commission-reversal')),
    pendingCommission,
    penaltyTotal,
    shippingReturnPayment: effectiveShippingReturn,
    shippingAndReturnTotal: effectiveShippingReturn,
    penalties,
    penaltyCount: getPenaltyCount(bucket),
    maxPenaltiesThreshold: MAX_PENALTIES_THRESHOLD,
    withdrawnTotal: sumOf('withdrawal'),
    transactions: wallet.transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    withdrawalRequests: wallet.withdrawalRequests
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    simulatedDate: wallet.simulatedDate || null,
    isSimulated: Boolean(wallet.simulatedDate),
    effectiveDate: effectiveDate.toISOString(),
    deactivated,
    deactivationThreshold: DEACTIVATION_THRESHOLD,
    deactivationMessage,
    returnPenalty: RETURN_PENALTY,
    support: { email: SUPPORT_EMAIL, phone: deactivated ? "" : SUPPORT_PHONE },
    withdrawal: {
      allowedToday,
      weekday: WITHDRAW_WEEKDAY_NAME,
      available: Math.max(0, balance),
      nextWindow: nextWithdrawalDate(effectiveDate).toISOString(),
    },
  };
}

module.exports = {
  RETURN_PENALTY,
  DEACTIVATION_THRESHOLD,
  MAX_PENALTIES_THRESHOLD,
  DEACTIVATED_MESSAGE,
  getDeactivatedMessage,
  getPenalties,
  getPenaltyCount,
  WITHDRAW_WEEKDAY,
  WITHDRAW_WEEKDAY_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  ensureWallet,
  recomputeBalance,
  addTransaction,
  settleOrder,
  isDeactivated,
  canWithdrawToday,
  nextWithdrawalDate,
  getEffectiveDate,
  setSimulatedDate,
  createWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  walletSummary,
};
