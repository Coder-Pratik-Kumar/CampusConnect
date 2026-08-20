import { Router } from 'express';
import {
  createSession,
  getUserSessions,
  getSessionById,
  updateSessionStatus,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all session endpoints with auth middleware
router.use(protect);

/**
 * @route   POST /api/sessions
 * @desc    Create a new learning session request
 * @access  Protected
 */
router.post('/', createSession);

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions for the authenticated user
 * @access  Protected
 */
router.get('/', getUserSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get single session details by ID
 * @access  Protected (Participants only)
 */
router.get('/:id', getSessionById);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update session status or details
 * @access  Protected (Authorized participants only)
 */
router.put('/:id', updateSessionStatus);

export default router;
