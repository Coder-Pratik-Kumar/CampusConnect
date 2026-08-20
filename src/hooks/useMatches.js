import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Hook to fetch skill matches for the authenticated user from the backend.
 * Wraps GET /api/matches.
 * The backend matching engine is the sole source of truth for match scores and reasons.
 */
export const useMatches = () => {
  const [matches, setMatches] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/matches');
      if (res.status === 'success' && res.data) {
        setMatches(res.data.matches || []);
        setTotalMatches(res.data.totalMatches || 0);
      } else {
        setError('Failed to load matches');
      }
    } catch (err) {
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    totalMatches,
    loading,
    error,
    refetch: fetchMatches,
  };
};
