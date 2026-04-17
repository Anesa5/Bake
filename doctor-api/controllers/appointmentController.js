// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const FollowUp = require('../models/FollowUp');
const { sendWhatsApp, generateReviewToken } = require('../utils/whatsapp');
const QRCode = require('qrcode');

// Create new appointment
exports.createAppointment = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            patientName,
            patientPhone,
            doctorName,
            clinicName,
            date,
            time
        } = req.body;

        const appointment = new Appointment({
            patientId,
            doctorId,
            patientName,
            patientPhone,
            doctorName,
            clinicName,
            date,
            time,
            status: 'confirmed'
        });

        await appointment.save();

        // Generate QR code
        const qrData = `https://yourapp.com/checkin/${appointment._id}`;
        const qrImage = await QRCode.toDataURL(qrData);
        appointment.qrCode = qrImage;
        await appointment.save();

        // Send confirmation message with QR
        const message = `
🩺 *Appointment Confirmed*

Dr. ${doctorName}
📅 ${new Date(date).toLocaleDateString()}
⏰ ${time}
🏥 ${clinicName}

*Show this QR code at reception:*
${qrData}

Reply *RESCHEDULE* if you need to change
    `;

        await sendWhatsApp(patientPhone, message);

        res.status(201).json({
            success: true,
            message: 'Appointment created',
            appointment
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// QR check-in
exports.checkInAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = 'checked-in';
        appointment.checkedInAt = new Date();
        await appointment.save();

        res.json({
            success: true,
            message: 'Check-in successful',
            patient: appointment.patientName,
            doctor: appointment.doctorName
        });

    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark appointment as completed (by doctor/staff)
exports.completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { method } = req.body; // 'staff-marked' or 'payment'

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = 'completed';
        appointment.completedAt = new Date();
        appointment.completionMethod = method || 'staff-marked';

        // Generate review token
        const reviewToken = require('crypto').randomBytes(32).toString('hex');
        appointment.reviewToken = reviewToken;
        await appointment.save();

        // Send review request
        await sendReviewRequest(appointment);

        res.json({
            success: true,
            message: 'Appointment marked completed'
        });

    } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to send review request
async function sendReviewRequest(appointment) {
    const reviewLink = `https://yourapp.com/rate/${appointment.reviewToken}`;

    const message = `
🩺 *How was your visit?*

Hi ${appointment.patientName}, we hope you had a great visit with Dr. ${appointment.doctorName}.

Please take 30 seconds to rate your experience:

⭐ *Rate now:* ${reviewLink}

Your feedback helps us improve!

- ${appointment.clinicName} Team
  `;

    await sendWhatsApp(appointment.patientPhone, message);

    // Record follow-up
    await FollowUp.create({
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        patientPhone: appointment.patientPhone,
        messageType: 'review-request',
        message
    });
}

// Get today's appointments
exports.getTodaysAppointments = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('patientId doctorId');

        res.json({
            success: true,
            appointments
        });

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};