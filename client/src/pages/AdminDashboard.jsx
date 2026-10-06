import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import AdminNav from '../components/AdminNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [sumRes, catRes, prodRes] = await Promise.all([
          api.getSummary(),
          api.getSalesByCategory(),
          api.getTopProducts()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (catRes.success) setCategorySales(catRes.data);
        if (prodRes.success) setTopProducts(prodRes.data.slice(0, 5));
      } catch (err) {
        console.error('Admin dashboard error:', err);
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  if (loading) {
    return (
      <div>
        <AdminNav />
        <LoadingSpinner fullScreen message="Loading ClickCart analytics from MySQL..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminNav />
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Calculate highest category sales for relative progress bar widths
  const maxCatSales = categorySales.length > 0 
    ? Math.max(...categorySales.map((c) => c.total_sales || 0), 1) 
    : 1;

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              Executive Business Overview
            </h2>
            <p className="text-sm text-brand-muted">
              Live database metrics calculated using MySQL aggregate queries (SUM, COUNT, GROUP BY).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2 bg-brand-indigo text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Manage Catalog
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* PRIMARY 4 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Total Revenue
              </span>
              <p className="text-2xl font-extrabold text-brand-dark mt-1">
                {formatCurrency(summary.total_sales)}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                Confirmed Orders
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Total Orders
              </span>
              <p className="text-2xl font-extrabold text-brand-dark mt-1">
                {summary.total_orders}
              </p>
              <span className="text-[11px] text-brand-indigo font-semibold mt-1 inline-block">
                All-time Transactions
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-indigo flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Products */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Catalog Items
              </span>
              <p className="text-2xl font-extrabold text-brand-dark mt-1">
                {summary.total_products}
              </p>
              <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
                Active in Store
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Total Categories */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Categories
              </span>
              <p className="text-2xl font-extrabold text-brand-dark mt-1">
                {summary.total_categories}
              </p>
              <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
                Departments
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* SECONDARY 4 STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-brand-muted font-medium">Today's Sales</span>
            <p className="text-lg font-bold text-brand-dark mt-0.5">
              {formatCurrency(summary.today_sales)}
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-brand-muted font-medium">Today's Orders</span>
            <p className="text-lg font-bold text-brand-dark mt-0.5">
              {summary.today_orders} orders
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-muted font-medium">Low Stock Alert</span>
              {summary.low_stock_products > 0 && (
                <AlertTriangle className="w-3.5 h-3.5 text-brand-orange" />
              )}
            </div>
            <p className="text-lg font-bold text-brand-orange mt-0.5">
              {summary.low_stock_products} items (≤15)
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-muted font-medium">Pending Orders</span>
              {summary.pending_orders > 0 && (
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <p className="text-lg font-bold text-amber-600 mt-0.5">
              {summary.pending_orders} pending
            </p>
          </div>
        </div>

        {/* ANALYTICS SECTION: SALES BY CATEGORY & TOP PRODUCTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Category Sales Progress Bars (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-brand-dark">
                  Revenue Breakdown by Category
                </h3>
                <p className="text-xs text-brand-muted">
                  Aggregated with SQL <code className="text-indigo-600 font-mono">GROUP BY category_id</code>
                </p>
              </div>

              <Link
                to="/admin/reports"
                className="text-xs font-semibold text-brand-indigo hover:underline flex items-center gap-1"
              >
                <span>Full Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {categorySales.map((cat) => {
                const percentage = maxCatSales > 0 ? (cat.total_sales / maxCatSales) * 100 : 0;
                return (
                  <div key={cat.category_id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-brand-dark font-semibold">{cat.category_name}</span>
                      <span className="text-gray-600">
                        {formatCurrency(cat.total_sales)} ({cat.total_units_sold} units)
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-indigo rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, cat.total_sales > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Top Performing Products (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-brand-dark">
                  Top Performing Products
                </h3>
                <p className="text-xs text-brand-muted">
                  Calculated using SQL <code className="text-indigo-600 font-mono">SUM(quantity)</code>
                </p>
              </div>

              <Link
                to="/admin/products"
                className="text-xs font-semibold text-brand-indigo hover:underline"
              >
                Catalog
              </Link>
            </div>

            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-brand-muted text-center py-6">
                  No sales recorded yet. Place an order to see top-selling products here.
                </p>
              ) : (
                topProducts.map((p, index) => (
                  <div
                    key={p.product_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-brand-indigo font-bold flex items-center justify-center text-[10px]">
                        #{index + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-brand-dark block truncate">
                          {p.product_name}
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          Stock: {p.stock_quantity} • ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-brand-indigo block">
                        {p.total_quantity_sold} sold
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatCurrency(p.total_revenue)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
