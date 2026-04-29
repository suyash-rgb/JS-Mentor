import React from 'react';
import { Navigate } from 'react-router-dom';

export default function TrainerProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'trainer') {
    return <>{children}</>;
  }

  return <Navigate to="/institute/login" replace />;
}
