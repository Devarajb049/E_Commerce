import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = null,
  title = 'No items found',
  message,
  description,
  actionLabel,
  actionText,
  actionLink = '/products',
  onActionClick = null,
  onAction = null,
  showAction = true
}) => {
  const displayDesc = description || message || 'We could not find anything matching your request.';
  const displayLabel = actionText || actionLabel || 'Explore Products';
  const handleAction = onAction || onActionClick;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-card bg-gray-100 border border-brand-border flex items-center justify-center mb-3.5 text-gray-400">
        {Icon ? (
          <Icon className="w-6 h-6 text-gray-400" />
        ) : (
          <img 
            src="/logo-icon.svg" 
            alt="ClickCart Empty" 
            className="w-7 h-7 opacity-40 grayscale" 
          />
        )}
      </div>

      <h3 className="text-sm font-bold text-brand-dark mb-1">
        {title}
      </h3>
      
      <p className="text-xs text-brand-muted leading-relaxed mb-4">
        {displayDesc}
      </p>

      {showAction && (
        handleAction ? (
          <button
            onClick={handleAction}
            className="btn-primary text-xs py-2 px-3.5"
          >
            {displayLabel}
          </button>
        ) : actionLink ? (
          <Link
            to={actionLink}
            className="btn-primary text-xs py-2 px-3.5"
          >
            {displayLabel}
          </Link>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
