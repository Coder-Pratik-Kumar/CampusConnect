import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';

/**
 * Middleware: Protect routes requiring authentication.
 *
 * Reads the Authorization header, extracts and verifies the Bearer token,
 * fetches the associated user, and attaches it to req.user.
 *
 * Rejects requests with missing, malformed, or invalid tokens.
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // 2. Extract the Bearer token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. Token is missing.',
      });
    }

    // 3. Verify the JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.',
      });
    }

    // 4. Fetch user from database to ensure they still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 5. Attach user to request and proceed
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
