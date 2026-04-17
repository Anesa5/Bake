// routes/doctorRoutes.js
import express from "express";
import {
    registerDoctor,
    loginDoctor,
    addClinic
} from "../controllers/doctorController.js";
import Doctor from "../models/Doctor.js";
import Category from "../models/Category.js";

const router = express.Router();

// Existing routes
router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.post("/clinic", addClinic);

// ADD THIS SEARCH ROUTE
router.get("/search", async (req, res) => {
    try {
        const { query, specialty, city, category, page = 1, limit = 10 } = req.query;

        console.log("Search query received:", { query, specialty, city, category }); // Debug log

        let searchCriteria = {};

        // Text search across multiple fields
        if (query && query.trim() !== '') {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } },
                { qualification: { $regex: query, $options: 'i' } },
                { clinicAddress: { $regex: query, $options: 'i' } }
            ];
        }

        // Filter by specialty
        if (specialty && specialty.trim() !== '') {
            searchCriteria.specialization = { $regex: specialty, $options: 'i' };
        }

        // Filter by city
        if (city && city.trim() !== '') {
            searchCriteria.clinicAddress = { $regex: city, $options: 'i' };
        }

        // Filter by category
        if (category && category.trim() !== '') {
            const categoryDoc = await Category.findOne({
                name: { $regex: category, $options: 'i' }
            });

            if (categoryDoc) {
                searchCriteria.category = categoryDoc._id;
            }
        }

        console.log("Search criteria:", searchCriteria); // Debug log

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const doctors = await Doctor.find(searchCriteria)
            .populate('category', 'name description')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ name: 1 });

        const total = await Doctor.countDocuments(searchCriteria);

        console.log(`Found ${total} doctors`); // Debug log

        res.json({
            doctors,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalDoctors: total
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Your categories route (if you want to keep it)
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;