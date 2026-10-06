import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, X, Search, PackageCheck, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const AdminOrders = () => {
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getOrders(params);
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      toastError(err.message || 'Failed to load orders.');
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.order_id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toastError(err.message || 'Failed to update order status.');
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const res = await api.getOrder(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Could not fetch order details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Track customer purchases, fulfillment pipeline, and order lifecycle states"
      actions={
        <div className="text-xs text-brand-muted font-medium">
          Total orders: <span className="font-bold text-brand-dark">{orders.length}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters & Search Toolbar */}
        <div className="bg-white border border-brand-border rounded-card p-3 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, or phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-brand-border rounded-btn text-xs text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 focus:border-brand-indigo transition-all"
            />
          </form>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {['all', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-btn text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-indigo text-white shadow-subtle'
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
            <TableSkeleton rows={8} />
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon={ShoppingBag}
                title="No orders found"
                description={
                  search || statusFilter !== 'all'
                    ? 'No orders matched your selected status or search query.'
                    : 'Customer orders will appear here as purchases are completed.'
                }
                actionText={search || statusFilter !== 'all' ? 'Reset Filters' : undefined}
                onAction={
                  search || statusFilter !== 'all'
                    ? () => {
                        setSearch('');
                        setStatusFilter('all');
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-28">Order ID</th>
                    <th className="py-3 px-4 font-semibold">Customer Details</th>
                    <th className="py-3 px-4 font-semibold w-28">Date</th>
                    <th className="py-3 px-4 font-semibold w-28 text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold w-36 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right w-24">Actions</th>
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
                      <tr key={ord.order_id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-indigo">
                          {ord.order_number}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-brand-dark block text-xs">
                            {ord.customer_name}
                          </span>
                          <span className="text-[11px] text-brand-muted block truncate max-w-xs">
                            {ord.phone} • {ord.city}, {ord.state}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {dateStr}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap text-right">
                          {formatCurrency(ord.total_amount)}
                        </td>

                        {/* Status Select with direct update */}
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleStatusChange(ord.order_id, e.target.value)}
                            className={`px-2 py-1 rounded-btn text-[11px] font-bold border focus:outline-none cursor-pointer transition-colors ${
                              ord.order_status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ord.order_status === 'CANCELLED'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : ord.order_status === 'SHIPPED'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : ord.order_status === 'PROCESSING'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openOrderDetails(ord.order_id)}
                              className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-gray-100 rounded-btn transition-colors"
                              title="Inspect Order Items"
                              aria-label={`View order ${ord.order_number}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              to={`/invoice/${ord.order_number}`}
                              className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-gray-100 rounded-btn transition-colors"
                              title="Open Tax Invoice"
                              aria-label={`Print invoice for order ${ord.order_number}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Link>
                          </div>
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

      {/* INSPECT ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-modal border border-brand-border max-w-xl w-full p-6 shadow-dropdown space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <span className="font-mono text-xs text-brand-indigo font-bold block">
                  {selectedOrder.order_number}
                </span>
                <h3 className="text-base font-bold text-brand-dark">Order Items & Delivery Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-brand-dark rounded-btn hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-3.5 bg-gray-50 rounded-btn text-xs space-y-1.5 border border-brand-border">
              <div className="flex justify-between">
                <span className="text-brand-muted">Customer:</span>
                <span className="font-semibold text-brand-dark">{selectedOrder.customer_name} ({selectedOrder.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Phone:</span>
                <span className="font-semibold text-brand-dark">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Delivery Address:</span>
                <span className="font-semibold text-brand-dark text-right max-w-xs">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-brand-muted">Fulfillment Status:</span>
                <span className="font-bold text-brand-indigo">{selectedOrder.order_status}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Purchased Line Items ({selectedOrder.items?.length})
              </h4>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto border border-gray-100 rounded-btn p-2 bg-gray-50/50">
                {selectedOrder.items?.map((item) => (
                  <div key={item.order_item_id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-3 truncate">
                      <span className="font-semibold text-brand-dark block truncate">
                        {item.product_name}
                      </span>
                      <span className="text-brand-muted text-[11px]">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </span>
                    </div>
                    <span className="font-bold text-brand-dark">
                      {formatCurrency(item.subtotal || item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-brand-border space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Applicable GST (18%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-brand-dark text-sm pt-1 border-t border-gray-100">
                <span>Invoice Total:</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-brand-border">
              <Link
                to={`/invoice/${selectedOrder.order_number}`}
                className="text-xs font-semibold text-brand-indigo hover:text-indigo-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Tax Invoice</span>
              </Link>

              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary text-xs py-1.5 px-3.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
