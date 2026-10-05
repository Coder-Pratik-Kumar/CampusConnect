import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createNotificationInternal } from './notificationController.js';
import { createZoomMeeting } from '../services/zoomService.js';

/**
 * Helper to check valid ObjectId string
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Helpers for Zoom datetime parsing ───────────────────────────────────────

/**
 * Parse a session's date string ("YYYY-MM-DD") and time string ("H:MM AM/PM")
 * into an ISO 8601 UTC datetime string suitable for Zoom's start_time field.
 *
 * Note: No timezone is stored on sessions, so we treat the time as UTC.
 * This is a known limitation documented in BRAIN.md.
 *
 * @param {string} dateStr - e.g. "2026-09-04"
 * @param {string} timeStr - e.g. "7:00 PM" or "19:00"
 * @returns {string} ISO 8601 UTC datetime (e.g. "2026-09-04T19:00:00Z")
 */
const parseSessionStartTime = (dateStr, timeStr) => {
  // Attempt to parse "H:MM AM/PM" format
  const ampmMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;
    return `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`;
  }

  // Attempt to parse "H:MM" 24-hour format
  const h24Match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);
    return `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`;
  }

  // Fallback: attempt native Date parse combining date and time
  const combined = new Date(`${dateStr} ${timeStr}`);
  if (!isNaN(combined.getTime())) {
    return combined.toISOString();
  }

  // If all parsing fails, schedule for noon UTC on the given date
  console.warn(`[SessionController] Could not parse time "${timeStr}"; defaulting to noon UTC.`);
  return `${dateStr}T12:00:00Z`;
};

/**
 * Parse a duration string like "60 Min", "90 min", "30 minutes", "1 hr"
 * into an integer number of minutes.
 *
 * @param {string} durationStr
 * @returns {number} Duration in minutes (default: 60)
 */
const parseDurationMinutes = (durationStr) => {
  if (!durationStr) return 60;
  const str = durationStr.trim().toLowerCase();

  // "60 min", "90 min"
  const minMatch = str.match(/^(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1], 10);

  // "1 hr", "2 hr"
  const hrMatch = str.match(/^(\d+)\s*hr/);
  if (hrMatch) return parseInt(hrMatch[1], 10) * 60;

  // bare number (treat as minutes)
  const numMatch = str.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1], 10);

  return 60; // safe default
};

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

    // Notification: notify provider about new session request
    await createNotificationInternal({
      recipientId: providerId,
      senderId: requesterId,
      type: 'session_request',
      title: 'New Session Request',
      message: `${req.user.name} requested a ${skill.trim()} session on ${date.trim()} at ${time.trim()}.`,
      link: '/sessions',
    });

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

    // Notification triggers for status changes
    const currentUserName = req.user.name;
    const sessionSkill = session.skill || 'Learning';

    if (status === 'accepted') {
      // Zoom meeting creation — runs after session.save() above
      // Idempotency: if zoom.meetingId already exists, skip creation silently
      if (session.zoom && session.zoom.meetingId) {
        console.log(`[SessionController] Zoom meeting already exists for session ${session._id}; skipping duplicate creation.`);
      } else {
        try {
          const startTime = parseSessionStartTime(session.date, session.time);
          const durationMinutes = parseDurationMinutes(session.duration);
          const topic = `CampusConnect Learning Session - ${sessionSkill}`;

          const zoomMeeting = await createZoomMeeting({ topic, startTime, durationMinutes });

          // Persist Zoom data to MongoDB
          session.zoom = {
            meetingId: zoomMeeting.meetingId,
            joinUrl: zoomMeeting.joinUrl,
            password: zoomMeeting.password,
          };
          await session.save();
        } catch (zoomErr) {
          // Zoom creation failed — roll back status to 'pending' so DB stays consistent
          console.error('[SessionController] Zoom meeting creation failed:', zoomErr.message);

          // Revert the status change so session stays pending
          session.status = 'pending';
          await session.save();

          return res.status(503).json({
            status: 'error',
            message:
              'The session was not accepted because the Zoom meeting could not be created. ' +
              'Please try again. If the problem persists, contact support.',
          });
        }
      }

      // Re-fetch the updated session with zoom fields populated
      const zoomData = session.zoom;
      const meetingNote = zoomData && zoomData.joinUrl
        ? ' Your Zoom meeting is ready — check your Sessions page to join.'
        : '';

      await createNotificationInternal({
        recipientId: session.requesterId,
        senderId: req.user.id,
        type: 'session_accepted',
        title: 'Session Accepted — Meeting Ready',
        message: `${currentUserName} accepted your ${sessionSkill} session request.${meetingNote}`,
        link: '/sessions',
      });
    } else if (status === 'rejected') {
      await createNotificationInternal({
        recipientId: session.requesterId,
        senderId: req.user.id,
        type: 'session_rejected',
        title: 'Session Declined',
        message: `${currentUserName} declined your ${sessionSkill} session request.`,
        link: '/sessions',
      });
    } else if (status === 'completed') {
      // Notify the other participant
      const otherParticipantId = isRequester ? session.providerId : session.requesterId;
      await createNotificationInternal({
        recipientId: otherParticipantId,
        senderId: req.user.id,
        type: 'session_completed',
        title: 'Session Completed',
        message: `${currentUserName} marked your ${sessionSkill} session as completed. You can now leave a review!`,
        link: `/reviews?sessionId=${session._id}`,
      });
    } else if (status === 'cancelled') {
      const otherParticipantId = isRequester ? session.providerId : session.requesterId;
      await createNotificationInternal({
        recipientId: otherParticipantId,
        senderId: req.user.id,
        type: 'session_cancelled',
        title: 'Session Cancelled',
        message: `${currentUserName} cancelled the ${sessionSkill} session.`,
        link: '/sessions',
      });
    }

    // Re-fetch the session with populated fields (includes zoom data if just saved)
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
