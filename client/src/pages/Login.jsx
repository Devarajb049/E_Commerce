import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, Mail, ArrowLeft, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import AnimatedOrderButton from '../components/common/AnimatedOrderButton';

/**
 * ClickCart Production-Grade Login Experience
 * Clean centered authentication card, floating accent line inputs, accessible password toggle,
 * remember me, and one-tap demo credentials calling the real IAM authentication API.
 */
const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [customerDemoLoading, setCustomerDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target destination after successful login
  const redirectPath = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email address and password.');
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
   * One-Tap Demo Admin Login:
   * Calls real /api/auth/login with admin@clickcart.com / ClickCart@123
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
      const msg = err.message || 'Demo admin authentication failed. Please check server status.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  /**
   * One-Tap Demo Customer Login:
   * Calls real /api/auth/login with customer@clickcart.com / Customer@123
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
      const msg = err.message || 'Demo customer authentication failed. Please check server status.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setCustomerDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-brand-dark">
              Click<span className="text-brand-primary">Cart</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-brand-dark">
            Sign In to ClickCart
          </h1>
          <p className="text-xs text-brand-muted">
            Access your orders, saved addresses, and profile.
          </p>
        </div>

        {/* Server / Validation Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium animate-pop-in">
            {errorMessage}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            autoComplete="email"
            icon={Mail}
          />

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
              />
              <span>Remember me</span>
            </label>

            <span className="text-brand-primary font-medium hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <div className="pt-2">
            <AnimatedOrderButton
              type="submit"
              text="Sign In"
              loadingText="Authenticating..."
              loading={loading}
              fullWidth
              size="md"
            />
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider text-slate-400">
            <span className="bg-white px-3 font-semibold">Or Instant Demo Access</span>
          </div>
        </div>

        {/* One-Tap Demo Access Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            disabled={demoLoading || loading || customerDemoLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 border border-amber-400 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <Zap className="w-4 h-4 fill-slate-900 text-slate-900" />
            )}
            <span>⚡ Continue as Demo Admin</span>
          </button>

          <button
            type="button"
            onClick={handleDemoCustomerLogin}
            disabled={demoLoading || loading || customerDemoLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-brand-primary border border-indigo-200 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {customerDemoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            ) : (
              <UserCheck className="w-4 h-4 text-brand-primary" />
            )}
            <span>Continue as Demo Customer</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-semibold text-brand-primary hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
