import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />; // Redirigir a vista segura si no es su rol
  }

  return <Outlet />;
};
