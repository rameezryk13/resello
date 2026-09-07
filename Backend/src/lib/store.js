const fs = require('fs');
const path = require('path');
const { ensureWallet } = require('./wallet');

// The whole app's persistent state in one JSON file.
//
// There's no database in this project, and the alternative — the module-level
// arrays this file replaces — lost every cart and account on restart. A single
// file is enough at this scale and keeps the data readable during development.

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const emptyDb = () => ({ users: [], sessions: {}, userData: {} });

// Read once at startup and keep in memory: every request would otherwise pay a
// synchronous file read. Writes go through saveDb, so this stays authoritative.
let db = load();

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
      userData: parsed.userData && typeof parsed.userData === 'object' ? parsed.userData : {},
    };
  } catch {
    // Missing on first run, or hand-edited into something unparseable. Either
    // way an empty store is the only safe reading — never throw here, or the
    // server won't boot.
    return emptyDb();
  }
}

let writeTimer = null;

// Written temp-then-rename so a crash mid-write can't leave a truncated
// db.json behind: rename is atomic, so the file is either the old one or the
// complete new one. Debounced because a single checkout writes several times.
function flush() {
  writeTimer = null;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DB_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, DB_PATH);
  } catch (err) {
    console.error('Could not write db.json:', err.message);
  }
}

function saveDb() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(flush, 50);
}

const getDb = () => db;

// Each user's own cart/favourites/orders. Created on first access so signup
// doesn't have to know the shape, and so a user added by hand to db.json still
// works. Callers mutate what they get back, then call saveDb().
function userBucket(userId) {
  if (!db.userData[userId]) {
    db.userData[userId] = {
      cart: [],
      favorites: [],
      followedShops: [],
      addresses: [],
      orders: [],
    };
  }

  const bucket = db.userData[userId];
  // Backfills a key added after a user's bucket was first written.
  for (const key of ['cart', 'favorites', 'followedShops', 'addresses', 'orders', 'notifications', 'issues']) {
    if (!Array.isArray(bucket[key])) bucket[key] = [];
  }

  // The wallet is an object rather than an array, and it owns its own shape —
  // so it's normalised by the module that defines that shape, not re-described
  // here where the two could drift apart.
  ensureWallet(bucket);

  return bucket;
}

const findUserByEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  return db.users.find((user) => user.email === normalized);
};

const findUserById = (userId) => db.users.find((user) => user.id === userId);

// What the frontend is allowed to see. Every response that includes a user goes
// through here so a passwordHash can't leak by someone spreading the record.
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  shopName: user.shopName || '',
  city: user.city || '',
  bankInfo: user.bankInfo || null,
  createdAt: user.createdAt,
});

module.exports = {
  getDb,
  saveDb,
  userBucket,
  findUserByEmail,
  findUserById,
  publicUser,
  DB_PATH,
};
