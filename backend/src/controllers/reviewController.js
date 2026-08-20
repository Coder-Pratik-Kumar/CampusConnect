import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a completed learning session
 * @access  Protected
 */
export const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const { sessionId, rating, comment } = req.body;

    // 1. Validate sessionId
    if (!sessionId || !isValidObjectId(sessionId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid sessionId is required',
      });
    }

    // 2. Validate rating (1-5)
    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // 3. Validate comment
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment is required',
      });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment cannot exceed 500 characters',
      });
    }

    // 4. Fetch session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found',
      });
    }

    // Rule 2: Review can only be created for a completed session
    if (session.status !== 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Reviews can only be created for completed sessions',
      });
    }

    // Rule 3: Only participants of that session can review each other
    const isRequester = session.requesterId.toString() === reviewerId.toString();
    const isProvider = session.providerId.toString() === reviewerId.toString();

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. You were not a participant in this session.',
      });
    }

    // Determine receiverId (the opposing participant)
    const receiverId = isRequester ? session.providerId : session.requesterId;

    // Rule 4: A user cannot review the same completed session multiple times
    const existingReview = await Review.findOne({ sessionId, reviewerId });
    if (existingReview) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already submitted a review for this session',
      });
    }

    // 5. Create Review document
    const newReview = await Review.create({
      sessionId,
      reviewerId,
      receiverId,
      rating: numRating,
      comment: comment.trim(),
    });

    // Rule 7: Update receiver's average rating and review count
    const receiverReviews = await Review.find({ receiverId });
    const totalRating = receiverReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / receiverReviews.length) * 10) / 10;

    await User.findByIdAndUpdate(receiverId, {
      rating: avgRating,
      reviewsCount: receiverReviews.length,
    });

    const populatedReview = await Review.findById(newReview._id)
      .populate('reviewerId', 'name avatar college major')
      .populate('receiverId', 'name avatar college major rating reviewsCount');

    return res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: {
        review: populatedReview,
        receiverMetrics: {
          rating: avgRating,
          reviewsCount: receiverReviews.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id/reviews
 * @desc    Get all reviews received by a specific user
 * @access  Public / Protected
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format',
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    const reviews = await Review.find({ receiverId: id })
      .populate('reviewerId', 'name avatar college major')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        user: {
          id: targetUser._id,
          name: targetUser.name,
          rating: targetUser.rating,
          reviewsCount: targetUser.reviewsCount,
        },
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
