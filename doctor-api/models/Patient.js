import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
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

patientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;