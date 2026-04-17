const mongoose = require('mongoose');
require('dotenv').config();

async function testDoctorSave() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointment', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');

        // Load models
        const User = require('./models/User');
        const Doctor = require('./models/Doctor');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Doctor.deleteMany({});
        console.log('✅ Data cleared');

        // Create a test user - using CORRECT field names
        console.log('Creating test user...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('testpassword123', salt);

        const user = new User({
            username: 'Dr. Test User', // Use 'username' field
            email: 'testuser@example.com',
            password: hashedPassword,
            role: 'doctor', // This is now allowed in enum
            isProfileComplete: true // Add this field
        });

        console.log('User document:', user);

        const savedUser = await user.save();
        console.log('✅ User saved successfully!');
        console.log('User ID:', savedUser._id);
        console.log('User username:', savedUser.username);
        console.log('User role:', savedUser.role);
        console.log('User isProfileComplete:', savedUser.isProfileComplete);

        // Create a test doctor
        console.log('\nCreating test doctor...');
        const doctor = new Doctor({
            userId: savedUser._id,
            name: 'Dr. Test User',
            email: 'testuser@example.com',
            specialization: 'Gynecologist',
            qualification: 'MBBS, MD',
            experience: 10,
            location: 'Test Hospital, City',
            consultationFee: 150,
            bio: 'Test doctor with extensive experience in gynecology and obstetrics. Specialized in women health care.',
            availableHours: 'Monday to Friday: 9AM - 5PM',
            phone: '+1234567890'
        });

        console.log('Doctor document:', doctor);

        const savedDoctor = await doctor.save();
        console.log('✅ Doctor saved successfully!');
        console.log('Doctor ID:', savedDoctor._id);
        console.log('Doctor name:', savedDoctor.name);
        console.log('Doctor specialization:', savedDoctor.specialization);

        // Verify data
        console.log('\n📊 Verifying data...');
        const userCount = await User.countDocuments();
        const doctorCount = await Doctor.countDocuments();

        console.log(`Users in database: ${userCount}`);
        console.log(`Doctors in database: ${doctorCount}`);

        if (userCount > 0 && doctorCount > 0) {
            console.log('\n🎉 SUCCESS: Data is being saved to MongoDB!');

            // Show all data
            const allUsers = await User.find();
            console.log('\n📋 All users:');
            allUsers.forEach(u => console.log(`  - ${u.username} (${u.role})`));

            const allDoctors = await Doctor.find();
            console.log('\n📋 All doctors:');
            allDoctors.forEach(d => console.log(`  - ${d.name} (${d.specialization})`));
        } else {
            console.log('\n❌ FAILED: No data saved to MongoDB');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Error name:', error.name);

        if (error.name === 'ValidationError') {
            console.error('Validation errors:');
            for (const field in error.errors) {
                console.error(`  ${field}: ${error.errors[field].message}`);
            }
        }

        process.exit(1);
    }
}

testDoctorSave();