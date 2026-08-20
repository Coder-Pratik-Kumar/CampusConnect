import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';

/**
 * Helper to check valid ObjectId string
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route   POST /api/sessions
 * @desc    Create a new learning session request
 * @access  Protected
 */
export const createSession = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { providerId, skill, date, time, duration, message } = req.body;

    // 1. Validate providerId
    if (!providerId || !isValidObjectId(providerId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid providerId is required',
      });
    }

    // Rule 1: A user cannot request a session with themselves
    if (providerId.toString() === requesterId.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot request a session with yourself',
      });
    }

    // Verify provider exists in database
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: 'fail',
        message: 'Provider user not found',
      });
    }

    // 2. Validate skill, date, time
    if (!skill || typeof skill !== 'string' || !skill.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Skill is required',
      });
    }

    if (!date || typeof date !== 'string' || !date.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid date is required',
      });
    }

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid date string (e.g. YYYY-MM-DD)',
      });
    }

    if (!time || typeof time !== 'string' || !time.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Session time is required',
      });
    }

    // 3. Create session with status = 'pending'
    const newSession = await Session.create({
      requesterId,
      providerId,
      skill: skill.trim(),
      date: date.trim(),
      time: time.trim(),
      duration: duration ? duration.trim() : '60 min',
      message: message ? message.trim() : '',
      status: 'pending',
    });

    const populatedSession = await Session.findById(newSession._id)
      .populate('requesterId', 'name email college major avatar')
      .populate('providerId', 'name email college major avatar');

    return res.status(201).json({
      status: 'success',
      message: 'Learning session requested successfully',
      data: {
        session: populatedSession,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions for the authenticated user (as requester or provider)
 * @access  Protected
 */
export const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = {
      $or: [{ requesterId: userId }, { providerId: userId }],
    };

    if (status) {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate('requesterId', 'name email college major avatar')
      .populate('providerId', 'name email college major avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: {
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a single session details by ID
 * @access  Protected (Participants only)
 */
export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findById(id)
      .populate('requesterId', 'name email college major avatar')
      .populate('providerId', 'name email college major avatar');

    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found',
      });
    }

    // Rule 4: Only appropriate participants can view a session
    const isRequester = session.requesterId._id.toString() === req.user.id.toString();
    const isProvider = session.providerId._id.toString() === req.user.id.toString();

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. You are not a participant in this session.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update session status (accept, reject, cancel, complete) or details
 * @access  Protected (Authorized participants only)
 */
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, date, time, message } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid session ID format',
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found',
      });
    }

    const currentUserId = req.user.id.toString();
    const isRequester = session.requesterId.toString() === currentUserId;
    const isProvider = session.providerId.toString() === currentUserId;

    // Rule 4: Participant authorization check
    if (!isRequester && !isProvider) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. You are not a participant in this session.',
      });
    }

    // State transition validations if status change is requested
    if (status) {
      const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid status: ${status}. Allowed values: ${allowedStatuses.join(', ')}`,
        });
      }

      // Rule 3: Only the relevant provider can accept/reject a pending request
      if (status === 'accepted' || status === 'rejected') {
        if (!isProvider) {
          return res.status(403).json({
            status: 'fail',
            message: 'Only the designated provider can accept or reject a session request',
          });
        }
        if (session.status !== 'pending') {
          return res.status(400).json({
            status: 'fail',
            message: `Cannot ${status} a session that is currently ${session.status}`,
          });
        }
      }

      // Rule 5: A session can only become completed after it is accepted
      if (status === 'completed') {
        if (session.status !== 'accepted') {
          return res.status(400).json({
            status: 'fail',
            message: 'A session can only be marked as completed after it has been accepted',
          });
        }
      }

      // Cancellation check
      if (status === 'cancelled') {
        if (session.status === 'completed' || session.status === 'rejected') {
          return res.status(400).json({
            status: 'fail',
            message: `Cannot cancel a session that is already ${session.status}`,
          });
        }
      }

      session.status = status;
    }

    if (date && typeof date === 'string') {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide a valid date string (e.g. YYYY-MM-DD)',
        });
      }
      session.date = date.trim();
    }

    if (time && typeof time === 'string') {
      session.time = time.trim();
    }

    if (message !== undefined && typeof message === 'string') {
      session.message = message.trim();
    }

    await session.save();

    const updatedSession = await Session.findById(session._id)
      .populate('requesterId', 'name email college major avatar')
      .populate('providerId', 'name email college major avatar');

    return res.status(200).json({
      status: 'success',
      message: `Session status updated to ${session.status}`,
      data: {
        session: updatedSession,
      },
    });
  } catch (error) {
    next(error);
  }
};
