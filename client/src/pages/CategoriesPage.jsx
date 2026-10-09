import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Package, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Categories | ClickKart';

    api.getCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load categories.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading categories..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-indigo uppercase tracking-wider mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>Product Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            All Categories
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Explore authentic merchandise curated across {categories.length} retail departments.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-brand-indigo-hover"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse All Products</span>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id || cat.category_id}
            to={`/categories/${cat.slug || cat.id}`}
            className="group bg-white border border-brand-border rounded-xl p-5 shadow-subtle hover:shadow-elevated hover:border-brand-indigo/40 hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-brand-indigo group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-brand-dark group-hover:text-brand-indigo transition-colors">
                  {cat.name || cat.category_name}
                </h3>
                <p className="text-xs text-brand-muted line-clamp-2 mt-1">
                  {cat.description || 'Authentic quality products available on ClickKart.'}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                {cat.product_count !== undefined ? `${cat.product_count} items` : 'Explore items'}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand-indigo group-hover:translate-x-1 transition-transform">
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
