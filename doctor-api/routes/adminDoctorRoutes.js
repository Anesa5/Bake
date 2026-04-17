// routes/adminDoctorRoutes.js - COMPLETE VERSION
import express from 'express';
import Doctor from '../models/Doctor.js';
import Category from '../models/Category.js';
import authMiddleware from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

// ==================== DOCTOR VERIFICATION ====================

// Get pending doctors (not verified)
router.get('/pending', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;

        const query = { isVerified: false };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(query)
            .select('-password')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Doctor.countDocuments(query);

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get pending doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Verify single doctor
router.put('/:id/verify', authMiddleware, isAdmin, async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    isVerified: true,
                    verifiedAt: Date.now()
                }
            },
            { new: true }
        ).select('-password').populate('category', 'name');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            message: 'Doctor verified successfully',
            data: doctor
        });

    } catch (error) {
        console.error('Verify doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Bulk verify doctors
router.post('/bulk-verify', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { doctorIds } = req.body;

        if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctor IDs'
            });
        }

        const result = await Doctor.updateMany(
            { _id: { $in: doctorIds } },
            {
                $set: {
                    isVerified: true,
                    verifiedAt: Date.now()
                }
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} doctors verified successfully`,
            count: result.modifiedCount
        });

    } catch (error) {
        console.error('Bulk verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Reject doctor (with reason)
router.put('/:id/reject', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    isVerified: false,
                    rejectionReason: rejectionReason || 'Application rejected',
                    rejectedAt: Date.now()
                }
            },
            { new: true }
        ).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            message: 'Doctor rejected successfully',
            data: doctor
        });

    } catch (error) {
        console.error('Reject doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== DOCTOR MANAGEMENT ====================

// Get all doctors (with filters)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            status = '',
            category = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter
        if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'pending') {
            query.isVerified = false;
        }

        // Category filter
        if (category) {
            const cat = await Category.findOne({ name: { $regex: category, $options: 'i' } });
            if (cat) {
                query.category = cat._id;
            }
        }

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const doctors = await Doctor.find(query)
            .select('-password')
            .populate('category', 'name icon color')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Doctor.countDocuments(query);

        res.json({
            success: true,
            data: doctors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single doctor details
router.get('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .select('-password')
            .populate('category', 'name icon color');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: doctor
        });

    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update doctor (admin can edit any field except password)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const updateData = req.body;

        // Remove restricted fields
        delete updateData.email;
        delete updateData.password;
        delete updateData._id;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password').populate('category', 'name');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });

    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete doctor
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            message: 'Doctor deleted successfully'
        });

    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ADMIN DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/stats/dashboard', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Total counts
        const totalDoctors = await Doctor.countDocuments();
        const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
        const pendingDoctors = await Doctor.countDocuments({ isVerified: false });

        // Today's registrations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRegistrations = await Doctor.countDocuments({
            createdAt: { $gte: today }
        });

        // Doctors by category
        const byCategory = await Doctor.aggregate([
            { $match: { isVerified: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Populate category names
        const categories = await Category.find({
            _id: { $in: byCategory.map(item => item._id) }
        });

        const byCategoryWithNames = byCategory.map(item => {
            const category = categories.find(cat => cat._id.toString() === item._id.toString());
            return {
                name: category ? category.name : 'Unknown',
                count: item.count
            };
        });

        // Recent pending doctors
        const recentPending = await Doctor.find({ isVerified: false })
            .select('name email specialization phone createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Monthly registrations (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRegistrations = await Doctor.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                $limit: 6
            }
        ]);

        res.json({
            success: true,
            data: {
                totals: {
                    all: totalDoctors,
                    verified: verifiedDoctors,
                    pending: pendingDoctors,
                    today: todayRegistrations
                },
                byCategory: byCategoryWithNames,
                recentPending,
                monthlyRegistrations: monthlyRegistrations.map(item => ({
                    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                    count: item.count
                }))
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get verification statistics
router.get('/stats/verification', authMiddleware, isAdmin, async (req, res) => {
    try {
        // Average verification time
        const verifiedDoctors = await Doctor.find({
            isVerified: true,
            verifiedAt: { $exists: true }
        });

        let totalVerificationTime = 0;
        verifiedDoctors.forEach(doctor => {
            const verificationTime = doctor.verifiedAt - doctor.createdAt;
            totalVerificationTime += verificationTime;
        });

        const avgVerificationTime = verifiedDoctors.length > 0
            ? totalVerificationTime / verifiedDoctors.length
            : 0;

        // Verification rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const registrationsLast30Days = await Doctor.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const verificationsLast30Days = await Doctor.countDocuments({
            verifiedAt: { $gte: thirtyDaysAgo }
        });

        const verificationRate = registrationsLast30Days > 0
            ? (verificationsLast30Days / registrationsLast30Days) * 100
            : 0;

        res.json({
            success: true,
            data: {
                avgVerificationTime: Math.round(avgVerificationTime / (1000 * 60 * 60 * 24)), // in days
                verificationRate: Math.round(verificationRate),
                pendingOver30Days: await Doctor.countDocuments({
                    isVerified: false,
                    createdAt: { $lt: thirtyDaysAgo }
                })
            }
        });

    } catch (error) {
        console.error('Verification stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;