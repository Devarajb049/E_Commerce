import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ChevronRight,
  Headphones,
  Tag,
  BadgePercent,
  Sparkles,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import SuperSaleCountdown from '../components/home/SuperSaleCountdown';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'ClickKart | Shop in a Click';

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catRes, saleRes, recentRes, featuredRes] = await Promise.all([
          api.getCategories(),
          api.getSaleProducts(),
          api.getProducts({ sort: 'newest' }),
          api.getFeaturedProducts()
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (saleRes.success) setTopDeals(saleRes.data.slice(0, 4));
        if (recentRes.success) {
          setRecentlyAdded(recentRes.data.slice(0, 4));
          setFeaturedProducts(
            featuredRes.success && featuredRes.data.length > 0
              ? featuredRes.data.slice(0, 4)
              : recentRes.data.slice(4, 8)
          );
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

      {/* 1. SUPER SALE HERO BANNER */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden border-b border-indigo-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <BadgePercent className="w-3.5 h-3.5" />
                <span>ClickKart Super Sale</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight sm:leading-none">
                Everything You Need, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                  Just a Click Away.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover your favorite products, explore exciting offers, and enjoy a convenient shopping experience with ClickKart.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/super-sale"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-white bg-brand-orange hover:bg-orange-600 shadow-elevated transition-all active:scale-[0.98]"
                >
                  <Tag className="w-4 h-4" />
                  <span>Shop Super Deals</span>
                </Link>

                <Link
                  to="/categories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all active:scale-[0.98]"
                >
                  <Layers className="w-4 h-4 text-brand-indigo" />
                  <span>Explore Categories</span>
                </Link>
              </div>

              {/* Countdown Component */}
              <div className="pt-4 flex justify-center lg:justify-start">
                <SuperSaleCountdown />
              </div>
            </div>

            {/* Right Product Spotlight Image Showcase */}
            <div className="lg:col-span-5 hidden sm:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-tr from-indigo-800/40 to-slate-800/40 p-6 border border-indigo-700/30 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xs">
                <img
                  src="https://m.media-amazon.com/images/I/61NPnmrjKwL._SX679_.jpg"
                  alt="Super Sale Spotlight"
                  className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-normal"
                />
                <div className="absolute -bottom-3 bg-white text-slate-900 py-1.5 px-4 rounded-full shadow-elevated border border-slate-100 flex items-center gap-2 text-xs font-bold">
                  <BadgePercent className="w-4 h-4 text-brand-orange" />
                  <span>Up to 34% OFF Verified Deals</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. OFFER STRIP (Real Store Benefits) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-6 shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-center sm:text-left">

          <div className="flex items-center justify-center sm:justify-start gap-3 px-2 py-1">
            <div className="p-2.5 rounded-xl bg-orange-50 text-brand-orange flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-dark">Special Offers</h4>
              <p className="text-[11px] text-brand-muted">On selected genuine products</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 px-2 py-1">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-dark">Secure Checkout</h4>
              <p className="text-[11px] text-brand-muted">Encrypted commercial orders</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 px-2 py-1">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-brand-indigo flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-dark">Order Tracking</h4>
              <p className="text-[11px] text-brand-muted">Live dispatch and updates</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 px-2 py-1">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-dark">Customer Support</h4>
              <p className="text-[11px] text-brand-muted">Dedicated retail assistance</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TODAY'S TOP DEALS SECTION */}
      {topDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-brand-orange" />
                <span>Today's Top Deals</span>
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Discover featured products and offers with verified discount pricing.
              </p>
            </div>

            <Link
              to="/super-sale"
              className="text-xs sm:text-sm font-semibold text-brand-orange hover:text-orange-600 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {topDeals.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. SHOP BY CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-indigo" />
              <span>Shop by Category</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Explore categories curated directly from the ClickKart warehouse.
            </p>
          </div>

          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CategoryGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id || cat.category_id}
                to={`/categories/${cat.slug || cat.id}`}
                className="group bg-white border border-brand-border rounded-xl p-4 text-center shadow-subtle hover:shadow-elevated hover:border-brand-indigo/40 hover:-translate-y-1 transition-all flex flex-col items-center justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-brand-indigo group-hover:scale-110 transition-transform mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark group-hover:text-brand-indigo transition-colors line-clamp-1">
                    {cat.name || cat.category_name}
                  </h4>
                  <span className="text-[10px] text-brand-muted block mt-0.5">
                    {cat.product_count !== undefined ? `${cat.product_count} items` : 'Explore'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
                Featured Products
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Popular selections chosen for quality, performance, and customer satisfaction.
              </p>
            </div>

            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. RECENTLY ADDED SECTION */}
      {recentlyAdded.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
                Recently Added
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Fresh arrivals just added to our retail catalog.
              </p>
            </div>

            <Link
              to="/products?sort=newest"
              className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors"
            >
              <span>View All New</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyAdded.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
