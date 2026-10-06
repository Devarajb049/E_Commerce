import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category.category_id}`}
      className="group relative bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Decorative top-right accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-bl-full pointer-events-none group-hover:bg-indigo-100/60 transition-colors" />

      <div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-brand-indigo flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Layers className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-indigo transition-colors mb-1.5">
          {category.category_name}
        </h3>

        <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">
          {category.description || 'Discover handpicked products in this department.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
          {category.product_count ?? 0} {category.product_count === 1 ? 'Product' : 'Products'}
        </span>
        <span className="text-xs font-semibold text-brand-indigo flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Browse <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
