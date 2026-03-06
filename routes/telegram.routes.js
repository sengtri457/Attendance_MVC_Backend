const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');
router.post('/send', telegramController.sendMessage);

module.exports = router;
