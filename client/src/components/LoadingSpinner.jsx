import React from 'react';
import { MorphingInfinity } from './MorphingInfinity';

export { MorphingInfinity };

/**
 * ClickCart Brand Loader with Morphing Infinity Animation
 */
export const LoadingSpinner = ({
  message = 'Loading...',
  fullScreen = false,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size] || 'w-10 h-10';

  const content = (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
      <MorphingInfinity className={`${sizeClasses} text-[#4F46E5] drop-shadow-xs`} />
      {message && (
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em] select-none">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-brand-border rounded-[12px] p-3.5 space-y-3">
          <div className="aspect-square w-full rounded-[10px] skeleton-shimmer" />
          <div className="space-y-2 pt-1">
            <div className="h-3 w-1/3 skeleton-shimmer rounded" />
            <div className="h-4 w-4/5 skeleton-shimmer rounded" />
            <div className="h-3 w-2/3 skeleton-shimmer rounded" />
          </div>
          <div className="pt-3 flex justify-between items-center border-t border-gray-100">
            <div className="h-5 w-16 skeleton-shimmer rounded" />
            <div className="h-8 w-24 skeleton-shimmer rounded-[8px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden">
      <div className="p-4 border-b border-brand-border bg-gray-50/60 flex items-center justify-between">
        <div className="h-4 w-36 skeleton-shimmer rounded" />
        <div className="h-4 w-20 skeleton-shimmer rounded" />
      </div>
      <div className="divide-y divide-gray-100 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 skeleton-shimmer rounded" />
            <div className="h-4 w-1/6 skeleton-shimmer rounded" />
            <div className="h-4 w-1/6 skeleton-shimmer rounded" />
            <div className="h-4 w-1/5 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
