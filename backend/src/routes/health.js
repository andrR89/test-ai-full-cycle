'use strict';

const express = require('express');
const router = express.Router();

const START_TIME = Date.now();

/**
 * GET /healthz
 * Returns service health information including status, uptime, and version.
 */
router.get('/', (req, res) => {
  try {
    const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
    const version = process.env.APP_VERSION || 'unknown';

    return res.status(200).json({
      status: 'ok',
      uptime: uptimeSeconds,
      version,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
});

module.exports = router;
module.exports.START_TIME = START_TIME;
