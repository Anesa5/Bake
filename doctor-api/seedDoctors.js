// seedDoctors.js - Create test doctors
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Category = require('./models/Category');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testDoctors = [
    {
        name: 'Dr. John Carter',
        email: 'cardio@example.com',
        password: 'password123',
        specialization: 'Cardiology',
        qualification: 'MD Cardiology',
        experience: '15 years',
        phone: '1234567890',
        clinicAddress: '123 Heart Street',
        isVerified: true
    },
    {
        name: 'Dr. Sarah Skin',
        email: 'derma@example.com',
        password: 'password123',
        specialization: 'Dermatology',
        qualification: 'MD Dermatology',
        experience: '8 years',
        phone: '0987654321',
        clinicAddress: '456 Skin Avenue',
        isVerified: true
    }
    // Add more...
];

async function seedDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Get category IDs
        const cardiology = await Category.findOne({ name: 'Cardiology' });
        const dermatology = await Category.findOne({ name: 'Dermatology' });

        // Hash passwords and add category IDs
        for (let doctor of testDoctors) {
            doctor.password = await bcrypt.hash(doctor.password, 10);
            doctor.category = doctor.specialization === 'Cardiology'
                ? cardiology._id
                : dermatology._id;
        }

        await Doctor.deleteMany({});
        await Doctor.insertMany(testDoctors);

        console.log('✅ Test doctors seeded');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedDoctors();