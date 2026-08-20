import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Sign a JWT for a given user ID.
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

/**
 * Build a safe user object (strips password).
 */
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  major: user.major,
  bio: user.bio,
  avatar: user.avatar,
  teachSkills: user.teachSkills,
  learnSkills: user.learnSkills,
  rating: user.rating,
  createdAt: user.createdAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, major } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Email address is required' });
    }
    if (!password) {
      return res.status(400).json({ status: 'fail', message: 'Password is required' });
    }

    // 2. Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a valid email address' });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({ status: 'fail', message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'An account with this email address already exists' });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      college: college ? college.trim() : '',
      major: major ? major.trim() : '',
    });

    // 7. Return safe response (no password)
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: safeUser(newUser) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !email.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Email address is required' });
    }
    if (!password) {
      return res.status(400).json({ status: 'fail', message: 'Password is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user — explicitly select password field (excluded by default later)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
    }

    // 3. Compare password with bcrypt hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
    }

    // 4. Sign JWT
    const token = signToken(user._id);

    // 5. Return token + safe user (no password)
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: safeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user's profile
 * @access  Protected (requires valid JWT)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: { user: safeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};
