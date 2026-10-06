import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Layers, 
  TrendingUp, 
  Printer
} from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton } from '../components/LoadingSpinner';
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

  const maxCatSales = categorySales.length > 0 
    ? Math.max(...categorySales.map((c) => c.total_sales || 0), 1) 
    : 1;

  return (
    <AdminLayout
      title="Reports & Analytics"
      subtitle="Financial performance, SQL group aggregations, and catalog velocity metrics"
      actions={
        <button
          onClick={() => window.print()}
          className="btn-secondary text-xs py-2 px-3 no-print"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Summary</span>
        </button>
      }
    >
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-brand-border rounded-card p-5 h-28 animate-pulse" />
            ))}
          </div>
          <TableSkeleton rows={6} />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          {/* 1. Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Total Gross Revenue
              </span>
              <p className="text-2xl font-bold text-brand-dark mt-1">
                {formatCurrency(summary?.total_sales)}
              </p>
              <p className="text-[11px] text-brand-muted mt-1 font-mono">
                SQL SUM(total_amount)
              </p>
            </div>

            <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Completed Orders
              </span>
              <p className="text-2xl font-bold text-brand-dark mt-1">
                {summary?.total_orders}
              </p>
              <p className="text-[11px] text-brand-muted mt-1 font-mono">
                SQL COUNT(order_id)
              </p>
            </div>

            <div className="bg-white border border-brand-border rounded-card p-5 shadow-subtle">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Active Catalog Scope
              </span>
              <p className="text-2xl font-bold text-brand-dark mt-1">
                {summary?.total_products} items
              </p>
              <p className="text-[11px] text-brand-muted mt-1 font-mono">
                Across {summary?.total_categories} departments
              </p>
            </div>
          </div>

          {/* 2. Sales by Category (GROUP BY c.category_id) */}
          <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-indigo" />
                  <span>Category Revenue Breakdown</span>
                </h3>
                <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                  GROUP BY Categories.category_id
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Category Department</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Products</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Units Sold</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-36">Total Revenue</th>
                    <th className="py-2.5 px-4 font-semibold w-40">Revenue Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categorySales.map((c) => {
                    const share = maxCatSales > 0 ? (c.total_sales / maxCatSales) * 100 : 0;
                    return (
                      <tr key={c.category_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-brand-dark">
                          {c.category_name}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">
                          {c.product_count}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-brand-indigo">
                          {c.total_units_sold}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-brand-dark">
                          {formatCurrency(c.total_sales)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

          {/* 3. Top-Selling Products */}
          <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-orange" />
                  <span>Top-Selling Products</span>
                </h3>
                <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                  SUM(quantity) GROUP BY product_id ORDER BY total_quantity_sold DESC
                </p>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-xs text-brand-muted text-center py-8">
                No product purchase transactions recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4 font-semibold">Product Name</th>
                      <th className="py-2.5 px-4 font-semibold">Department</th>
                      <th className="py-2.5 px-4 font-semibold text-right w-28">Unit Price</th>
                      <th className="py-2.5 px-4 font-semibold text-center w-28">Units Sold</th>
                      <th className="py-2.5 px-4 font-semibold text-right w-36">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.map((p, index) => (
                      <tr key={p.product_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-medium text-gray-400">
                          #{index + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand-dark">
                          {p.product_name}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {p.category_name}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700 text-right">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-brand-orange">
                          {p.total_quantity_sold}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-brand-dark">
                          {formatCurrency(p.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Daily Sales History (DATE aggregation) */}
          <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-indigo" />
                  <span>Daily Sales History</span>
                </h3>
                <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                  GROUP BY DATE(created_at) ORDER BY sale_date DESC
                </p>
              </div>
            </div>

            {dailySales.length === 0 ? (
              <p className="text-xs text-brand-muted text-center py-8">
                No daily sales activity recorded. Orders placed will populate daily revenue logs.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold w-32">Sale Date</th>
                      <th className="py-2.5 px-4 font-semibold text-center w-28">Orders Placed</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Items Subtotal</th>
                      <th className="py-2.5 px-4 font-semibold text-right">GST (18%)</th>
                      <th className="py-2.5 px-4 font-semibold text-right w-36">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailySales.map((d) => (
                      <tr key={d.sale_date} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-brand-dark">
                          {d.sale_date}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-brand-indigo">
                          {d.total_orders}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(d.subtotal)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(d.total_tax)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-brand-dark">
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
      )}
    </AdminLayout>
  );
};

export default AdminReports;
