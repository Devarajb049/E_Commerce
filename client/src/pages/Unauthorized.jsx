import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ClickCart 403 Access Restricted Page
 */
const Unauthorized = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white border border-brand-border max-w-md w-full p-8 rounded-2xl text-center shadow-subtle space-y-5">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
            Error 403
          </span>
          <h1 className="text-2xl font-bold text-brand-dark mt-1">
            Access Restricted
          </h1>
          <p className="text-sm text-brand-muted mt-2 leading-relaxed">
            You don't have permission to access this page. This area is reserved for authorized administrative operations.
          </p>
          {user && (
            <p className="text-xs text-slate-500 mt-2 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">
              Signed in as <span className="font-semibold text-brand-dark">{user.email}</span> (Role: <span className="uppercase font-bold text-slate-700">{user.role}</span>)
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto py-2.5 px-5 text-sm font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full sm:w-auto py-2.5 px-4 text-sm font-medium rounded-lg border border-brand-border bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
