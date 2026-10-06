import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [customerDemoLoading, setCustomerDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target destination after successful login
  const redirectPath = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await login(email.trim(), password);

      if (res.success) {
        if (res.user.role === 'admin') {
          success('Welcome back, ClickCart Admin!');
          navigate(redirectPath || '/admin/dashboard');
        } else {
          success(`Welcome back, ${res.user.name}!`);
          navigate(redirectPath || '/orders');
        }
      }
    } catch (err) {
      console.error('Login submission error:', err);
      const msg = err.message || 'Invalid email or password.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * One-Tap Demo Admin Login
   * Automatically submits admin@clickcart.com / ClickCart@123 via real authentication API
   */
  const handleDemoAdminLogin = async () => {
    try {
      setDemoLoading(true);
      setErrorMessage('');
      setEmail('admin@clickcart.com');
      setPassword('ClickCart@123');

      const res = await login('admin@clickcart.com', 'ClickCart@123');

      if (res.success) {
        success('Welcome back, ClickCart Admin!');
        navigate(redirectPath || '/admin/dashboard');
      }
    } catch (err) {
      console.error('Demo admin login error:', err);
      const msg = err.message || 'Demo admin authentication failed. Please verify server connection.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  /**
   * One-Tap Demo Customer Login for testing role restrictions
   */
  const handleDemoCustomerLogin = async () => {
    try {
      setCustomerDemoLoading(true);
      setErrorMessage('');
      setEmail('customer@clickcart.com');
      setPassword('Customer@123');

      const res = await login('customer@clickcart.com', 'Customer@123');

      if (res.success) {
        success(`Welcome back, ${res.user.name}!`);
        navigate(redirectPath || '/orders');
      }
    } catch (err) {
      console.error('Demo customer login error:', err);
      const msg = err.message || 'Demo customer authentication failed.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setCustomerDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <img 
              src="/logo-icon.svg" 
              alt="ClickCart" 
              className="w-9 h-9 transition-transform group-hover:scale-105" 
            />
            <span className="text-2xl font-bold tracking-tight text-brand-dark">
              Click<span className="text-brand-indigo">Cart</span>
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
            Sign in to ClickCart
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Shop in a click • Access your orders & management dashboard
          </p>
        </div>

        {/* Login Surface Card */}
        <div className="mt-6 bg-white py-8 px-5 sm:px-10 border border-brand-border rounded-card shadow-subtle space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-btn flex items-start gap-2.5 text-brand-error text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clickcart.com"
                  autoComplete="email"
                  required
                  disabled={loading || demoLoading || customerDemoLoading}
                  className="form-input text-xs pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-brand-dark">
                  Password
                </label>
                <span className="text-[11px] text-brand-muted">
                  Case sensitive
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading || demoLoading || customerDemoLoading}
                  className="form-input text-xs pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading || customerDemoLoading}
              className="btn-primary w-full text-xs py-2.5 font-semibold"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-brand-border w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-brand-muted uppercase tracking-wider absolute">
              or
            </span>
          </div>

          {/* ONE-TAP DEMO ADMIN LOGIN SECTION */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              disabled={loading || demoLoading || customerDemoLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-indigo/30 hover:border-brand-indigo hover:bg-indigo-50/40 text-brand-indigo font-semibold text-xs rounded-btn transition-all duration-150 shadow-subtle focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {demoLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-brand-indigo/30 border-t-brand-indigo rounded-full animate-spin" />
                  <span>Authenticating Demo Admin...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-brand-orange fill-brand-orange/20" />
                  <span>Continue as Demo Admin</span>
                </>
              )}
            </button>

            {/* Demo Credentials Reference Box */}
            <div className="p-3 bg-gray-50 border border-brand-border rounded-btn text-[11px] text-brand-muted space-y-1">
              <div className="flex items-center justify-between text-brand-dark font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>Demo Admin Account:</span>
                </span>
                <span className="font-mono text-xs text-brand-indigo">admin@clickcart.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Default Password:</span>
                <span className="font-mono text-gray-600">ClickCart@123</span>
              </div>
            </div>

            {/* Customer Demo Option */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleDemoCustomerLogin}
                disabled={loading || demoLoading || customerDemoLoading}
                className="text-[11px] font-medium text-gray-500 hover:text-brand-indigo transition-colors"
              >
                {customerDemoLoading ? 'Signing in customer...' : 'Need customer view? Click to test as Demo Customer'}
              </button>
            </div>
          </div>

          {/* Back to store navigation */}
          <div className="pt-2 border-t border-brand-border text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-dark transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue shopping without signing in</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
