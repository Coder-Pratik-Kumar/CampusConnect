import Notification from '../models/Notification.js';

/**
 * Helper: Create a notification document internally.
 * Called from session/review controllers — not an HTTP endpoint.
 */
export const createNotificationInternal = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  link = '',
}) => {
  try {
    await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    // Notification creation should never break the primary action.
    // Log but do not throw.
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
};

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Protected
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      status: 'success',
      results: notifications.length,
      unreadCount,
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Protected
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        status: 'fail',
        message: 'Notification not found',
      });
    }

    // Security: only the owner can mark their notification as read
    if (notification.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. This notification does not belong to you.',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read for authenticated user
 * @access  Protected
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} notification(s) marked as read`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};
