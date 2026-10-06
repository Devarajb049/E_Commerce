import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  title = 'Something went wrong.',
  message = "We couldn't complete that request. Please try again.",
  onRetry = null,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
        <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0" />
        <span className="flex-1 font-medium">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-white border border-red-300 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-100/50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-brand-error mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-brand-dark mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-brand-muted mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
