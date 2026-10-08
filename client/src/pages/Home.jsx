import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
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
        if (prodRes.success) {
          setFeaturedProducts(prodRes.data.slice(0, 8));
          // Use high-stock products for best sellers showcase
          setBestSellers(prodRes.data.slice(8, 12));
        }
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
    <div className="space-y-12 sm:space-y-16 pb-16 page-transition">
      
      {/* 1. BALANCED HERO SECTION (Rules #15 & #29) */}
      <section className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Subtle staggered entrance animation */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Badge */}
              <div className="animate-pop-in">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-[8px] text-brand-indigo text-xs font-semibold tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo" />
                  Direct Retail Catalog
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-brand-dark tracking-tight leading-[1.18]">
                Shop smarter. <br />
                <span className="text-brand-indigo">Shop in a click.</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover quality electronics, accessories, apparel, and lifestyle essentials with instant stock checks and verified order tracking.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/products"
                  className="w-full sm:w-auto btn-primary py-3 px-6 shadow-subtle active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </Link>

                <Link
                  to="/products?view=categories"
                  className="w-full sm:w-auto btn-secondary py-3 px-6 active:scale-[0.98]"
                >
                  <span>Explore Categories</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-brand-muted border-t border-gray-100">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  Verified Stock
                </span>
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <Truck className="w-4 h-4 text-brand-indigo" />
                  Fast Dispatch
                </span>
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <RotateCcw className="w-4 h-4 text-brand-orange" />
                  Easy Returns
                </span>
              </div>
            </div>

            {/* Right Column: Clean Product Visual Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-brand-bg border border-brand-border rounded-[12px] p-5 space-y-4 shadow-subtle hover:shadow-elevated transition-shadow duration-normal">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs font-semibold text-brand-dark">
                  <span>Spotlight Product</span>
                  <span className="text-brand-indigo font-mono text-[11px] bg-indigo-50 px-2 py-0.5 rounded">
                    42 Items Catalog
                  </span>
                </div>

                <div className="aspect-[4/3] w-full rounded-[10px] overflow-hidden bg-white border border-gray-200 group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="Sony WH-1000XM5 Wireless Headphones"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-normal"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="font-bold text-brand-dark text-sm block">Sony WH-1000XM5</span>
                    <span className="text-brand-muted text-[11px]">Noise-Canceling Wireless • ₹24,990</span>
                  </div>
                  <Link
                    to="/products/1"
                    className="btn-outline-indigo text-xs py-1.5 px-3"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION (Rule #28 & #30) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Browse organized product departments.
            </p>
          </div>
          
          <Link
            to="/products?view=categories"
            className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors duration-fast"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CategoryGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat.category_id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS (Rule #28 & #31: 4 columns desktop, 3 tablet, 2 mobile) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Top curated items ready for immediate dispatch.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors duration-fast"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. BEST SELLERS SECTION (Rule #28) */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
                Popular Products
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Customer favorites across computer accessories, footwear, and apparel.
              </p>
            </div>

            <Link
              to="/products?sort=price_desc"
              className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors duration-fast"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. VALUE PROPOSITION SECTION (Rule #28: Simple Value Proposition) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-brand-border rounded-[12px] p-6 sm:p-10 shadow-subtle grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-dark">Instant Cart & Checkout</h4>
              <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
                Streamlined ordering with real-time stock validation and atomic database reservation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-[8px] bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-dark">Commercial Invoices</h4>
              <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
                Every purchase generates a printable, compliant GST invoice with full itemized breakdown.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-[8px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-dark">Control Center</h4>
              <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
                Comprehensive admin management for orders, inventory adjustments, and category analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
