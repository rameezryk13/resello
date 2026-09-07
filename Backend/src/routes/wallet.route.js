const express = require('express');
const { userBucket, saveDb } = require('../lib/store');
const { requireAuth } = require('../middleware/auth');
const { summarizeOrder } = require('../lib/orders');
const {
  DEACTIVATED_MESSAGE,
  WITHDRAW_WEEKDAY_NAME,
  isDeactivated,
  recomputeBalance,
  setSimulatedDate,
  createWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  walletSummary,
} = require('../lib/wallet');

const router = express.Router();

router.get('/wallet', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
  saveDb();

  res.json({ wallet: summary });
});

router.post('/wallet/demo-date', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  try {
    setSimulatedDate(bucket, req.body?.date);
    saveDb();
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
    res.json({ wallet: summary, message: req.body?.date ? `Demo date set to ${req.body.date}` : 'Demo date reset to today.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid date provided.' });
  }
});

router.post('/wallet/withdraw-request', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  try {
    const request = createWithdrawalRequest(bucket, req.body?.amount);
    saveDb();
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
    res.json({ wallet: summary, request });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not submit withdrawal request.' });
  }
});

router.post('/wallet/withdraw-request/:id/approve', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  try {
    const request = approveWithdrawalRequest(bucket, req.params.id);
    saveDb();
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
    res.json({ wallet: summary, request });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not approve withdrawal request.' });
  }
});

router.post('/wallet/withdraw-request/:id/reject', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  try {
    const request = rejectWithdrawalRequest(bucket, req.params.id);
    saveDb();
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
    res.json({ wallet: summary, request });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not reject withdrawal request.' });
  }
});

router.post('/wallet/withdraw', requireAuth, (req, res) => {
  const bucket = userBucket(req.user.id);
  try {
    const request = createWithdrawalRequest(bucket, req.body?.amount);
    saveDb();
    const summary = walletSummary(bucket, bucket.orders.map(summarizeOrder));
    res.json({ wallet: summary, request });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not process withdrawal.' });
  }
});

module.exports = router;
