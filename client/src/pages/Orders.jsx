import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Eye, FileText, Calendar, ArrowRight, CheckCircle2, Clock, Truck } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
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
      setError(err.message || 'Unable to retrieve orders from database.');
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
        return <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">SHIPPED</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 text-xs font-bold text-indigo-800 bg-indigo-100 rounded-full">PROCESSING</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-full">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full">PLACED</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Track fulfillment status, review purchased products, and download printable invoices.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <span>Shop More Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => { setSearch(''); fetchOrders(); }}
            placeholder="Search by Order ID (ORD-...), Customer, or Email..."
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-indigo text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-indigo text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Empty / Loading */}
      {loading ? (
        <LoadingSpinner message="Retrieving orders from MySQL..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          message={
            search || statusFilter !== 'all'
              ? 'No orders match your search criteria. Try adjusting filters.'
              : 'You have not placed any orders yet. Add items to your ClickCart and place an order!'
          }
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const dateStr = new Date(ord.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={ord.order_id}
                className="bg-white border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-indigo flex items-center justify-center font-mono text-sm font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm sm:text-base text-brand-dark">
                        {ord.order_number}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-brand-muted mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>Billed to: {ord.customer_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {getStatusBadge(ord.order_status)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      <strong>Delivery to:</strong> {ord.city}, {ord.state} - {ord.pincode}
                    </p>
                    <p className="text-brand-muted text-xs">
                      {ord.total_items} product line {ord.total_items === 1 ? 'item' : 'items'} ({ord.total_units} units)
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-right">
                      <span className="text-xs text-brand-muted block">Total Paid</span>
                      <span className="text-base sm:text-lg font-extrabold text-brand-dark">
                        {formatCurrency(ord.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/invoice/${ord.order_number}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-indigo bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;
