const express = require('express');
const router = express.Router();
const { processMessage } = require('./chatbot.controller');

router.post('/message', processMessage);

module.exports = router;
