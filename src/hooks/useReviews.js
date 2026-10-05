import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Custom hook to manage user reviews and ratings.
 * Wraps GET /api/users/:userId/reviews and POST /api/reviews.
 *
 * @param {string} userId - Optional target user ID (defaults to fetching if provided)
 */
export const useReviews = (userId = null) => {
  const [reviews, setReviews] = useState([]);
  const [userMetrics, setUserMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (targetId = userId) => {
    if (!targetId) {
      setReviews([]);
      setUserMetrics(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/users/${targetId}/reviews`);
      if (res.status === 'success' && res.data) {
        setReviews(res.data.reviews || []);
        setUserMetrics(res.data.user || null);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReviews(userId);
    }
  }, [userId, fetchReviews]);

  /**
   * Submit a review for a completed learning session
   * @param {Object} reviewData - { sessionId, rating, comment }
   */
  const submitReview = async ({ sessionId, rating, comment }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ sessionId, rating, comment }),
      });

      if (res.status === 'success' && res.data) {
        // Refetch reviews for the recipient if we are currently viewing their reviews
        if (userId && res.data.review?.receiverId?._id === userId) {
          await fetchReviews(userId);
        }
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviews,
    userMetrics,
    loading,
    submitting,
    error,
    refetch: fetchReviews,
    submitReview,
  };
};
