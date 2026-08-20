import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

/**
 * Hook to fetch and manage the authenticated user's profile.
 * Wraps GET /api/profile and PUT /api/profile.
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  /**
   * Fetch the authenticated user's profile from the backend.
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/profile');
      if (res.status === 'success' && res.data?.user) {
        setProfile(res.data.user);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update the authenticated user's profile.
   * @param {Object} updates - Partial profile fields to update.
   * @returns {Object} Updated user data.
   */
  const updateProfile = useCallback(async (updates) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.status === 'success' && res.data?.user) {
        setProfile(res.data.user);
        setSuccessMsg('Profile updated successfully');
        return res.data.user;
      }
      throw new Error(res.message || 'Update failed');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    successMsg,
    fetchProfile,
    updateProfile,
    setError,
    setSuccessMsg,
  };
};
