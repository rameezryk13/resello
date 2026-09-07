const crypto = require('crypto');

// Password hashing on Node's built-in crypto — no external dependency.
//
// scrypt is deliberately slow and memory-hard, which is the point: it makes a
// stolen db.json expensive to brute-force. The cost parameter is stored inside
// the hash string so raising it later doesn't invalidate existing passwords.

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const COST = 16384; // scrypt N

const scrypt = (password, salt, cost) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: cost }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

// Format: scrypt$<N>$<salt-hex>$<hash-hex>
async function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = await scrypt(String(plain), salt, COST);
  return `scrypt$${COST}$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(plain, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;

  const [, costRaw, salt, expectedHex] = parts;
  const cost = Number(costRaw);
  if (!Number.isInteger(cost) || cost <= 0) return false;

  let derivedKey;
  try {
    derivedKey = await scrypt(String(plain), salt, cost);
  } catch {
    return false;
  }

  const expected = Buffer.from(expectedHex, 'hex');

  // timingSafeEqual throws on a length mismatch, so that has to be checked
  // first — and checking it is safe, since the length isn't a secret.
  if (expected.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(expected, derivedKey);
}

const newToken = () => crypto.randomBytes(32).toString('hex');

module.exports = { hashPassword, verifyPassword, newToken };
