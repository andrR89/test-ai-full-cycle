const express = require('express');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');

const app = express();
app.use(express.json());

app.use('/', healthRouter);
app.use('/api/auth', authRouter);

module.exports = app;
