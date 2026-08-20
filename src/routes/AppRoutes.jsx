import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SkillsPage } from '../pages/SkillsPage';
import { SessionsPage } from '../pages/SessionsPage';
import { SessionRequestPage } from '../pages/SessionRequestPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';

import { ProtectedRoute } from '../components/routes/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/sessions/request" element={<SessionRequestPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};
