import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  UserCheck, 
  LogIn, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import AnimatedOrderButton from '../components/common/AnimatedOrderButton';

const Login = () => {
  const { login } = useAuth();
  const { mergeGuestCart } = useCart();
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

  useEffect(() => {
    document.title = 'Login | ClickKart';
  }, []);

  // Safe internal redirect parsing (Rule #5)
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const stateRedirect = location.state?.from?.pathname;
  const rawTarget = redirectParam || stateRedirect || null;
  const safeRedirectPath = rawTarget && rawTarget.startsWith('/') && !rawTarget.startsWith('//')
    ? rawTarget
    : null;

  const handlePostLoginNavigation = async (role) => {
    // 1. Synchronize / merge local guest cart items to the server-side database cart (Rule #6)
    try {
      if (mergeGuestCart) {
        await mergeGuestCart();
      }
    } catch (err) {
      console.warn('Cart sync notice after login:', err);
    }

    // 2. Navigate to intended destination
    if (safeRedirectPath) {
      navigate(safeRedirectPath, { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/cart', { replace: true });
    }
  };

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
        success(`Welcome back, ${res.user.name || 'Customer'}!`);
        await handlePostLoginNavigation(res.user.role);
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

  const handleDemoAdminLogin = async () => {
    try {
      setDemoLoading(true);
      setErrorMessage('');
      setEmail('admin@clickcart.com');
      setPassword('ClickCart@123');

      const res = await login('admin@clickcart.com', 'ClickCart@123');
      if (res.success) {
        success('Signed in as ClickKart Admin.');
        await handlePostLoginNavigation('admin');
      }
    } catch (err) {
      console.error('Demo admin login error:', err);
      const msg = err.message || 'Demo admin authentication failed.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoCustomerLogin = async () => {
    try {
      setCustomerDemoLoading(true);
      setErrorMessage('');
      setEmail('customer@clickcart.com');
      setPassword('Customer@123');

      const res = await login('customer@clickcart.com', 'Customer@123');
      if (res.success) {
        success(`Welcome back, ${res.user.name}!`);
        await handlePostLoginNavigation('customer');
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

  const registerLink = safeRedirectPath 
    ? `/register?redirect=${encodeURIComponent(safeRedirectPath)}` 
    : '/register';

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <img 
              src="/logo-icon.svg" 
              alt="ClickKart Logo" 
              className="w-8 h-8 transition-transform duration-fast group-hover:scale-105" 
            />
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-brand-dark block leading-none">
                Click<span className="text-brand-indigo">Kart</span>
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-brand-orange uppercase leading-none mt-0.5 block">
                Shop in a Click
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-brand-dark">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-brand-muted">
            Access your cart, live orders, saved addresses, and profile.
          </p>
        </div>

        {/* Server / Validation Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2 animate-pop-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
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
                className="rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo/20"
              />
              <span>Remember me</span>
            </label>

            <span className="text-brand-indigo font-medium hover:underline cursor-pointer">
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
            onClick={handleDemoCustomerLogin}
            disabled={demoLoading || loading || customerDemoLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-brand-indigo border border-indigo-200 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {customerDemoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-indigo" />
            ) : (
              <UserCheck className="w-4 h-4 text-brand-indigo" />
            )}
            <span>Continue as Demo Customer</span>
          </button>

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
            <span>Continue as Demo Admin</span>
          </button>
        </div>

        {/* Link to Register & Return to Shopping */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-center text-xs">
          <div className="text-slate-500">
            <span>Don't have an account? </span>
            <Link to={registerLink} className="font-semibold text-brand-indigo hover:underline">
              Create Account
            </Link>
          </div>

          <div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-1 font-medium text-slate-400 hover:text-brand-indigo transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Shopping</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
