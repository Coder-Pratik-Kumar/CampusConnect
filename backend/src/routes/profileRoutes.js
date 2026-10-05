import { Router } from 'express';
import { getProfile, getProfileById, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get authenticated user profile
 * @access  Protected
 */
router.get('/', protect, getProfile);

/**
 * @route   GET /api/profile/:id
 * @desc    Get peer user's profile by ID
 * @access  Protected
 */
router.get('/:id', protect, getProfileById);

/**
 * @route   PUT /api/profile
 * @desc    Update authenticated user profile and skills
 * @access  Protected
 */
router.put('/', protect, updateProfile);

export default router;
