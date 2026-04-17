// utils/whatsapp.js
const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Send WhatsApp message
const sendWhatsApp = async (to, message) => {
    try {
        // Format: whatsapp:+923001234567
        const formattedNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: formattedNumber,
            body: message
        });

        console.log(`✅ WhatsApp sent to ${to}: ${response.sid}`);
        return { success: true, sid: response.sid };

    } catch (error) {
        console.error('❌ WhatsApp error:', error);
        return { success: false, error: error.message };
    }
};

// Send WhatsApp with media (QR code)
const sendWhatsAppWithMedia = async (to, message, mediaUrl) => {
    try {
        const formattedNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: formattedNumber,
            body: message,
            mediaUrl: [mediaUrl]
        });

        console.log(`✅ WhatsApp with media sent to ${to}`);
        return { success: true, sid: response.sid };

    } catch (error) {
        console.error('❌ WhatsApp media error:', error);
        return { success: false, error: error.message };
    }
};

// Generate unique token for review
const generateReviewToken = (appointmentId) => {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    return `${token}-${appointmentId}`;
};

module.exports = {
    sendWhatsApp,
    sendWhatsAppWithMedia,
    generateReviewToken
};