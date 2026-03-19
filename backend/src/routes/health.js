const express = require('express');
const router = express.Router();

const SERVER_START_TIME = Date.now();

/**
 * GET /healthz
 * Returns server health status, uptime, and version.
 */
router.get('/healthz', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
  const version = process.env.APP_VERSION || 'unknown';

  return res.status(200).json({
    status: 'ok',
    uptime: uptimeSeconds,
    version: version,
  });
});

module.exports = router;
module.exports.SERVER_START_TIME = SERVER_START_TIME;
