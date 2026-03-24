const Lead = require('../models/Lead');
const { sendSms } = require('../services/twilioService');
const logger = require('../utils/logger');

/**
 * POST /api/send-sms
 * Sends an outbound SMS and persists/updates the lead record.
 */
async function handleSendSms(req, res, next) {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and message are required.',
      });
    }

    // Upsert lead — create if new, update timestamps if existing
    const lead = await Lead.findOneAndUpdate(
      { phoneNumber },
      {
        lastMessage: message,
        lastMessageAt: new Date(),
        $setOnInsert: { status: 'cold' },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send SMS via Twilio
    const twilioMessage = await sendSms(phoneNumber, message);

    logger.info('Outbound SMS processed', {
      phoneNumber,
      leadId: lead._id,
      smsSid: twilioMessage.sid,
    });

    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully.',
      data: {
        leadId: lead._id,
        phoneNumber: lead.phoneNumber,
        smsSid: twilioMessage.sid,
        sentAt: lead.lastMessageAt,
      },
    });
  } catch (error) {
    logger.error('Failed to send SMS', { error: error.message });
    next(error);
  }
}

/**
 * POST /api/webhook/sms
 * Twilio webhook — called when a user replies to an SMS.
 */
async function handleIncomingSms(req, res, next) {
  try {
    const { From: phoneNumber, Body: messageBody } = req.body;

    if (!phoneNumber || !messageBody) {
      logger.warn('Webhook received with missing fields', { body: req.body });
      // Always respond 200 to Twilio to prevent retries
      return res.status(200).send();
    }

    // Find or create the lead
    const lead = await Lead.findOneAndUpdate(
      { phoneNumber },
      {
        lastMessage: messageBody,
        lastMessageAt: new Date(),
        status: 'engaged',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info('Inbound SMS received', {
      from: phoneNumber,
      body: messageBody,
      leadId: lead._id,
    });

    // Respond 200 with empty TwiML body — no reply message needed yet
    res.set('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  } catch (error) {
    logger.error('Failed to process inbound SMS', { error: error.message });
    next(error);
  }
}

module.exports = { handleSendSms, handleIncomingSms };
