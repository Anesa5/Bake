// routes/reviewRoutes.js
import express from 'express';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.post('/', reviewController.submitReview);
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);
router.get('/:id', reviewController.getReview);

// Admin routes
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;