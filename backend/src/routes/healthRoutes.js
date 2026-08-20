import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint returning system operational status
 * @access  Public
 */
router.get('/health', getHealthStatus);

export default router;
