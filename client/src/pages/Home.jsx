import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Zap, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
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
        setError(err.message || 'Unable to load catalog data. Please check your backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading ClickCart Store..." />;
  }

  if (error) {
    return <ErrorMessage onRetry={() => window.location.reload()} message={error} />;
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-brand-bg pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-indigo-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-brand-indigo text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>Next-Gen E-Commerce Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-dark leading-[1.1]">
                Shop in a <span className="text-brand-indigo relative">click<span className="text-brand-orange">.</span></span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover authentic quality products, sync your cart seamlessly in real-time, and experience hassle-free checkout backed by reliable fulfillment.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Now</span>
                </Link>

                <Link
                  to="/products?view=categories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-brand-indigo bg-white border border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
                >
                  <span>Explore Categories</span>
                  <ChevronRight className="w-4 h-4 text-brand-indigo" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-success" />
                  Real-Time Stock
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-success" />
                  Secure MySQL Transactions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-success" />
                  Instant Printable Invoices
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md bg-white border border-brand-border rounded-3xl p-6 shadow-xl shadow-indigo-100/40 space-y-4">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <img src="/logo-icon.svg" alt="ClickCart Logo Icon" className="w-6 h-6" />
                    <span className="text-xs font-bold text-brand-dark">ClickCart Spotlight</span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full">
                    Live Demo
                  </span>
                </div>

                {/* Simulated Interactive Card */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80"
                    alt="Headphones"
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-semibold text-brand-indigo uppercase">Electronics</span>
                        <h4 className="text-sm font-bold text-brand-dark">Sony WH-1000XM5 ANC</h4>
                      </div>
                      <span className="text-sm font-extrabold text-brand-dark">₹24,990</span>
                    </div>

                    {/* Interactive Animated Cursor Trigger */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        ● 18 in Stock
                      </span>

                      <div className="relative">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-indigo shadow-xs">
                          Add to Cart
                        </span>
                        {/* Orange Cursor Click Indicator */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 pointer-events-none animate-bounce">
                          <svg viewBox="0 0 32 32" className="w-8 h-8 drop-shadow-md">
                            <path d="M6 2L6 22L12 17L17 28L21 26L16 15L23 15L6 2Z" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-medium">
                  <span>Fast, frictionless e-commerce at your fingertips.</span>
                  <Zap className="w-4 h-4 text-brand-orange" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo">
              Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mt-1">
              Shop by Category
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Browse {categories.length} curated product collections.
            </p>
          </div>
          
          <Link
            to="/products?view=categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-indigo hover:text-indigo-800 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.category_id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Curated Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mt-1">
              Featured Products
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Top trending items with verified real-time stock.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-indigo hover:text-indigo-800 transition-colors"
          >
            <span>Explore All 40+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-indigo/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Ready to Upgrade Your Shopping?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start shopping with ClickCart today.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Explore 8 categories, 40+ realistic products, dynamic tax calculations, and instant printable invoices.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-brand-dark bg-white hover:bg-gray-100 shadow-md transition-all active:scale-95"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 text-brand-indigo" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
