import React from 'react';
import { Navigate } from 'react-router-dom';

export const HomeRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};
