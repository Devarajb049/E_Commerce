import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sumRes, dayRes, topRes, ordRes, prodRes] = await Promise.all([
          api.getSummary(),
          api.getDailySales(),
          api.getTopProducts(),
          api.getOrders(),
          api.getProducts()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (dayRes.success) {
          // Sort ascending for chronological chart presentation
          const sortedDays = [...dayRes.data].reverse().slice(-7);
          setDailySales(sortedDays);
        }
        if (topRes.success) setTopProducts(topRes.data.slice(0, 5));
        if (ordRes.success) setRecentOrders(ordRes.data.slice(0, 5));
        if (prodRes.success) {
          const lowStock = prodRes.data
            .filter((p) => p.stock_quantity <= 15)
            .sort((a, b) => a.stock_quantity - b.stock_quantity)
            .slice(0, 5);
          setInventoryAlerts(lowStock);
        }
      } catch (err) {
        console.error('Admin dashboard loading error:', err);
        setError(err.message || 'Failed to load admin metrics from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      <AdminLayout title="Dashboard" subtitle="System analytics and store overview">
        <LoadingSpinner fullScreen message="Loading dashboard metrics..." />
      </AdminLayout>
    );
  }

  if (error || !summary) {
    return (
      <AdminLayout title="Dashboard" subtitle="System analytics and store overview">
        <ErrorMessage message={error || 'Unable to retrieve dashboard metrics.'} onRetry={() => window.location.reload()} />
      </AdminLayout>
    );
  }

  // Calculate chart max for proportional heights
  const maxDaySale = dailySales.length > 0 
    ? Math.max(...dailySales.map((d) => d.total_sales || 0), 1000) 
    : 1000;

  // Header quick action CTAs
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-indigo">Shipped</span>;
      case 'PROCESSING':
        return <span className="badge badge-warning">Processing</span>;
      case 'CANCELLED':
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">Placed</span>;
    }
  };

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Real-time commercial metrics calculated via MySQL queries"
      actions={headerActions}
    >
      <div className="space-y-6 page-transition">

        {/* 1. ADMIN KPI ROW (Rule #35 & #36: Restrained cards, real data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Revenue */}
          <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Total Revenue
              </span>
              <p className="text-2xl font-bold text-brand-dark tracking-tight">
                {formatCurrency(summary.total_sales)}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed sales</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-btn bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Orders
              </span>
              <p className="text-2xl font-bold text-brand-dark tracking-tight">
                {summary.total_orders}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-brand-indigo font-medium pt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{summary.pending_orders} pending fulfillment</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-btn bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Products
              </span>
              <p className="text-2xl font-bold text-brand-dark tracking-tight">
                {summary.total_products}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-0.5">
                <span>Active catalog inventory</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-btn bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* Customers / Categories */}
          <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                Departments
              </span>
              <p className="text-2xl font-bold text-brand-dark tracking-tight">
                {summary.total_categories}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium pt-0.5">
                <span>Organized departments</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-btn bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* 2. SALES OVERVIEW CHART (Rule #35 & #37: Clean grid, restrained colors, clear labels, tooltips) */}
        <div className="bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-brand-dark">
                Sales Overview
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Daily revenue trends from confirmed customer transactions.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-brand-muted">
              <span className="flex items-center gap-1.5 font-medium text-brand-dark">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo inline-block" />
                Gross Daily Sales (₹)
              </span>
            </div>
          </div>

          {/* Chart Display Area */}
          {dailySales.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-muted">
              No daily sales transactions recorded yet. Complete customer checkouts to populate revenue timeline.
            </div>
          ) : (
            <div className="relative pt-6">
              {/* Tooltip Popup on Hover */}
              {activeTooltip && (
                <div 
                  className="absolute z-10 px-2.5 py-1.5 bg-brand-dark text-white text-[11px] rounded-[6px] shadow-dropdown pointer-events-none -translate-x-1/2 -top-2 transition-all duration-fast"
                  style={{ left: `${activeTooltip.x}px` }}
                >
                  <div className="font-semibold">{formatCurrency(activeTooltip.sales)}</div>
                  <div className="text-gray-300 text-[10px]">{activeTooltip.orders} orders • {activeTooltip.date}</div>
                </div>
              )}

              {/* Grid Background */}
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-gray-200 pb-2 relative">
                {/* Horizontal reference grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-gray-200 w-full" />
                  <div className="border-b border-dashed border-gray-200 w-full" />
                  <div className="border-b border-dashed border-gray-200 w-full" />
                </div>

                {dailySales.map((item, index) => {
                  const heightPercent = maxDaySale > 0 
                    ? Math.max((item.total_sales / maxDaySale) * 100, 8) 
                    : 8;

                  const dateFormatted = new Date(item.sale_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <div 
                      key={item.sale_date}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
                        setActiveTooltip({
                          sales: item.total_sales,
                          orders: item.total_orders,
                          date: dateFormatted,
                          x: (rect.left - parentRect.left) + rect.width / 2
                        });
                      }}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      {/* Bar with smooth height transition */}
                      <div 
                        className="w-full max-w-[36px] bg-brand-indigo group-hover:bg-brand-indigo-hover rounded-t-[4px] transition-all duration-normal"
                        style={{ height: `${heightPercent}%` }}
                      />

                      {/* Date label */}
                      <span className="text-[11px] text-gray-500 group-hover:text-brand-dark transition-colors mt-2 whitespace-nowrap">
                        {dateFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. RECENT ORDERS & TOP PRODUCTS ROW (Rule #35, #37, #38) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Recent Orders Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-brand-dark">
                  Recent Orders
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Latest customer checkouts awaiting fulfillment.
                </p>
              </div>

              <Link 
                to="/admin/orders" 
                className="text-xs font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">
                No orders placed yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((ord) => (
                      <tr 
                        key={ord.order_id} 
                        className="hover:bg-[#F9FAFB] transition-colors duration-fast"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-brand-dark">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-3 text-gray-700 truncate max-w-[120px]">
                          {ord.customer_name}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-brand-dark">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(ord.order_status)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/invoice/${ord.order_number}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-indigo hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-brand-dark">
                  Top Products
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Best performing items by units sold.
                </p>
              </div>

              <Link 
                to="/admin/products" 
                className="text-xs font-semibold text-brand-indigo hover:text-brand-indigo-hover"
              >
                Inventory
              </Link>
            </div>

            <div className="space-y-2.5">
              {topProducts.length === 0 ? (
                <p className="text-xs text-brand-muted py-6 text-center">
                  No sales recorded yet.
                </p>
              ) : (
                topProducts.map((p, index) => (
                  <div
                    key={p.product_id}
                    className="flex items-center justify-between p-2.5 rounded-[8px] bg-[#F9FAFB] border border-gray-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-brand-dark block truncate">
                          {p.product_name}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {p.category_name} • Stock: {p.stock_quantity}
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

        {/* 4. INVENTORY ALERTS (Rule #35: Inventory Alerts) */}
        <div className="bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-warning">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-dark">
                  Inventory Alerts
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Products with low stock quantities (≤15 units) requiring restocking attention.
                </p>
              </div>
            </div>

            <Link
              to="/admin/products"
              className="btn-outline-indigo text-xs py-1.5 px-3"
            >
              <span>Manage Stock</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {inventoryAlerts.length === 0 ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-[8px] flex items-center gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All catalog products have sufficient stock levels. No critical replenishment alerts.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventoryAlerts.map((prod) => (
                <div
                  key={prod.product_id}
                  className="p-3 bg-[#F9FAFB] border border-gray-200 rounded-[8px] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-brand-dark block truncate">
                      {prod.product_name}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      {prod.category_name} • ₹{parseFloat(prod.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {prod.stock_quantity === 0 ? (
                      <span className="badge badge-error">Out of stock</span>
                    ) : (
                      <span className="badge badge-warning">{prod.stock_quantity} left</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
