import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import AnimatedOrderButton from '../components/common/AnimatedOrderButton';

/**
 * ClickCart Production-Grade Registration Page
 * Clean card styling, floating accent lines, password match validation,
 * and seamless customer account creation.
 */
const Register = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        password
      });

      if (res.success) {
        success('Account created successfully! Signing you in...');
        // Automatically login the newly created user
        await login(email.trim(), password);
        navigate('/orders');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err.message || 'Could not register account. Please try again.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 page-transition">
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
            Create Your Account
          </h1>
          <p className="text-xs text-brand-muted">
            Join ClickCart for seamless orders, saved addresses, and live tracking.
          </p>
        </div>

        {/* Server Error Notice */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium animate-pop-in">
            {serverError}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            placeholder="Priya Patel"
            required
            autoComplete="name"
            icon={User}
            error={errors.name}
          />

          <FormInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            placeholder="priya@example.com"
            required
            autoComplete="email"
            icon={Mail}
            error={errors.email}
          />

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
            }}
            placeholder="Min. 6 characters"
            required
            autoComplete="new-password"
            error={errors.password}
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <div className="pt-2">
            <AnimatedOrderButton
              type="submit"
              text="Create Account"
              loadingText="Registering..."
              loading={loading}
              fullWidth
              size="md"
            />
          </div>
        </form>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Encrypted with bcrypt password hashing</span>
        </div>

        {/* Link to Login */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-brand-primary hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
