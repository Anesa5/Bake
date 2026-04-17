// controllers/specializationController.js
// controllers/specializationController.js
import Specialization from '../models/Specialization.js';
import Doctor from '../models/Doctor.js';

// Mock data for testing (temporary)
const mockSpecializations = [
    {
        _id: '1',
        name: 'Dermatologist',
        description: 'Skin and hair specialists',
        totalDoctors: 5,
        averageRating: 4.5,
        doctors: []
    },
    {
        _id: '2',
        name: 'Gynecologist',
        description: 'Women health specialists',
        totalDoctors: 8,
        averageRating: 4.7,
        doctors: []
    },
    // Add more specializations...
];

// Get all specializations
const getAllSpecializations = async (req, res) => {
    try {
        // Try to get from database first
        let specializations;
        try {
            specializations = await Specialization.find().populate('doctors');
        } catch (dbError) {
            console.log('Database not ready, using mock data:', dbError.message);
            specializations = mockSpecializations;
        }

        res.status(200).json({
            success: true,
            count: specializations.length,
            data: specializations
        });
    } catch (error) {
        console.error('Error in getAllSpecializations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specializations',
            error: error.message
        });
    }
};

// Get single specialization
const getSpecialization = async (req, res) => {
    try {
        const { name } = req.params;

        let specialization;
        try {
            specialization = await Specialization.findOne({ name }).populate('doctors');
        } catch (dbError) {
            specialization = mockSpecializations.find(spec =>
                spec.name.toLowerCase() === name.toLowerCase()
            );
        }

        if (!specialization) {
            return res.status(404).json({
                success: false,
                message: `Specialization '${name}' not found`
            });
        }

        res.status(200).json({
            success: true,
            data: specialization
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching specialization',
            error: error.message
        });
    }
};

// Publish doctor to specialization
const publishDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // For now, return success without actual database operation
        res.status(200).json({
            success: true,
            message: 'Doctor published successfully (mock)',
            data: {
                doctorId,
                status: 'published',
                specialization: 'Mock Specialization'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error publishing doctor',
            error: error.message
        });
    }
};

// Other functions (simplified for now)
const unpublishDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        res.status(200).json({
            success: true,
            message: 'Doctor unpublished successfully (mock)',
            data: { doctorId, status: 'unpublished' }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unpublishing doctor',
            error: error.message
        });
    }
};

const updateAndPublishDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const updateData = req.body;

        res.status(200).json({
            success: true,
            message: 'Doctor updated successfully (mock)',
            data: { doctorId, ...updateData, status: 'published' }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating doctor',
            error: error.message
        });
    }
};

module.exports = {
    getAllSpecializations,
    getSpecialization,
    publishDoctor,
    unpublishDoctor,
    updateAndPublishDoctor
};