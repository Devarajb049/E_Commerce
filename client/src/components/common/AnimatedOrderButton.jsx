import React from 'react';
import { ArrowRight, Loader2, Check, ShoppingBag } from 'lucide-react';

/**
 * ClickCart Production-Grade Animated Order Button
 * Micro-interactions: Traveling orange accent line, icon nudge, tactile active scale,
 * loading spinner, and order success confirmation.
 */
const AnimatedOrderButton = ({
  text = 'Order Now',
  loadingText = 'Processing...',
  successText = 'Order Placed',
  onClick,
  disabled = false,
  loading = false,
  isSuccess = false,
  type = 'button',
  icon: CustomIcon = ArrowRight,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  variant = 'primary', // 'primary' | 'accent' | 'outline'
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 px-3.5 text-xs rounded-lg gap-1.5',
    md: 'py-2.5 px-5 text-sm rounded-lg gap-2',
    lg: 'py-3.5 px-6 text-base rounded-xl gap-2.5 font-semibold'
  };

  const variantClasses = {
    primary: 'cc-btn-ordernow',
    accent: 'bg-brand-accent hover:bg-orange-600 text-white shadow-sm active:scale-[0.98] transition-all',
    outline: 'border border-brand-primary text-brand-primary hover:bg-indigo-50 active:scale-[0.98] transition-all'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading || isSuccess}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center font-medium tracking-tight select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* State: Loading */}
      {loading && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
          <span>{loadingText}</span>
        </>
      )}

      {/* State: Success */}
      {!loading && isSuccess && (
        <>
          <Check className="w-4 h-4 text-emerald-300 flex-shrink-0 stroke-[2.5]" />
          <span>{successText}</span>
        </>
      )}

      {/* State: Default */}
      {!loading && !isSuccess && (
        <>
          <span>{text}</span>
          {CustomIcon && (
            <CustomIcon className="w-4 h-4 cc-icon-nudge flex-shrink-0" />
          )}
        </>
      )}
    </button>
  );
};

export default AnimatedOrderButton;
