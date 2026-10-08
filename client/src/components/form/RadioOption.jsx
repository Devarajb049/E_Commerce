import React from 'react';

/**
 * ClickCart Semantic Radio Option
 */
const RadioOption = ({
  name,
  value,
  label,
  description = '',
  checked = false,
  onChange,
  disabled = false,
  icon: Icon = null,
  badge = null,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`
        relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none
        ${checked 
          ? 'border-brand-primary bg-indigo-50/50 shadow-sm ring-1 ring-brand-primary' 
          : 'border-brand-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
        ${className}
      `}
    >
      {/* Hidden Accessible Native Radio */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* Styled Radio Circle */}
      <div
        className={`
          w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
          ${checked ? 'border-brand-primary bg-brand-primary' : 'border-slate-300 bg-white'}
        `}
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`w-4 h-4 ${checked ? 'text-brand-primary' : 'text-brand-muted'}`} />}
            <span className={`text-sm font-medium ${checked ? 'text-brand-dark' : 'text-slate-700'}`}>
              {label}
            </span>
          </div>
          {badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-brand-primary">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
};

export default RadioOption;
