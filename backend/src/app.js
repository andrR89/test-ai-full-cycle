const express = require('express');
const healthRouter = require('./routes/health');

const app = express();

app.use(express.json());

// Mount health-check route
app.use('/', healthRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
