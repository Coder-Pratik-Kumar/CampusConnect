import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Hook to manage learning sessions for the authenticated user.
 * Wraps GET /api/sessions, POST /api/sessions, and PUT /api/sessions/:id.
 */
export const useSessions = (initialStatusFilter = '') => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = initialStatusFilter
        ? `/sessions?status=${encodeURIComponent(initialStatusFilter)}`
        : '/sessions';
      const res = await apiFetch(endpoint);
      if (res.status === 'success' && res.data) {
        setSessions(res.data.sessions || []);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * Request a new learning session
   * @param {Object} sessionData - { providerId, skill, date, time, duration, message }
   */
  const createSession = async (sessionData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });

      if (res.status === 'success' && res.data?.session) {
        await fetchSessions();
        return res.data.session;
      } else {
        throw new Error(res.message || 'Failed to create session request');
      }
    } catch (err) {
      setError(err.message || 'Failed to create session request');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Update session status or details
   * @param {string} sessionId
   * @param {Object} updateData - { status, date, time, message }
   */
  const updateSessionStatus = async (sessionId, updateData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (res.status === 'success' && res.data?.session) {
        // Update local session state immediately
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? res.data.session : s))
        );
        return res.data.session;
      } else {
        throw new Error(res.message || 'Failed to update session');
      }
    } catch (err) {
      setError(err.message || 'Failed to update session');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sessions,
    loading,
    submitting,
    error,
    refetch: fetchSessions,
    createSession,
    updateSessionStatus,
  };
};
