import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import Unauthorized from '../pages/Unauthorized';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, user, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Verifying authentication session..." />
      </div>
    );
  }

  // Not logged in at all -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but lacks required administrator privilege
  if (requireAdmin && !isAdmin) {
    return <Unauthorized />;
  }

  return children;
};

export default ProtectedRoute;
