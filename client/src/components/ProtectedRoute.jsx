import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

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
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="card-surface max-w-md w-full p-8 text-center shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-brand-warning border border-amber-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-brand-dark">
              Administrator Privileges Required
            </h2>
            <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
              You are signed in as <span className="font-semibold text-brand-dark">{user?.email}</span> (Role: <span className="uppercase text-amber-700 font-bold">{user?.role}</span>). This management portal is strictly restricted to administrator accounts.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              to="/"
              className="btn-secondary text-xs w-full sm:w-auto py-2 px-4 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>

            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="btn-primary text-xs w-full sm:w-auto py-2 px-4 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
