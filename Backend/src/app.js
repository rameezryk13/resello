const express = require('express');
const cors = require('cors');
const homePageProducts = require('./routes/homePage.route');

const app = express();

// Enable CORS for your frontend origin
// allows all origins
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/api', homePageProducts);

module.exports = app;