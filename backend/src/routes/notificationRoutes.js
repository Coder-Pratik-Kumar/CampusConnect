import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET  /api/notifications          — Fetch user's notifications
router.get('/', getUserNotifications);

// PUT  /api/notifications/read-all — Mark all as read (must come BEFORE /:id)
router.put('/read-all', markAllAsRead);

// PUT  /api/notifications/:id/read — Mark a single notification as read
router.put('/:id/read', markAsRead);

export default router;
