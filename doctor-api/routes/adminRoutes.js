import express from 'express';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import doctorAuthMiddleware from '../middleware/doctorAuthMiddleware.js';

const router = express.Router();

// GET all doctors (admin only)
router.get('/doctors', adminAuthMiddleware, async (req, res) => {
    try {
        const doctors = await Doctor.find().select('-password');
        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET dashboard stats
router.get('/doctors/stats', doctorAuthMiddleware, async (req, res) => {
    try {
        const stats = {
            totalDoctors: await Doctor.countDocuments(),
            activeDoctors: await Doctor.countDocuments({ status: 'active' }),
            pendingDoctors: await Doctor.countDocuments({ status: 'pending' }),
            totalAdmins: await Admin.countDocuments(),
            // Add more stats as needed
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;