import React from 'react';

/**
 * ClickCart Interactive Selection Card (Large Radio Variant)
 * Whole card is clickable, keyboard accessible, with clean Indigo selected styling.
 */
const SelectionCard = ({
  name,
  value,
  label,
  description = '',
  checked = false,
  onChange,
  disabled = false,
  icon: Icon = null,
  badge = null,
  priceTag = null,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`
        cc-selection-card relative flex items-start gap-3.5 p-4 rounded-xl border transition-all select-none
        ${checked ? 'selected' : 'border-brand-border bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
        ${className}
      `}
    >
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

      {/* Icon */}
      {Icon && (
        <div className={`p-2 rounded-lg flex-shrink-0 ${checked ? 'bg-indigo-100 text-brand-primary' : 'bg-slate-100 text-brand-muted'}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${checked ? 'text-brand-dark' : 'text-slate-800'}`}>
              {label}
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {badge}
              </span>
            )}
          </div>
          {priceTag && (
            <span className="text-xs font-bold text-brand-dark">
              {priceTag}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
};

export default SelectionCard;
