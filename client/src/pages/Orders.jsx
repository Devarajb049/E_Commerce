import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getOrders(params);
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-success bg-green-50 border border-green-200 rounded-full">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-indigo bg-indigo-50 border border-indigo-200 rounded-full">Processing</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-error bg-red-50 border border-red-200 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-warning bg-amber-50 border border-amber-200 rounded-full">Placed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Track order delivery status and download past tax invoices.
          </p>
        </div>

        <Link
          to="/products"
          className="btn-secondary text-xs self-start sm:self-auto"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-brand-border rounded-card p-3 sm:p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm flex items-center gap-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => { setSearch(''); fetchOrders(); }}
            placeholder="Search by order ID, customer, email..."
          />
          <button
            type="submit"
            className="btn-primary text-xs py-2 px-3 whitespace-nowrap"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1">
          {['all', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-btn transition-colors ${
                statusFilter === st
                  ? 'bg-brand-indigo text-white font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Surface */}
      <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            message={
              search || statusFilter !== 'all'
                ? 'No orders match your filter criteria.'
                : 'You have not placed any orders yet.'
            }
            actionLabel="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer / Destination</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => {
                  const dateStr = new Date(ord.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={ord.order_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                        {ord.order_number}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-brand-dark block">{ord.customer_name}</span>
                        <span className="text-gray-500">{ord.city}, {ord.state}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-brand-dark whitespace-nowrap">
                        {formatCurrency(ord.total_amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(ord.order_status)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/invoice/${ord.order_number}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-indigo hover:text-indigo-700 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
