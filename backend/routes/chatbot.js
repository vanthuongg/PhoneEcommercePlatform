const express = require('express');
const router = express.Router();
const { processMessage } = require('../controllers/chatbotController');

// Public - no auth required
router.post('/message', processMessage);

module.exports = router;
