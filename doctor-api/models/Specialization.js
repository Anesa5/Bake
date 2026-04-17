// models/Specialization.js
const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        enum: [
            'Dermatologist',
            'Gynecologist',
            'Urologist',
            'Gastroenterologist',
            'Dentist',
            'Obesity Specialist',
            'ENT Specialist',
            'Orthopedic Surgeon',
            'Neurologist',
            'Child Specialist',
            'Eye Specialist',
            'General Physician'
        ]
    },
    description: {
        type: String,
        default: ''
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    totalDoctors: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

specializationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Specialization = mongoose.model('Specialization', specializationSchema);
module.exports = Specialization;