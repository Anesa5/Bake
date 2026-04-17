// migrateDoctors.js
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const migrateDoctors = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/your-database', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const doctors = await Doctor.find({});

        for (const doctor of doctors) {
            // Add default clinics from clinicAddress
            if (doctor.clinicAddress && (!doctor.clinics || doctor.clinics.length === 0)) {
                doctor.clinics = [{
                    clinicName: 'Main Clinic',
                    address: doctor.clinicAddress,
                    consultationFees: 0,
                    timings: [
                        { day: 'Monday to Friday', startTime: '09:00 AM', endTime: '06:00 PM' },
                        { day: 'Saturday', startTime: '09:00 AM', endTime: '02:00 PM' }
                    ],
                    contactPhone: doctor.phone || '',
                    city: 'Unknown',
                    state: 'Unknown'
                }];
            }

            // Add default bio
            if (!doctor.bio) {
                doctor.bio = `Dr. ${doctor.name} is a specialist in ${doctor.specialization} with ${doctor.experience} of experience.`;
            }

            // Add default services
            if (!doctor.services || doctor.services.length === 0) {
                doctor.services = [
                    `${doctor.specialization} Consultation`,
                    'Follow-up Visits',
                    'Diagnostic Tests'
                ];
            }

            // Add default education
            if (!doctor.education || doctor.education.length === 0) {
                const expYears = parseInt(doctor.experience) || 10;
                doctor.education = [{
                    degree: doctor.qualification || 'MBBS',
                    university: 'Medical College',
                    year: new Date().getFullYear() - expYears
                }];
            }

            // Add default languages
            if (!doctor.languages || doctor.languages.length === 0) {
                doctor.languages = ['English', 'Hindi'];
            }

            // Add default rating and reviews
            if (!doctor.rating) {
                doctor.rating = 4.5;
                doctor.totalReviews = Math.floor(Math.random() * 100) + 20;
            }

            await doctor.save();
            console.log(`Migrated doctor: ${doctor.name}`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateDoctors();