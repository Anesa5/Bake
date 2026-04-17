// routes/specializationRoutes.js
import express from 'express';
import {
    getAllSpecializations,
    getSpecialization,
    publishDoctor,
    unpublishDoctor,
    updateAndPublishDoctor
} from '../controllers/specializationController.js';

const router = express.Router();

// Get all specializations
router.get('/', getAllSpecializations);

// Get specific specialization
router.get('/:name', getSpecialization);

// Publish doctor to specialization
router.post('/publish/:doctorId', publishDoctor);

// Unpublish doctor from specialization
router.post('/unpublish/:doctorId', unpublishDoctor);

// Update doctor and maintain publication
router.put('/doctor/:doctorId', updateAndPublishDoctor);

export default router;