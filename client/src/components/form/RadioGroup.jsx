import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ClickCart Semantic Radio Group
 * Wraps radio options in fieldset/legend for accessibility
 */
const RadioGroup = ({
  name,
  value,
  onChange,
  label = '',
  description = '',
  error = '',
  helperText = '',
  children,
  className = '',
  orientation = 'vertical', // 'vertical' | 'horizontal' | 'grid'
}) => {
  const orientationClasses = {
    vertical: 'flex flex-col space-y-2.5',
    horizontal: 'flex flex-row flex-wrap gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-3'
  };

  return (
    <fieldset className={`space-y-2 ${className}`}>
      {label && (
        <legend className="block text-xs font-semibold text-brand-dark tracking-tight mb-1">
          {label}
        </legend>
      )}

      {description && (
        <p className="text-xs text-brand-muted mb-2">
          {description}
        </p>
      )}

      <div className={orientationClasses[orientation] || orientationClasses.vertical}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            name: child.props.name || name,
            checked: child.props.checked !== undefined ? child.props.checked : child.props.value === value,
            onChange: child.props.onChange || onChange,
          });
        })}
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-brand-muted mt-1">
          {helperText}
        </p>
      )}
    </fieldset>
  );
};

export default RadioGroup;
