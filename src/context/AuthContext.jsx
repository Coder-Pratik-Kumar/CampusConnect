import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state by verifying token with backend GET /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/auth/me');
        if (res.status === 'success' && res.data?.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          // Token invalid or expired
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err.message);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Authenticate user with email and password (POST /api/auth/login)
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 'success' && res.data?.token) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Register a new user account (POST /api/auth/register)
   */
  const register = async (userData) => {
    setError(null);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (res.status === 'success') {
        return res.data;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Logout current user, clear token, and reset state
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
