// controllers/reviewController.js
import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

// ======================
// SUBMIT REVIEW
// ======================
export const submitReview = async (req, res) => {
    try {
        const { doctorId, patientName, patientEmail, rating, comment } = req.body;

        // Validation
        if (!doctorId || !patientName || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Create review
        const review = new Review({
            doctorId,
            patientName,
            patientEmail,
            rating,
            comment,
            createdAt: new Date()
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================
// GET DOCTOR REVIEWS
// ======================
export const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'recent';

        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid doctor ID'
            });
        }

        // Sort option
        let sortOption = {};
        switch (sort) {
            case 'recent':
                sortOption = { createdAt: -1 };
                break;
            case 'highest':
                sortOption = { rating: -1 };
                break;
            case 'lowest':
                sortOption = { rating: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Get reviews
        const reviews = await Review.find({
            doctorId: doctorId,
            status: 'approved'
        })
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit);

        // Get total count
        const total = await Review.countDocuments({
            doctorId: doctorId,
            status: 'approved'
        });

        // Get rating distribution
        const distribution = await Review.aggregate([
            {
                $match: {
                    doctorId: new mongoose.Types.ObjectId(doctorId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format distribution
        const ratingDist = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        distribution.forEach(item => {
            ratingDist[item._id] = item.count;
        });

        res.json({
            success: true,
            reviews,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalReviews: total,
            ratingDistribution: ratingDist
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================
// GET SINGLE REVIEW
// ======================
export const getReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================
// UPDATE REVIEW (Admin only)
// ======================
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const review = await Review.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================
// DELETE REVIEW (Admin only)
// ======================
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};