import express from 'express';
import Doctor from '../models/Doctor.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET doctors grouped by category for homepage
router.get('/doctors-by-category', async (req, res) => {
    try {
        // Get all categories
        const categories = await Category.find().sort({ name: 1 });

        // Get all verified doctors with category populated
        const doctors = await Doctor.find()
            .populate('category', 'name description')
            .select('-password');

        // Group doctors by category
        const result = categories.map(category => {
            const categoryDoctors = doctors.filter(
                doctor => doctor.category && doctor.category._id.toString() === category._id.toString()
            );

            return {
                category: {
                    _id: category._id,
                    name: category.name,
                    description: category.description
                },
                doctors: categoryDoctors.map(doc => ({
                    _id: doc._id,
                    name: doc.name,
                    specialization: doc.specialization,
                    qualification: doc.qualification,
                    experience: doc.experience,
                    phone: doc.phone,
                    clinicAddress: doc.clinicAddress,
                    profileImage: doc.profileImage
                }))
            };
        });

        res.json({
            success: true,
            data: result.filter(item => item.doctors.length > 0), // Only show categories with doctors
            totalDoctors: doctors.length,
            totalCategories: result.filter(item => item.doctors.length > 0).length
        });

    } catch (error) {
        console.error('Homepage error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// In routes/homepageRoutes.js - ADD THESE ROUTES

// GET all categories for homepage cards
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });


        // Add additional data for homepage display
        const categoriesWithData = categories.map(category => ({
            _id: category._id,
            name: category.name,
            description: category.description,
            icon: getCategoryIcon(category.name), // Helper function for icons
            color: getCategoryColor(category.name), // Helper function for colors
            doctorCount: 0 // We'll update this later
        }));

        res.json({
            success: true,
            categories: categoriesWithData
        });

    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function for category icons
function getCategoryIcon(categoryName) {
    const iconMap = {
        'Cardiology': '❤️',
        'Dermatology': '🔬',
        'Orthopedics': '🦴',
        'Pediatrics': '👶',
        'Neurology': '🧠',
        'Gynecology': '👩',
        'Dentistry': '🦷',
        'Psychiatry': '🧠',
        'Default': '🏥'
    };

    return iconMap[categoryName] || iconMap['Default'];
}

// Helper function for category colors
function getCategoryColor(categoryName) {
    const colorMap = {
        'Cardiology': '#FF6B6B',
        'Dermatology': '#4ECDC4',
        'Orthopedics': '#45B7D1',
        'Pediatrics': '#96CEB4',
        'Neurology': '#FFEAA7',
        'Gynecology': '#DDA0DD',
        'Dentistry': '#98D8C8',
        'Psychiatry': '#F7DC6F',
        'Default': '#3498DB'
    };

    return colorMap[categoryName] || colorMap['Default'];
}
// GET doctors by specific category name
router.get('/category/:categoryName', async (req, res) => {
    try {

        const categoryName = req.params.categoryName;

        // Find category
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Find doctors in this category (only verified ones)
        const doctors = await Doctor.find({
            specialization: categoryName,
            isVerified: true
        }).select('-password');

        // Get all categories for sidebar
        const allCategories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            category: {
                _id: category._id,
                name: category.name,
                description: category.description,
                icon: getCategoryIcon(category.name),
                color: getCategoryColor(category.name)
            },
            doctors: doctors,
            allCategories: allCategories.map(cat => ({
                _id: cat._id,
                name: cat.name,
                icon: getCategoryIcon(cat.name),
                isActive: cat.name === categoryName
            })),
            totalDoctors: doctors.length
        });

    } catch (error) {
        console.error('Category doctors error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// GET doctors by specific category
router.get('/category/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const Doctor = require('../models/Doctor');

        // Find doctors in this category (verified only)
        const doctors = await Doctor.find({
            specialization: categoryName,
            isVerified: true
        }).select('-password');

        // Get all categories for navigation
        const Category = require('../models/Category');
        const allCategories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            category: {
                name: categoryName,
                description: getCategoryDescription(categoryName),
                icon: getCategoryIcon(categoryName),
                color: getCategoryColor(categoryName)
            },
            doctors: doctors,
            allCategories: allCategories,
            totalDoctors: doctors.length
        });

    } catch (error) {
        console.error('Category doctors error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function for category descriptions
function getCategoryDescription(categoryName) {
    const descMap = {
        'Cardiology': 'Heart and cardiovascular specialists',
        'Dermatology': 'Skin and hair specialists',
        'Orthopedics': 'Bone and joint specialists',
        'Pediatrics': 'Child health specialists',
        'Neurology': 'Brain and nerve specialists',
        'Gynecology': 'Women health specialists',
        'Dentistry': 'Dental care specialists',
        'Psychiatry': 'Mental health specialists'
    };
    return descMap[categoryName] || 'Medical specialists';
}

export default router;