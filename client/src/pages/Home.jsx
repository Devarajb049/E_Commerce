import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { ProductSkeletonGrid } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ sort: 'newest' })
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (prodRes.success) setFeaturedProducts(prodRes.data.slice(0, 8));
      } catch (err) {
        console.error('Home page loading error:', err);
        setError(err.message || 'Unable to load catalog data. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (error) {
    return <ErrorMessage onRetry={() => window.location.reload()} message={error} />;
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. BALANCED HERO SECTION */}
      <section className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Value Proposition */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-btn text-brand-indigo text-xs font-bold uppercase tracking-wider">
                Retail Cart & Order Platform
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
                Shop smarter. <br />
                <span className="text-brand-indigo">Shop in a click.</span>
              </h1>

              <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover quality electronics, accessories, and essentials. Real-time stock counts, instant checkout, and verified order tracking.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/products"
                  className="w-full sm:w-auto btn-primary py-3 px-6"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </Link>

                <Link
                  to="/products?view=categories"
                  className="w-full sm:w-auto btn-secondary py-3 px-6"
                >
                  <span>Explore Categories</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-brand-muted border-t border-gray-100">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  Verified Stock
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-indigo" />
                  Fast Dispatch
                </span>
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-brand-orange" />
                  Easy Returns
                </span>
              </div>
            </div>

            {/* Right: Clean Showcase Box */}
            <div className="lg:col-span-5">
              <div className="bg-brand-bg border border-brand-border rounded-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs font-semibold text-brand-dark">
                  <span>Featured Collection</span>
                  <span className="text-brand-indigo font-mono">42+ Items In Stock</span>
                </div>

                <div className="aspect-[4/3] w-full rounded-btn overflow-hidden bg-white border border-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="Premium Audio Collection"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="font-bold text-brand-dark block">Sony WH-1000XM5 ANC</span>
                    <span className="text-gray-500">Wireless Noise-Canceling</span>
                  </div>
                  <Link
                    to="/products/1"
                    className="font-bold text-brand-indigo hover:underline inline-flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Browse {categories.length} organized product collections.
            </p>
          </div>
          
          <Link
            to="/products?view=categories"
            className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.category_id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Popular items ready for immediate dispatch.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. CONCISE CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-brand-border rounded-card p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-subtle">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-brand-dark">
              Ready to explore the full ClickCart catalog?
            </h3>
            <p className="text-xs text-brand-muted max-w-lg">
              Explore 8 departments, review stock in real time, and generate printable invoices instantly.
            </p>
          </div>

          <Link to="/products" className="btn-primary flex-shrink-0">
            <span>Browse All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
