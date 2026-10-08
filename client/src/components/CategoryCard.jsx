import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Layers, Smartphone, Laptop, Shirt, Footprints, Home, PenTool, Sparkles } from 'lucide-react';

const categoryIcons = {
  1: Layers, // Electronics
  2: Smartphone, // Mobile Accessories
  3: Laptop, // Computer Accessories
  4: Shirt, // Fashion & Apparel
  5: Footprints, // Footwear
  6: Home, // Home & Kitchen
  7: PenTool, // Stationery & Office
  8: Sparkles // Beauty & Personal Care
};

const CategoryCard = ({ category }) => {
  const IconComponent = categoryIcons[category.category_id] || Layers;

  return (
    <Link
      to={`/products?category=${category.category_id}`}
      className="group card-category p-4 sm:p-5 flex items-center justify-between gap-4 shadow-subtle hover:shadow-subtle"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-[8px] bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-brand-indigo flex-shrink-0 group-hover:bg-brand-indigo group-hover:text-white transition-colors duration-fast">
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-brand-dark group-hover:text-brand-indigo transition-colors duration-fast truncate">
            {category.category_name}
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            {category.product_count ?? 0} {category.product_count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="text-gray-400 group-hover:text-brand-indigo group-hover:translate-x-0.5 transition-all duration-fast flex-shrink-0">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default CategoryCard;
