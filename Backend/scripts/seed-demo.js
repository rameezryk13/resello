// Creates three demo resellers, one per wallet state, so the commission /
// penalty / withdrawal / deactivation flow can be walked end to end without
// placing orders by hand.
//
//   npm run seed:demo
//
// Idempotent: it deletes any existing account with one of the three demo emails
// (and that account's sessions and data) before recreating it, so running it
// twice leaves the same three accounts rather than a pile of duplicates. Real
// accounts already in db.json are never touched.

const { hashPassword } = require('../src/lib/password');
const { getDb, saveDb, userBucket, DB_PATH } = require('../src/lib/store');
const { summarizeOrder } = require('../src/lib/orders');
const { settleOrder, recomputeBalance, walletSummary } = require('../src/lib/wallet');
const { seedAddressesFor } = require('../defaultPagesData/addresses');
const { products } = require('../defaultPagesData/products');

const PASSWORD = 'Demo@1234';
const SHIPPING_CHARGE = 5.99;
const COD_TAX_RATE = 0.04;

// Orders are dated backwards from a fixed point rather than from "now", so the
// dashboard's this-month figures don't change depending on when you seed.
const DAY_MS = 24 * 60 * 60 * 1000;

const round2 = (value) => Math.round(value * 100) / 100;

const parsePrice = (value) => {
  const match = String(value || '').replace(/,/g, '').match(/-?[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : 0;
};

// Every demo order carries an explicit per-line `profit`, which is what a real
// reseller sets when they add an item to their cart. computeItemProfit prefers
// it over the price gap, so the commissions below are exact — which is what
// makes each account land reliably in its intended state.
function cartItem(productIndex, quantity, profit) {
  const product = products[productIndex % products.length];

  return {
    itemId: `${product.productId}||${product.colors?.[0]?.name || ''}|${profit}`,
    product,
    quantity,
    selectedSize: product.sizes?.[0] || '',
    selectedColor: product.colors?.[0]?.name || '',
    profit,
  };
}

// Mirrors what POST /orders writes, so a seeded order is indistinguishable from
// a placed one — same fields, same id format, same shop grouping (one shop per
// order, since each spec entry names a single product).
function buildOrder({ userId, address, spec, index }) {
  const placedAt = Date.parse('2026-08-01T10:00:00.000Z') - spec.daysAgo * DAY_MS;
  const items = spec.items.map(([productIndex, quantity, profit]) =>
    cartItem(productIndex, quantity, profit)
  );

  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0
  );
  const profitTotal = items.reduce((sum, item) => sum + item.profit, 0);
  const paymentType = spec.paymentType || 'cod';
  const tax = paymentType === 'cod' ? (subtotal + profitTotal) * COD_TAX_RATE : 0;

  return {
    orderId: `order-${placedAt}-1`,
    checkoutId: `checkout-${placedAt}`,
    supplierIndex: 1,
    supplierCount: 1,
    shopId: items[0].product.shopId,
    shopName: items[0].product.shopName,
    address,
    cart: items,
    totalAmount: round2(subtotal + profitTotal + tax + SHIPPING_CHARGE),
    shippingCharge: SHIPPING_CHARGE,
    paymentType,
    status: spec.status,
    // `deliveredFirst` orders are settled as Delivered before being flipped, so
    // the ledger shows the commission being paid and then reversed — the shape
    // a genuine post-delivery return leaves behind.
    createdAt: new Date(placedAt).toISOString(),
    _deliveredFirst: Boolean(spec.deliveredFirst),
    _index: index,
  };
}

const DEMO_ACCOUNTS = [
  {
    email: 'healthy@resello.pk',
    name: 'Hina Healthy',
    phone: '0300 1111111',
    // Money in the wallet, more on the way, nothing owed. The account a
    // withdrawal is demonstrated from.
    label: 'Positive balance · commissions cleared and pending',
    expect: (balance) => balance > 0,
    orders: [
      { status: 'Delivered', daysAgo: 26, items: [[0, 1, 250]] },
      { status: 'Delivered', daysAgo: 19, items: [[1, 2, 300]] },
      { status: 'Delivered', daysAgo: 12, items: [[4, 1, 180]] },
      { status: 'Delivered', daysAgo: 6, items: [[7, 1, 220]], paymentType: 'advance' },
      { status: 'Under Verification', daysAgo: 3, items: [[9, 1, 120]] },
      { status: 'In-progress', daysAgo: 2, items: [[12, 1, 150]] },
      { status: 'In-progress', daysAgo: 1, items: [[15, 2, 200]] },
    ],
  },
  {
    email: 'negative@resello.pk',
    name: 'Nadia Negative',
    phone: '0300 2222222',
    // In minus but still trading: two returns have cost more than the one
    // cleared sale earned. Balance lands at Rs. -100.
    label: 'Negative balance · penalties applied, account still active',
    expect: (balance) => balance < 0 && balance > -500,
    orders: [
      { status: 'Delivered', daysAgo: 21, items: [[2, 1, 100]] },
      { status: 'Returned', daysAgo: 14, items: [[5, 1, 90]], deliveredFirst: true },
      { status: 'Returned', daysAgo: 8, items: [[8, 1, 130]] },
      { status: 'In-progress', daysAgo: 2, items: [[11, 1, 180]] },
    ],
  },
  {
    email: 'blocked@resello.pk',
    name: 'Bilal Blocked',
    phone: '0300 3333333',
    // Six returns against one cleared sale: Rs. -520, past the -500 line, so
    // checkout and withdrawal are both refused.
    label: 'Deactivated · balance past the Rs. -500 threshold',
    expect: (balance) => balance <= -500,
    orders: [
      { status: 'Delivered', daysAgo: 30, items: [[3, 1, 80]] },
      { status: 'Returned', daysAgo: 25, items: [[6, 1, 60]], deliveredFirst: true },
      { status: 'Returned', daysAgo: 22, items: [[10, 1, 75]] },
      { status: 'Returned', daysAgo: 18, items: [[13, 1, 110]] },
      { status: 'Returned', daysAgo: 15, items: [[16, 2, 95]] },
      { status: 'Returned', daysAgo: 9, items: [[19, 1, 140]] },
      { status: 'Returned', daysAgo: 4, items: [[22, 1, 65]] },
      { status: 'In-progress', daysAgo: 1, items: [[25, 1, 210]] },
    ],
  },
];

// Removes a demo account and everything hanging off it, so a re-run replaces
// rather than accumulates. Only ever called with the three emails above.
function removeExisting(db, email) {
  const existing = db.users.filter((user) => user.email === email);
  if (!existing.length) return;

  for (const user of existing) {
    delete db.userData[user.id];
    for (const [token, session] of Object.entries(db.sessions)) {
      if (session.userId === user.id) delete db.sessions[token];
    }
  }

  db.users = db.users.filter((user) => user.email !== email);
}

async function seed() {
  const db = getDb();
  const results = [];

  for (const account of DEMO_ACCOUNTS) {
    removeExisting(db, account.email);

    // Deterministic ids so the demo data is stable across re-seeds, and
    // prefixed so they can't collide with the `u_<timestamp>_<n>` ids signup
    // hands out.
    const userId = `u_demo_${account.email.split('@')[0]}`;

    db.users.push({
      id: userId,
      name: account.name,
      email: account.email,
      phone: account.phone,
      passwordHash: await hashPassword(PASSWORD),
      createdAt: new Date('2026-07-01T09:00:00.000Z').toISOString(),
    });

    const bucket = userBucket(userId);
    bucket.addresses = seedAddressesFor(userId);
    bucket.cart = [];
    bucket.wallet = { balance: 0, transactions: [] };

    const address = bucket.addresses[0];
    bucket.orders = account.orders.map((spec, index) =>
      buildOrder({ userId, address, spec, index })
    );

    // The ledger is generated by running the app's own settlement rules over
    // the orders rather than by writing balances by hand — a hand-written
    // ledger could disagree with what the running app would produce.
    for (const order of bucket.orders) {
      const summary = summarizeOrder(order);

      if (order._deliveredFirst) {
        settleOrder(bucket, { ...order, status: 'Delivered' }, summary.profit);
      }

      settleOrder(bucket, order, summary.profit);

      delete order._deliveredFirst;
      delete order._index;
    }

    // settleOrder stamps each row with the moment it ran, which is right in
    // service and wrong in a fixture: it would date months of backdated trading
    // to the minute the seed was run, so the ledger reads as one big burst of
    // activity today. Re-dating from the order each row belongs to is a
    // presentation fix only — it never touches amounts, so the balance the
    // rules just produced still stands.
    const orderDates = new Map(bucket.orders.map((order) => [order.orderId, order.createdAt]));
    for (const entry of bucket.wallet.transactions) {
      const placedAt = orderDates.get(entry.orderId);
      if (placedAt) entry.createdAt = placedAt;
    }
    bucket.wallet.transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const balance = recomputeBalance(bucket);
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));

    if (!account.expect(balance)) {
      throw new Error(
        `${account.email} seeded to Rs. ${balance}, which is not the state it is meant to demonstrate (${account.label}). Adjust its orders.`
      );
    }

    results.push({ ...account, balance, summary });
  }

  saveDb();
  // saveDb is debounced, so the process has to stay alive long enough for the
  // write to land. Nothing else is pending, so a short wait is enough.
  await new Promise((resolve) => setTimeout(resolve, 250));

  console.log(`\nSeeded 3 demo accounts into ${DB_PATH}`);
  console.log(`Password for all three: ${PASSWORD}\n`);

  for (const result of results) {
    const { summary } = result;
    console.log(`  ${result.email}`);
    console.log(`    ${result.label}`);
    console.log(
      `    balance Rs. ${summary.balance} · pending Rs. ${summary.pendingCommission} · ` +
        `cleared Rs. ${summary.clearedCommission} · penalties Rs. ${summary.penaltyTotal} ` +
        `(${summary.penalties.length}) · ${summary.deactivated ? 'DEACTIVATED' : 'active'}`
    );
  }

  console.log('');
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
});
