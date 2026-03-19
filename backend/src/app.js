const express = require('express');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());

app.use('/', healthRouter);
app.use('/api/auth', authRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
