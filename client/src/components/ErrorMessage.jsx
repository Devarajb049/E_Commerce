import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = "We couldn't complete that request. Please try again.",
  onRetry = null,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-red-50/70 border border-red-200 rounded-btn text-red-800 text-xs">
        <AlertCircle className="w-4 h-4 text-brand-error flex-shrink-0" />
        <span className="flex-1 font-medium">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 bg-white border border-red-200 rounded-btn text-[11px] font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-btn bg-red-50 border border-red-100 flex items-center justify-center text-brand-error mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-brand-dark mb-1">
        {title}
      </h3>
      
      <p className="text-xs text-brand-muted mb-5 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
