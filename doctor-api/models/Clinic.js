// models/Clinic.js
import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    contact: {
        phone: String,
        email: String
    },
    facilities: [String],
    images: [String],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    }
}, {
    timestamps: true
});

clinicSchema.index({ location: '2dsphere' });

const Clinic = mongoose.model('Clinic', clinicSchema);
export default Clinic;