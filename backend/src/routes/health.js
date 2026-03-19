const express = require('express');
const router = express.Router();

const START_TIME = Date.now();

/**
 * GET /healthz
 * Returns application health status, uptime in seconds, and version.
 */
router.get('/healthz', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const version = process.env.APP_VERSION || 'unknown';

  return res.status(200).json({
    status: 'ok',
    uptime: uptimeSeconds,
    version,
  });
});

module.exports = router;
module.exports.START_TIME = START_TIME;
