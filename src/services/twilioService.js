const twilio = require('twilio');
const logger = require('../utils/logger');

const MAX_SMS_LENGTH = 160;

// Lazy-initialized — client is only created when sendSms() is first called.
// This allows the server to start cleanly even before Twilio credentials are set.
let client = null;
function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

/**
 * Send an outbound SMS via Twilio.
 * @param {string} to   - Recipient phone number in E.164 format (+1234567890)
 * @param {string} body - Message text (max 160 chars)
 * @returns {object}    - Twilio message object
 */
async function sendSms(to, body) {
  if (!to || !body) {
    throw new Error('Recipient phone number and message body are required.');
  }

  if (body.length > MAX_SMS_LENGTH) {
    throw new Error(
      `Message exceeds maximum length of ${MAX_SMS_LENGTH} characters. Current length: ${body.length}.`
    );
  }

  const message = await getClient().messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body,
  });

  logger.info('SMS sent successfully', { to, sid: message.sid });
  return message;
}

module.exports = { sendSms };
