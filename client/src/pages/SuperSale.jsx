import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgePercent,
  ArrowLeft,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SuperSaleCountdown from '../components/home/SuperSaleCountdown';
import { ProductGridSkeleton } from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';

export default function SuperSale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Super Sale | ClickKart';

    api.getSaleProducts()
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to load Super Sale products.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-10 pb-16 page-transition">
      {/* Super Sale Campaign Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-indigo-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-brand-orange text-xs font-bold uppercase tracking-wider">
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Official Promotion • ClickKart Super Sale</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Big Deals. Better Prices. <span className="text-brand-orange">Happy Shopping.</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Explore genuine discounts on authentic electronics, accessories, and essentials. Verified retail prices with live inventory availability.
            </p>
          </div>

          <div>
            <SuperSaleCountdown />
          </div>
        </div>
      </section>

      {/* Main Campaign Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-orange" />
              <span>Verified Super Sale Deals ({products.length})</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Every discount below is mathematically substantiated against original list pricing.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-brand-indigo-hover"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View All Regular Catalog</span>
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-white border border-brand-border rounded-xl space-y-3">
            <Tag className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-brand-dark">No Active Sale Items Found</h3>
            <p className="text-xs text-brand-muted">
              Check back soon for new seasonal promotions and price drops.
            </p>
            <Link to="/products" className="inline-block py-2 px-4 rounded-lg bg-brand-indigo text-white text-xs font-semibold mt-2">
              Explore Regular Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id || prod.product_id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
