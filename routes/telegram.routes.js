const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');

/**
 * POST /api/v1/telegram/send
 * Body: { text: string, parse_mode?: string }
 *
 * Protected by verifyToken (registered in app.js).
 */
router.post('/send', telegramController.sendMessage);

module.exports = router;
