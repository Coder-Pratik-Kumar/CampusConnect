import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a completed session
 * @access  Protected
 */
router.post('/reviews', protect, createReview);

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Get all reviews received by a specific user
 * @access  Public / Protected
 */
router.get('/users/:id/reviews', getUserReviews);

export default router;
