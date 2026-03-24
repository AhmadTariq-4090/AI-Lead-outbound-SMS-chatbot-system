const express = require('express');
const router = express.Router();
const { handleSendSms, handleIncomingSms } = require('../controllers/smsController');

// Outbound SMS
router.post('/send-sms', handleSendSms);

// Twilio inbound webhook
router.post('/webhook/sms', handleIncomingSms);

module.exports = router;
