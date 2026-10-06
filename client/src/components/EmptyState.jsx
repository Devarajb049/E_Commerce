import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title = 'No items found',
  message = 'We could not find anything matching your request.',
  actionLabel = 'Explore Products',
  actionLink = '/products',
  onActionClick = null,
  showAction = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      {/* ClickCart Vector Icon Illustration */}
      <div className="w-20 h-20 rounded-3xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
        <img 
          src="/logo-icon.svg" 
          alt="ClickCart Empty" 
          className="w-12 h-12 object-contain opacity-80" 
        />
      </div>

      <h3 className="text-xl font-bold text-brand-dark mb-2 tracking-tight">
        {title}
      </h3>
      
      <p className="text-sm text-brand-muted leading-relaxed mb-6">
        {message}
      </p>

      {showAction && (
        onActionClick ? (
          <button
            onClick={onActionClick}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        ) : (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 active:scale-[0.98]"
          >
            {actionLabel}
          </Link>
        )
      )}
    </div>
  );
};

export default EmptyState;
