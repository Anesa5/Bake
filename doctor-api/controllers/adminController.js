// server/controllers/adminController.js
import twilio from 'twilio';

// Initialize Twilio (add these to your .env file)
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Enhanced reject doctor with SMS
export const rejectDoctorWithSMS = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { rejectionReason } = req.body;

        // Get doctor details from database
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update doctor status
        doctor.isVerified = false;
        doctor.status = 'rejected';
        doctor.rejectionReason = rejectionReason;
        doctor.rejectedAt = new Date();
        await doctor.save();

        // Send SMS to doctor
        const smsMessage = `
Dear Dr. ${doctor.name},

We regret to inform you that your doctor registration has been rejected.

Reason: ${rejectionReason}

For any clarification, please contact our support team at support@mediflow.com or call us at +1-800-123-4567.

Best regards,
MediFlow Admin Team
        `.trim();

        try {
            await twilioClient.messages.create({
                body: smsMessage,
                to: doctor.phone, // Doctor's phone number
                from: process.env.TWILIO_PHONE_NUMBER // Your Twilio number
            });

            // Log SMS sent
            console.log(`SMS sent to ${doctor.phone} for doctor ${doctor.name}`);

            // Save SMS record to database
            await SMSLog.create({
                doctorId: doctor._id,
                phoneNumber: doctor.phone,
                message: smsMessage,
                type: 'rejection',
                status: 'sent',
                sentAt: new Date()
            });

        } catch (smsError) {
            console.error('SMS sending failed:', smsError);

            // Log failed SMS
            await SMSLog.create({
                doctorId: doctor._id,
                phoneNumber: doctor.phone,
                message: smsMessage,
                type: 'rejection',
                status: 'failed',
                error: smsError.message,
                attemptedAt: new Date()
            });
        }

        // Send notification email as backup
        // You can add email sending here too

        res.status(200).json({
            success: true,
            message: 'Doctor rejected successfully',
            data: doctor
        });

    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject doctor',
            error: error.message
        });
    }
};

// SMS Log Schema
const smsLogSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    phoneNumber: String,
    message: String,
    type: { type: String, enum: ['rejection', 'verification', 'notification'] },
    status: { type: String, enum: ['sent', 'failed', 'pending'] },
    error: String,
    sentAt: Date,
    attemptedAt: { type: Date, default: Date.now }
});