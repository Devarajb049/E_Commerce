import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, X, CheckCircle, Clock, Truck, ShieldAlert, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import AdminNav from '../components/AdminNav';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
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
      if (search) params.search = search;
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
      toastError(err.message || 'Failed to update order status in MySQL.');
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
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              Order Fulfillment Center
            </h2>
            <p className="text-sm text-brand-muted">
              Inspect order details, review item purchase snapshots, and transition fulfillment lifecycle.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => { setSearch(''); fetchOrders(); }}
              placeholder="Search by Order ID, Customer, or Phone..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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

        {/* Orders Table */}
        <div className="bg-white border border-brand-border rounded-3xl shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner message="Retrieving orders from MySQL database..." />
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-brand-muted text-sm">
              No orders found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Order ID</th>
                    <th className="py-3.5 px-4 font-bold">Customer Details</th>
                    <th className="py-3.5 px-4 font-bold">Date</th>
                    <th className="py-3.5 px-4 font-bold">Total Amount</th>
                    <th className="py-3.5 px-4 font-bold">Fulfillment Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
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
                      <tr key={ord.order_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-indigo">
                          {ord.order_number}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-brand-dark block text-sm">
                            {ord.customer_name}
                          </span>
                          <span className="text-[11px] text-brand-muted block">
                            {ord.phone} • {ord.city}, {ord.state}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {dateStr}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap">
                          {formatCurrency(ord.total_amount)}
                        </td>

                        {/* Status Select with direct API update */}
                        <td className="py-3.5 px-4">
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleStatusChange(ord.order_id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer transition-colors ${
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openOrderDetails(ord.order_id)}
                              className="p-1.5 text-gray-600 hover:text-brand-indigo hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Inspect Order Items"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/invoice/${ord.order_number}`}
                              className="p-1.5 text-gray-600 hover:text-brand-indigo hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Open Tax Invoice"
                            >
                              <FileText className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="font-mono text-xs text-brand-indigo font-bold block">
                  {selectedOrder.order_number}
                </span>
                <h3 className="text-lg font-bold text-brand-dark">Order Items & Delivery Details</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1 border border-gray-100">
              <p><strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.email})</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Shipping Address:</strong> {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
              <p><strong>Current Status:</strong> <span className="font-bold">{selectedOrder.order_status}</span></p>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Purchased Products ({selectedOrder.items?.length})
              </h4>
              <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.order_item_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-3 truncate">
                      <span className="font-bold text-brand-dark block truncate">
                        {item.product_name}
                      </span>
                      <span className="text-brand-muted">
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
            <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (18%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-brand-dark text-sm pt-1">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                to={`/invoice/${selectedOrder.order_number}`}
                className="text-xs font-semibold text-brand-indigo hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Full Printable Invoice</span>
              </Link>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
