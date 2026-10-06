import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-indigo rounded-full animate-spin" />
      <p className="text-xs font-medium text-brand-muted tracking-wide">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white border border-brand-border rounded-card p-4 space-y-3 animate-pulse">
          <div className="aspect-square w-full bg-gray-100 rounded-btn" />
          <div className="space-y-2">
            <div className="w-16 h-3 bg-gray-100 rounded" />
            <div className="w-full h-4 bg-gray-100 rounded" />
            <div className="w-2/3 h-3 bg-gray-100 rounded" />
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-gray-50">
            <div className="w-16 h-5 bg-gray-100 rounded" />
            <div className="w-20 h-7 bg-gray-100 rounded-btn" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 items-center py-2 border-b border-gray-100">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="flex-1 h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
