import React from 'react';

/**
 * Professional Skeleton Loading Components (Rule #23)
 * Subtle shimmer effect matching the actual content structure
 */

export const Skeleton = ({ className = '' }) => {
  return <div className={`skeleton-shimmer rounded-[8px] ${className}`} />;
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden p-3.5 space-y-3">
      {/* Image thumbnail skeleton */}
      <div className="aspect-square w-full rounded-[10px] skeleton-shimmer" />

      {/* Info skeleton */}
      <div className="space-y-2 pt-1">
        <div className="h-3 w-1/3 skeleton-shimmer rounded" />
        <div className="h-4 w-4/5 skeleton-shimmer rounded" />
        <div className="h-3 w-2/3 skeleton-shimmer rounded" />
      </div>

      {/* Price & button row */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="h-5 w-20 skeleton-shimmer rounded" />
        <div className="h-8 w-24 skeleton-shimmer rounded-[8px]" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategoryCardSkeleton = () => {
  return (
    <div className="bg-white border border-brand-border rounded-[12px] p-4 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-[8px] skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-28 skeleton-shimmer rounded" />
        <div className="h-3 w-16 skeleton-shimmer rounded" />
      </div>
    </div>
  );
};

export const CategoryGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-brand-border bg-gray-50/60 flex items-center justify-between">
        <div className="h-4 w-36 skeleton-shimmer rounded" />
        <div className="h-4 w-20 skeleton-shimmer rounded" />
      </div>

      {/* Rows */}
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

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white border border-brand-border rounded-[12px] p-5 space-y-3">
      <div className="h-3 w-24 skeleton-shimmer rounded" />
      <div className="h-7 w-32 skeleton-shimmer rounded" />
      <div className="h-3 w-28 skeleton-shimmer rounded" />
    </div>
  );
};

export default {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CategoryCardSkeleton,
  CategoryGridSkeleton,
  TableSkeleton,
  StatCardSkeleton
};
