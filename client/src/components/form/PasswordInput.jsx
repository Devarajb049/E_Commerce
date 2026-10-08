import React, { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

/**
 * ClickCart Password Input with Accessible Visibility Toggle
 */
const PasswordInput = ({
  id,
  name = 'password',
  label = 'Password',
  placeholder = '••••••••••••',
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  autoComplete = 'current-password',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const hasError = Boolean(error);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-brand-dark tracking-tight"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      <div className="cc-input-wrap relative rounded-lg">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`
            cc-input-field w-full text-sm bg-white border rounded-lg transition-all
            pl-10 pr-10 py-2.5
            text-brand-dark placeholder-brand-muted/60
            ${disabled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : ''}
            ${hasError 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
              : 'border-brand-border hover:border-slate-300 focus:border-brand-primary focus:ring-1 focus:ring-indigo-100'
            }
          `}
          {...props}
        />

        {/* Animated Expanding Bottom Accent Line */}
        <div className={`cc-input-accent ${hasError ? 'cc-input-error' : ''}`} />

        {/* Password Visibility Toggle Button */}
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-muted hover:text-brand-dark transition-colors focus:outline-none focus-visible:text-brand-primary"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Error / Helper Text */}
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${inputId}-help`} className="text-xs text-brand-muted mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
