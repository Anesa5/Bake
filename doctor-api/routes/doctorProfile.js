// routes/doctorProfile.js - UPDATED FOR YOUR MODEL
import express from 'express';
import Doctor from '../models/Doctor.js';
import Category from '../models/Category.js';

const router = express.Router();

// Get doctor by ID with complete details
router.get('/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;

        // Find doctor with populated category
        const doctor = await Doctor.findById(doctorId)
            .populate('category', 'name icon color description')
            .exec();

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Format clinics - ensure compatibility with old data
        let clinics = [];
        if (doctor.clinics && doctor.clinics.length > 0) {
            clinics = doctor.clinics;
        } else if (doctor.clinicAddress) {
            // Fallback to old clinicAddress field
            clinics = [{
                clinicName: 'Main Clinic',
                address: doctor.clinicAddress,
                consultationFees: 0,
                timings: [
                    { day: 'Monday to Friday', startTime: '09:00 AM', endTime: '06:00 PM' },
                    { day: 'Saturday', startTime: '09:00 AM', endTime: '02:00 PM' }
                ],
                contactPhone: doctor.phone || ''
            }];
        }

        // Format the response
        const formattedDoctor = {
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            qualification: doctor.qualification,
            experience: doctor.experience,
            specialization: doctor.specialization,
            bio: doctor.bio || `Dr. ${doctor.name} is a specialist in ${doctor.specialization} with ${doctor.experience} of experience.`,
            profileImage: doctor.profileImage,
            category: doctor.category,
            clinics: clinics,
            services: doctor.services || [
                `${doctor.specialization} Consultation`,
                'Follow-up Visits',
                'Diagnostic Tests'
            ],
            education: doctor.education || [
                { degree: doctor.qualification || 'MBBS', university: 'Medical College', year: new Date().getFullYear() - parseInt(doctor.experience) || 2010 }
            ],
            awards: doctor.awards || [],
            languages: doctor.languages || ['English', 'Hindi'],
            rating: doctor.rating || 4.5,
            totalReviews: doctor.totalReviews || Math.floor(Math.random() * 100) + 20,
            isVerified: doctor.isVerified,
            createdAt: doctor.createdAt
        };

        res.json({
            success: true,
            data: formattedDoctor
        });

    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update doctor profile (for doctors to add more details)
router.put('/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.email;
        delete updateData.password;
        delete updateData._id;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category', 'name icon color');

        if (!updatedDoctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedDoctor
        });

    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;