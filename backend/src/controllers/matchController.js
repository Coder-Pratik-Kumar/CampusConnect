import { findMatchesForUser } from '../services/matchingService.js';

/**
 * @route   GET /api/matches
 * @desc    Get rule-based skill matches for the authenticated user
 * @access  Protected
 */
export const getMatches = async (req, res, next) => {
  try {
    const result = await findMatchesForUser(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
