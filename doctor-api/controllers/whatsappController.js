// controllers/whatsappController.js
const Appointment = require('../models/Appointment');
const FollowUp = require('../models/FollowUp');
const { sendWhatsApp } = require('../utils/whatsapp');

// Handle incoming WhatsApp messages (Twilio webhook)
exports.handleIncomingMessage = async (req, res) => {
    try {
        const { From, Body } = req.body;
        const patientPhone = From.replace('whatsapp:', '');
        const reply = Body.trim().toUpperCase();

        console.log(`📩 WhatsApp reply from ${patientPhone}: ${reply}`);

        // Find today's appointment for this patient
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointment = await Appointment.findOne({
            patientPhone,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['confirmed', 'checked-in'] }
        }).sort({ date: -1 });

        if (!appointment) {
            // No appointment found - send general response
            await sendWhatsApp(patientPhone, `
Sorry, we couldn't find any appointment for you today.

To book a new appointment:
📅 Visit: https://yourapp.com/book
      `);

            return res.send('<Response></Response>');
        }

        // Record reply
        await FollowUp.create({
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            patientPhone,
            messageType: 'reply',
            patientReply: Body,
            repliedAt: new Date(),
            status: 'replied'
        });

        // Handle different replies
        if (reply === 'ATTENDED' || reply === '1' || reply === '✅') {
            // Patient confirms attendance
            appointment.status = 'completed';
            appointment.completedAt = new Date();
            appointment.completionMethod = 'patient-confirmed';

            // Generate review token
            const crypto = require('crypto');
            const reviewToken = crypto.randomBytes(32).toString('hex');
            appointment.reviewToken = reviewToken;
            await appointment.save();

            const reviewLink = `https://yourapp.com/rate/${reviewToken}`;

            const response = `
✅ *Thank you for confirming!*

We hope you had a great visit with Dr. ${appointment.doctorName}.

Please rate your experience:
⭐ ${reviewLink}

Your feedback helps us serve you better!
      `;

            await sendWhatsApp(patientPhone, response);

        } else if (reply === 'MISSED' || reply === '2' || reply === '❌') {
            // Patient missed appointment
            appointment.status = 'missed';
            await appointment.save();

            const response = `
We're sorry you missed your appointment.

Would you like to reschedule?
📅 Reply *RESCHEDULE* to book another time
      `;

            await sendWhatsApp(patientPhone, response);

        } else if (reply === 'RESCHEDULE' || reply === '3' || reply === '📅') {
            // Reschedule request
            const response = `
Please visit our booking page:
🔗 https://yourapp.com/book

Or reply with your preferred date (DD/MM/YYYY) and time
      `;

            await sendWhatsApp(patientPhone, response);

        } else {
            // Unknown reply
            const response = `
Please reply with:
1️⃣ Attended - I went to my appointment
2️⃣ Missed - I couldn't make it
3️⃣ Reschedule - Book another time
      `;

            await sendWhatsApp(patientPhone, response);
        }

        res.send('<Response></Response>');

    } catch (error) {
        console.error('❌ Error handling WhatsApp reply:', error);
        res.status(500).send('<Response></Response>');
    }
};