const express = require('express');
const cors = require('cors');
const homePageProducts = require('./routes/homePage.route');
const authRoutes = require('./routes/auth.route');
const walletRoutes = require('./routes/wallet.route');
const supportRoutes = require('./routes/support.route');

const app = express();

// Enable CORS for frontend (local and deployed on GitHub Pages / Vercel)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
// Auth first: it owns /api/auth/*, and homePageProducts has no route that could
// shadow those paths, so the order is for readability rather than correctness.
app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', supportRoutes);
app.use('/api', homePageProducts);

// Global JSON error handler ensures unexpected server errors return JSON instead of raw HTML
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    message: err.message || 'Internal server error occurred. Please try again.',
  });
});

module.exports = app;