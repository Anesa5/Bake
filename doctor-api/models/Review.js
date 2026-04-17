// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    patientEmail: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Ya 'pending' rakh sakte ho agar moderation chahiye
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Update doctor's average rating after save
reviewSchema.post('save', async function () {
    const Doctor = mongoose.model('Doctor');

    // Calculate new average rating
    const stats = await mongoose.model('Review').aggregate([
        { $match: { doctorId: this.doctorId, status: 'approved' } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Doctor.findByIdAndUpdate(this.doctorId, {
            rating: parseFloat(stats[0].avgRating.toFixed(1)),
            totalReviews: stats[0].totalReviews
        });
    }
});

// Update doctor's rating after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const Doctor = mongoose.model('Doctor');

        const stats = await mongoose.model('Review').aggregate([
            { $match: { doctorId: doc.doctorId, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Doctor.findByIdAndUpdate(doc.doctorId, {
                rating: parseFloat(stats[0].avgRating.toFixed(1)),
                totalReviews: stats[0].totalReviews
            });
        } else {
            // No reviews left
            await Doctor.findByIdAndUpdate(doc.doctorId, {
                rating: 0,
                totalReviews: 0
            });
        }
    }
});

module.exports = mongoose.model('Review', reviewSchema);