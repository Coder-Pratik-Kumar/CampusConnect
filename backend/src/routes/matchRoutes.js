import { Router } from 'express';
import { getMatches } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/matches
 * @desc    Get rule-based skill matches for the authenticated user
 * @access  Protected
 */
router.get('/', protect, getMatches);

export default router;
