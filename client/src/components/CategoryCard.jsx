import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Layers } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category.category_id}`}
      className="group bg-white border border-brand-border rounded-card p-4 sm:p-5 hover:border-gray-300 hover:shadow-subtle transition-all flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-btn bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-brand-indigo flex-shrink-0">
          <Layers className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-brand-dark group-hover:text-brand-indigo transition-colors truncate">
            {category.category_name}
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            {category.product_count ?? 0} {category.product_count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="text-gray-400 group-hover:text-brand-indigo group-hover:translate-x-0.5 transition-all flex-shrink-0">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default CategoryCard;
