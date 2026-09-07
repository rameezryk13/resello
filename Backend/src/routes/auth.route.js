const express = require('express');
const { hashPassword, verifyPassword, newToken } = require('../lib/password');
const {
  getDb,
  saveDb,
  userBucket,
  findUserByEmail,
  publicUser,
} = require('../lib/store');
const { seedAddressesFor } = require('../../defaultPagesData/addresses');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;

// Deliberately permissive: the point is to catch a typo like "ayesha@gmail",
// not to adjudicate RFC 5322. Anything stricter rejects real addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// Starts a session and hands back what the client needs to be logged in.
function startSession(user) {
  const db = getDb();
  const token = newToken();
  db.sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };
  saveDb();
  return { user: publicUser(user), token };
}

router.post('/auth/signup', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = normalizeEmail(req.body?.email);
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '');

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Name, email, phone number and password are required.' });
  }

  const cleanPhone = phone.replace(/[\s()-]/g, '');
  if (!/^(?:\+92|0092|0)3\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({ message: 'Use a valid Pakistani mobile number, like 0300 1234567.' });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ message: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.` });
  }

  if (findUserByEmail(email)) {
    // 409, not 400: the request is well-formed, it conflicts with what exists.
    return res
      .status(409)
      .json({ message: 'That email is already registered. Sign in instead.' });
  }

  const db = getDb();
  const user = {
    id: `u_${Date.now()}_${db.users.length + 1}`,
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  userBucket(user.id).addresses = seedAddressesFor(user.id);
  saveDb();

  res.status(201).json(startSession(user));
});

router.post('/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Enter your email and password.' });
  }

  const user = findUserByEmail(email);

  // One message for both "no such account" and "wrong password", so this can't
  // be used to enumerate which emails are registered.
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  res.json(startSession(user));
});

// Revoking the session server-side is the reason this app uses opaque tokens
// rather than JWTs: a signed-out token stops working immediately.
router.post('/auth/logout', requireAuth, (req, res) => {
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  delete getDb().sessions[token];
  saveDb();
  res.status(204).end();
});

// How the client confirms a token restored from localStorage is still good.
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Updates reseller profile fields. Name and phone cannot be changed.
// Shop Name and City Name can only be set ONCE if currently empty, and cannot be changed further.
router.put('/auth/me', requireAuth, (req, res) => {
  const user = req.user;
  const newShopName = String(req.body?.shopName || '').trim();
  const newCity = String(req.body?.city || '').trim();
  const bankInfo = req.body?.bankInfo;

  let updated = false;

  // Shop Name locking rule
  if (user.shopName && String(user.shopName).trim().length > 0) {
    if (newShopName && newShopName !== user.shopName) {
      return res.status(400).json({ message: 'Shop Name is locked and cannot be changed once set.' });
    }
  } else if (newShopName) {
    user.shopName = newShopName;
    updated = true;
  }

  // City Name locking rule
  if (user.city && String(user.city).trim().length > 0) {
    if (newCity && newCity !== user.city) {
      return res.status(400).json({ message: 'City Name is locked and cannot be changed once set.' });
    }
  } else if (newCity) {
    user.city = newCity;
    updated = true;
  }

  // Bank Info update or deletion rule
  if (bankInfo === null || req.body.deleteBank === true) {
    user.bankInfo = null;
    updated = true;
  } else if (bankInfo && typeof bankInfo === 'object') {
    if (user.bankInfo && user.bankInfo.accountTitle && String(user.bankInfo.accountTitle).trim().length > 0) {
      return res.status(400).json({ message: 'Bank Holder Name and Account details are locked and cannot be changed once set.' });
    }
    const newAccountTitle = String(bankInfo.accountTitle || '').trim();
    const newAccountNumber = String(bankInfo.accountNumber || '').trim();
    const newBankName = String(bankInfo.bankName || '').trim();

    if (!newAccountTitle) {
      return res.status(400).json({ message: 'Bank Holder Name is required.' });
    }

    user.bankInfo = {
      bankName: newBankName || 'Bank Account',
      accountTitle: newAccountTitle,
      accountNumber: newAccountNumber,
      updatedAt: new Date().toISOString(),
    };
    updated = true;
  }

  if (updated) {
    saveDb();
  }

  res.json({ user: publicUser(user), message: 'Profile updated successfully.' });
});

// Deletes user bank info
router.delete('/auth/me/bank', requireAuth, (req, res) => {
  const user = req.user;
  user.bankInfo = null;
  saveDb();
  res.json({ user: publicUser(user), message: 'Bank info deleted successfully.' });
});

module.exports = router;
