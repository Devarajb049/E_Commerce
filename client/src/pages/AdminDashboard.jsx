import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Layers, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
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
      <AdminLayout title="Dashboard" subtitle="System analytics and overview">
        <LoadingSpinner fullScreen message="Loading database metrics..." />
      </AdminLayout>
    );
  }

  if (error || !summary) {
    return (
      <AdminLayout title="Dashboard" subtitle="System analytics and overview">
        <ErrorMessage message={error || 'Failed to load summary'} onRetry={() => window.location.reload()} />
      </AdminLayout>
    );
  }

  const maxCatSales = categorySales.length > 0 
    ? Math.max(...categorySales.map((c) => c.total_sales || 0), 1) 
    : 1;

  const headerActions = (
    <div className="flex items-center gap-2">
      <Link to="/admin/products" className="btn-primary text-xs py-2 px-3">
        Manage Catalog
      </Link>
      <Link to="/admin/orders" className="btn-secondary text-xs py-2 px-3">
        View Orders
      </Link>
    </div>
  );

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Real-time metrics calculated via MySQL queries"
      actions={headerActions}
    >
      {/* 4 PRIMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-brand-border rounded-card p-4 sm:p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <p className="text-xl font-extrabold text-brand-dark mt-1">
              {formatCurrency(summary.total_sales)}
            </p>
            <span className="text-[11px] text-brand-success font-medium">Confirmed orders</span>
          </div>
          <div className="w-10 h-10 rounded-btn bg-green-50 border border-green-100 flex items-center justify-center text-brand-success">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-card p-4 sm:p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Orders
            </span>
            <p className="text-xl font-extrabold text-brand-dark mt-1">
              {summary.total_orders}
            </p>
            <span className="text-[11px] text-brand-indigo font-medium">All-time count</span>
          </div>
          <div className="w-10 h-10 rounded-btn bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-card p-4 sm:p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Catalog Items
            </span>
            <p className="text-xl font-extrabold text-brand-dark mt-1">
              {summary.total_products}
            </p>
            <span className="text-[11px] text-gray-500">Active in store</span>
          </div>
          <div className="w-10 h-10 rounded-btn bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-card p-4 sm:p-5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Categories
            </span>
            <p className="text-xl font-extrabold text-brand-dark mt-1">
              {summary.total_categories}
            </p>
            <span className="text-[11px] text-gray-500">Departments</span>
          </div>
          <div className="w-10 h-10 rounded-btn bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 4 SECONDARY ALERT STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-brand-border rounded-btn p-3.5 shadow-subtle">
          <span className="text-[11px] text-gray-500 font-medium block">Today's Sales</span>
          <p className="text-base font-bold text-brand-dark mt-0.5">
            {formatCurrency(summary.today_sales)}
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-btn p-3.5 shadow-subtle">
          <span className="text-[11px] text-gray-500 font-medium block">Today's Orders</span>
          <p className="text-base font-bold text-brand-dark mt-0.5">
            {summary.today_orders} orders
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-btn p-3.5 shadow-subtle">
          <span className="text-[11px] text-gray-500 font-medium block">Low Stock Alert</span>
          <p className="text-base font-bold text-brand-warning mt-0.5 flex items-center gap-1">
            <span>{summary.low_stock_products} items</span>
            <span className="text-[10px] text-gray-400 font-normal">(≤15)</span>
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-btn p-3.5 shadow-subtle">
          <span className="text-[11px] text-gray-500 font-medium block">Pending Orders</span>
          <p className="text-base font-bold text-brand-indigo mt-0.5">
            {summary.pending_orders} pending
          </p>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Category Revenue Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-brand-dark">
                Revenue by Category
              </h3>
              <p className="text-[11px] text-brand-muted">
                Calculated via SQL <code className="text-brand-indigo">GROUP BY category_id</code>
              </p>
            </div>

            <Link to="/admin/reports" className="text-xs font-semibold text-brand-indigo hover:underline inline-flex items-center gap-1">
              <span>Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {categorySales.map((cat) => {
              const pct = maxCatSales > 0 ? (cat.total_sales / maxCatSales) * 100 : 0;
              return (
                <div key={cat.category_id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-dark">{cat.category_name}</span>
                    <span className="text-gray-500">
                      {formatCurrency(cat.total_sales)} ({cat.total_units_sold} units)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-indigo rounded-full"
                      style={{ width: `${Math.max(pct, cat.total_sales > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Products (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-brand-dark">
              Top Products
            </h3>
            <Link to="/admin/products" className="text-xs font-semibold text-brand-indigo hover:underline">
              Inventory
            </Link>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No purchases recorded yet. Place orders to populate top products.
              </p>
            ) : (
              topProducts.map((p, index) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between p-2.5 rounded-btn bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <span className="font-semibold text-brand-dark block truncate">
                        {p.product_name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Stock: {p.stock_quantity}
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
    </AdminLayout>
  );
};

export default AdminDashboard;
