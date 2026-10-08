import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * ClickCart Production-Grade Animated Form Input
 * Focus indicator with smooth bottom accent expansion and validation feedback.
 */
const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = '',
  success = false,
  helperText = '',
  icon: Icon = null,
  autoComplete = 'off',
  className = '',
  ...props
}) => {
  const inputId = id || name;
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-brand-dark tracking-tight"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="cc-input-wrap relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
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
            ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5
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

        {/* Status Indicators */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}

        {success && !hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Error / Helper Text */}
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
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

export default FormInput;
