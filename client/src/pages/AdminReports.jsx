import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Layers, 
  TrendingUp, 
  Download,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import AdminNav from '../components/AdminNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminReports = () => {
  const [summary, setSummary] = useState(null);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sumRes, catRes, topRes, dayRes] = await Promise.all([
          api.getSummary(),
          api.getSalesByCategory(),
          api.getTopProducts(),
          api.getDailySales()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (catRes.success) setCategorySales(catRes.data);
        if (topRes.success) setTopProducts(topRes.data);
        if (dayRes.success) setDailySales(dayRes.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.message || 'Unable to retrieve sales reports from MySQL.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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
        <LoadingSpinner fullScreen message="Compiling SQL aggregation reports..." />
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

  const maxCatSales = categorySales.length > 0 
    ? Math.max(...categorySales.map((c) => c.total_sales || 0), 1) 
    : 1;

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              Business Intelligence & Sales Reports
            </h2>
            <p className="text-sm text-brand-muted">
              Live SQL aggregates using <code className="text-indigo-600 font-mono">SUM()</code>, <code className="text-indigo-600 font-mono">COUNT()</code>, <code className="text-indigo-600 font-mono">GROUP BY</code>, and date grouping.
            </p>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Total Revenue Generated
            </span>
            <p className="text-3xl font-extrabold text-brand-dark mt-2">
              {formatCurrency(summary.total_sales)}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Calculated via SQL SUM(total_amount)
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Completed Customer Orders
            </span>
            <p className="text-3xl font-extrabold text-brand-dark mt-2">
              {summary.total_orders}
            </p>
            <p className="text-xs text-brand-indigo font-medium mt-1">
              Calculated via SQL COUNT(*)
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Active Store Departments
            </span>
            <p className="text-3xl font-extrabold text-brand-dark mt-2">
              {summary.total_categories}
            </p>
            <p className="text-xs text-purple-600 font-medium mt-1">
              Across {summary.total_products} catalog products
            </p>
          </div>
        </div>

        {/* 2. Sales by Category (GROUP BY c.category_id) */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-indigo" />
              Category Revenue Breakdown (SQL GROUP BY)
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Query: <code className="text-indigo-600 font-mono">SELECT category_name, SUM(oi.subtotal) FROM Categories ... GROUP BY category_id</code>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Category Department</th>
                  <th className="py-3 px-4 text-center">Products Count</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 w-48">Share of Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categorySales.map((c) => {
                  const share = maxCatSales > 0 ? (c.total_sales / maxCatSales) * 100 : 0;
                  return (
                    <tr key={c.category_id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-bold text-brand-dark">
                        {c.category_name}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-500">
                        {c.product_count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-brand-indigo">
                        {c.total_units_sold} units
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-dark">
                        {formatCurrency(c.total_sales)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-indigo rounded-full"
                            style={{ width: `${Math.max(share, c.total_sales > 0 ? 5 : 0)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Top Products Sold (SUM(quantity) GROUP BY product_id) */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-orange" />
              Top-Selling Products (SQL SUM(quantity) GROUP BY)
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Ranked by total quantity units purchased across all customer orders.
            </p>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-brand-muted text-center py-8">
              No product purchase activity recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProducts.map((p, index) => (
                    <tr key={p.product_id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-dark">
                        {p.product_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {p.category_name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-brand-orange">
                        {p.total_quantity_sold}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-dark">
                        {formatCurrency(p.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Daily Sales History (DATE(created_at) aggregation) */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Daily Sales History (SQL DATE Aggregation)
            </h3>
            <p className="text-xs text-brand-muted mt-0.5">
              Query: <code className="text-indigo-600 font-mono">SELECT DATE(created_at) AS sale_date, SUM(total_amount) FROM Orders GROUP BY DATE(created_at)</code>
            </p>
          </div>

          {dailySales.length === 0 ? (
            <p className="text-xs text-brand-muted text-center py-8">
              No daily sales data available. Place test orders to populate daily revenue logs.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Sale Date</th>
                    <th className="py-3 px-4 text-center">Orders Placed</th>
                    <th className="py-3 px-4 text-right">Items Subtotal</th>
                    <th className="py-3 px-4 text-right">GST Collected</th>
                    <th className="py-3 px-4 text-right">Total Daily Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailySales.map((d) => (
                    <tr key={d.sale_date} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                        {d.sale_date}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-brand-indigo">
                        {d.total_orders} orders
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {formatCurrency(d.subtotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {formatCurrency(d.total_tax)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-dark">
                        {formatCurrency(d.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
