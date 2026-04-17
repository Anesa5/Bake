// models/Doctor.js - COMPLETE VERSION WITH VERIFICATION TRACKING
import mongoose from 'mongoose';

const clinicTimingSchema = new mongoose.Schema({
    clinicName: { type: String },
    address: { type: String },
    consultationFees: { type: Number, default: 0 },
    timings: [{
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String }
    }],
    contactPhone: { type: String },
    city: { type: String },
    state: { type: String }
});

const educationSchema = new mongoose.Schema({
    degree: { type: String },
    university: { type: String },
    year: { type: Number }
});

const awardSchema = new mongoose.Schema({
    name: { type: String },
    year: { type: Number }
});

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    qualification: { type: String },
    experience: { type: String },
    phone: { type: String },
    clinicAddress: { type: String },
    profileImage: { type: String, default: '/uploads/default-doctor.jpg' },

    // ✅ SINGLE SERVICES FIELD - YAHI USE HOGA
    services: {
        type: [String],  // Array of strings
        default: []       // Default empty array
    },

    // Verification fields
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectionReason: {
        type: String
    },
    rejectedAt: {
        type: Date
    },

    isAvailable: { type: Boolean, default: true },

    // Enhanced profile fields
    bio: { type: String, default: '' },
    clinics: [clinicTimingSchema],
    education: [educationSchema],
    awards: [awardSchema],
    languages: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

doctorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;