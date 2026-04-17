// cron/appointmentCron.js
const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const FollowUp = require('../models/FollowUp');
const { sendWhatsApp, generateReviewToken } = require('../utils/whatsapp');

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running appointment completion check...');

    try {
        // Find appointments that ended 2 hours ago
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        const appointments = await Appointment.find({
            status: 'checked-in',
            completedAt: null,
            checkedInAt: { $lte: twoHoursAgo, $gte: threeHoursAgo }
        });

        console.log(`Found ${appointments.length} appointments to auto-complete`);

        for (const apt of appointments) {
            // Auto-complete appointment
            apt.status = 'completed';
            apt.completedAt = new Date();
            apt.completionMethod = 'auto';

            // Generate review token
            const reviewToken = require('crypto').randomBytes(32).toString('hex');
            apt.reviewToken = reviewToken;
            await apt.save();

            // Send review request
            const reviewLink = `https://yourapp.com/rate/${reviewToken}`;

            const message = `
🩺 *Hope your appointment went well!*

Hi ${apt.patientName}, we hope you had a good visit with Dr. ${apt.doctorName}.

Please rate your experience:
⭐ ${reviewLink}

Your feedback helps us improve!

- ${apt.clinicName} Team
      `;

            await sendWhatsApp(apt.patientPhone, message);

            await FollowUp.create({
                appointmentId: apt._id,
                patientId: apt.patientId,
                patientPhone: apt.patientPhone,
                messageType: 'review-request',
                message
            });

            console.log(`✅ Auto-completed appointment: ${apt._id}`);
        }

    } catch (error) {
        console.error('❌ Cron job error:', error);
    }
});

// Run every day at 8 PM to send follow-ups
cron.schedule('0 20 * * *', async () => {
    console.log('🕐 Running follow-up check...');

    try {
        // Find appointments completed 3 days ago with no review
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

        const appointments = await Appointment.find({
            status: 'completed',
            reviewSent: false,
            completedAt: { $lte: threeDaysAgo, $gte: fourDaysAgo }
        });

        console.log(`Found ${appointments.length} appointments for follow-up`);

        for (const apt of appointments) {
            const reviewLink = `https://yourapp.com/rate/${apt.reviewToken}`;

            const message = `
🩺 *Quick reminder*

Hi ${apt.patientName}, we'd still love to hear about your experience with Dr. ${apt.doctorName}.

Your feedback takes only 30 seconds:

⭐ ${reviewLink}

Thanks for helping us improve!

- ${apt.clinicName} Team
      `;

            await sendWhatsApp(apt.patientPhone, message);

            await FollowUp.create({
                appointmentId: apt._id,
                patientId: apt.patientId,
                patientPhone: apt.patientPhone,
                messageType: 'follow-up',
                message
            });

            console.log(`✅ Follow-up sent: ${apt._id}`);
        }

    } catch (error) {
        console.error('❌ Follow-up cron error:', error);
    }
});