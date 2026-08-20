import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get authenticated user profile
 * @access  Protected
 */
router.get('/', protect, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update authenticated user profile and skills
 * @access  Protected
 */
router.put('/', protect, updateProfile);

export default router;
