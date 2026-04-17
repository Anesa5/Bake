import express from 'express';
import Doctor from '../models/Doctor.js';
import Category from '../models/Category.js';

const router = express.Router();

// ✅ YEH ROUTE ADD KARO - GET ALL DOCTORS
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('category');

        res.json({
            success: true,
            count: doctors.length,
            doctors: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET all doctors for homepage (grouped by category)
router.get('/homepage', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isVerified: true })
            .select('-password')
            .populate('category', 'name');

        // Group by category name
        const doctorsByCategory = {};

        doctors.forEach(doctor => {
            const categoryName = doctor.category?.name || doctor.specialization || 'Uncategorized';
            if (!doctorsByCategory[categoryName]) {
                doctorsByCategory[categoryName] = [];
            }
            doctorsByCategory[categoryName].push(doctor);
        });

        res.json({
            success: true,
            doctorsByCategory,
            totalDoctors: doctors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search doctors route
router.get("/search", async (req, res) => {
    try {
        const { query, specialty, city, category, page = 1, limit = 10 } = req.query;

        console.log("✅ Search endpoint hit!");

        let searchCriteria = {};

        if (query && query.trim() !== '') {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } },
                { qualification: { $regex: query, $options: 'i' } },
                { clinicAddress: { $regex: query, $options: 'i' } }
            ];
        }

        if (specialty && specialty.trim() !== '') {
            searchCriteria.specialization = { $regex: specialty, $options: 'i' };
        }

        if (city && city.trim() !== '') {
            searchCriteria.clinicAddress = { $regex: city, $options: 'i' };
        }

        if (category && category.trim() !== '') {
            const categoryDoc = await Category.findOne({
                name: { $regex: category, $options: 'i' }
            });

            if (categoryDoc) {
                searchCriteria.category = categoryDoc._id;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const doctors = await Doctor.find(searchCriteria)
            .populate('category', 'name description')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 });

        const total = await Doctor.countDocuments(searchCriteria);

        res.json({
            doctors,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalDoctors: total
        });
    } catch (error) {
        console.error("❌ Search error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get single doctor by ID
router.get("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('category');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            doctor: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;