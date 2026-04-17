// routes/categoryRoutes.js - UPDATED VERSION
import express from 'express';
import Category from '../models/Category.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// GET all categories FROM DATABASE
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET doctors by category (for homepage)
router.get('/:categoryId/doctors', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const doctors = await Doctor.find({
            specialization: category.name
        }).select('-password');

        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;