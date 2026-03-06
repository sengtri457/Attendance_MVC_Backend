require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
exports.sendMessage = async (req, res) => {
    try {
        if (! BOT_TOKEN || ! CHAT_ID) {
            return res.status(500).json({success: false, message: 'Telegram credentials are not configured on the server.'});
        }

        const {
            text,
            parse_mode = 'Markdown'
        } = req.body;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({success: false, message: 'Request body must contain a non-empty "text" field.'});
        }

        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        const response = await axios.post(telegramApiUrl, {
            chat_id: CHAT_ID,
            text: text.trim(),
            parse_mode
        });

        return res.status(200).json({success: true, message: 'Telegram message sent successfully.', data: response.data});
    } catch (error) {
        console.error('[TelegramController] Error sending message:', error ?. response ?. data || error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to send Telegram message.',
            error: error ?. response ?. data || error.message
        });
    }
};
