import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'admin') {
    return <>{children}</>;
  }

  return <Navigate to="/institute/login" replace />;
}
