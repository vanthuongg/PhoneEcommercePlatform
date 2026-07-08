const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('./audit.controller');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin', 'manager'), getAuditLogs);

module.exports = router;
