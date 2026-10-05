import mongoose from 'mongoose';
import User from '../models/User.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Helper to build a sanitized user object (strips password).
 */
export const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college || '',
  major: user.major || '',
  bio: user.bio || '',
  avatar: user.avatar || '',
  teachSkills: user.teachSkills || [],
  learnSkills: user.learnSkills || [],
  availability: user.availability || [],
  rating: user.rating,
  reviewsCount: user.reviewsCount,
  sessionsCount: user.sessionsCount,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @route   GET /api/profile
 * @desc    Get authenticated user's profile
 * @access  Protected
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/profile/:id
 * @desc    Get a peer user's public profile by ID
 * @access  Protected
 */
export const getProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update authenticated user's profile and skills
 * @access  Protected
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, college, major, bio, avatar, teachSkills, learnSkills, availability } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found',
      });
    }

    // ── Data Validation ──

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Name cannot be empty',
        });
      }
    }

    if (college !== undefined) {
      if (typeof college !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'College must be a string',
        });
      }
    }

    if (major !== undefined) {
      if (typeof major !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'Major must be a string',
        });
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'Bio must be a string',
        });
      }
      if (bio.length > 500) {
        return res.status(400).json({
          status: 'fail',
          message: 'Bio cannot exceed 500 characters',
        });
      }
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'Avatar must be a string',
        });
      }
    }

    if (teachSkills !== undefined) {
      if (!Array.isArray(teachSkills)) {
        return res.status(400).json({
          status: 'fail',
          message: 'teachSkills must be an array',
        });
      }
      if (!teachSkills.every((s) => typeof s === 'string')) {
        return res.status(400).json({
          status: 'fail',
          message: 'teachSkills must contain only strings',
        });
      }
    }

    if (learnSkills !== undefined) {
      if (!Array.isArray(learnSkills)) {
        return res.status(400).json({
          status: 'fail',
          message: 'learnSkills must be an array',
        });
      }
      if (!learnSkills.every((s) => typeof s === 'string')) {
        return res.status(400).json({
          status: 'fail',
          message: 'learnSkills must contain only strings',
        });
      }
    }

    if (availability !== undefined) {
      if (!Array.isArray(availability)) {
        return res.status(400).json({
          status: 'fail',
          message: 'availability must be an array',
        });
      }
      for (const slot of availability) {
        if (!slot || typeof slot !== 'object') {
          return res.status(400).json({
            status: 'fail',
            message: 'Each availability slot must be an object',
          });
        }
        if (!VALID_DAYS.includes(slot.day)) {
          return res.status(400).json({
            status: 'fail',
            message: `Invalid day in availability: ${slot.day}. Must be one of: ${VALID_DAYS.join(', ')}`,
          });
        }
        if (typeof slot.startTime !== 'string' || !slot.startTime.trim()) {
          return res.status(400).json({
            status: 'fail',
            message: 'Each availability slot must have a valid startTime string',
          });
        }
        if (typeof slot.endTime !== 'string' || !slot.endTime.trim()) {
          return res.status(400).json({
            status: 'fail',
            message: 'Each availability slot must have a valid endTime string',
          });
        }
      }
    }

    // ── Update Fields ──

    if (name !== undefined) user.name = name.trim();
    if (college !== undefined) user.college = college.trim();
    if (major !== undefined) user.major = major.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (teachSkills !== undefined) {
      user.teachSkills = teachSkills.map((s) => s.trim()).filter(Boolean);
    }
    if (learnSkills !== undefined) {
      user.learnSkills = learnSkills.map((s) => s.trim()).filter(Boolean);
    }
    if (availability !== undefined) {
      user.availability = availability.map((slot) => ({
        day: slot.day,
        startTime: slot.startTime.trim(),
        endTime: slot.endTime.trim(),
      }));
    }

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};
