// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientPhone: {
        type: String,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    clinicName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'completed', 'missed', 'cancelled'],
        default: 'pending'
    },
    completionMethod: {
        type: String,
        enum: ['patient-confirmed', 'qr-checkin', 'auto', 'staff-marked', 'payment'],
        default: null
    },
    confirmedAt: Date,
    checkedInAt: Date,
    completedAt: Date,
    reviewSent: {
        type: Boolean,
        default: false
    },
    reviewToken: {
        type: String,
        unique: true,
        sparse: true
    },
    qrCode: String,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for faster queries
appointmentSchema.index({ patientPhone: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);