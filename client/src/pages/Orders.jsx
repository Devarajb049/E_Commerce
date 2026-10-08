import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, Eye, XCircle, RotateCcw, Package, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import OrderTimeline from '../components/order/OrderTimeline';

/**
 * ClickCart Production-Grade Orders & Tracking Page
 * Displays customer order history, live OrderTimeline, cancel order, return request, and invoices.
 */
const Orders = () => {
  const [searchParams] = useSearchParams();
  const highlightedOrderNumber = searchParams.get('order');

  const { isAuthenticated, isAdmin, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order for Tracking Drawer / Modal
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // If user is logged in, customer calls getMyOrders; admin can call getOrders
      let res;
      if (isAdmin) {
        res = await api.getOrders({ search, status: statusFilter !== 'all' ? statusFilter : undefined });
      } else if (isAuthenticated) {
        res = await api.getMyOrders();
      } else {
        // Guest user browsing with search
        res = await api.getOrders({ search });
      }

      if (res.success && res.data) {
        let fetchedOrders = res.data;
        if (statusFilter !== 'all' && !isAdmin) {
          fetchedOrders = fetchedOrders.filter((o) => o.order_status === statusFilter);
        }
        if (search && !isAdmin) {
          const s = search.toLowerCase();
          fetchedOrders = fetchedOrders.filter((o) =>
            o.order_number?.toLowerCase().includes(s) ||
            o.customer_name?.toLowerCase().includes(s) ||
            o.email?.toLowerCase().includes(s)
          );
        }
        setOrders(fetchedOrders);

        // If URL specified a highlighted order, auto open tracking
        if (highlightedOrderNumber) {
          const match = fetchedOrders.find((o) => o.order_number === highlightedOrderNumber);
          if (match) {
            handleOpenTracking(match);
          }
        }
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
  }, [statusFilter, isAuthenticated, isAdmin]);

  const handleOpenTracking = async (order) => {
    try {
      // Fetch full order details including line items
      const res = await api.getOrder(order.order_number || order.order_id);
      if (res.success && res.data) {
        setTrackingOrder(res.data);
      } else {
        setTrackingOrder(order);
      }
    } catch (err) {
      setTrackingOrder(order);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Item quantities will be safely restored.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        success('Order cancelled successfully.');
        if (trackingOrder && trackingOrder.order_id === orderId) {
          setTrackingOrder((prev) => ({ ...prev, order_status: 'CANCELLED' }));
        }
        fetchOrders();
      }
    } catch (err) {
      toastError(err.message || 'Could not cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      toastError('Please provide a reason for the return.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.requestReturn({
        orderId: trackingOrder.order_id,
        reason: returnReason.trim()
      });
      if (res.success) {
        success('Return request submitted successfully.');
        setShowReturnModal(false);
        setReturnReason('');
        if (trackingOrder) {
          setTrackingOrder((prev) => ({ ...prev, order_status: 'RETURN_REQUESTED' }));
        }
        fetchOrders();
      }
    } catch (err) {
      toastError(err.message || 'Could not submit return request.');
    } finally {
      setActionLoading(false);
    }
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
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-full">Shipped</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-full">Out for Delivery</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-primary bg-indigo-50 border border-indigo-200 rounded-full">Processing</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-full">Cancelled</span>;
      case 'RETURN_REQUESTED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full">Return Requested</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 rounded-full">Returned & Refunded</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full">Placed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Order Status & History
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Real-time fulfillment tracking, live timeline, and tax invoices.
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Explore More Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-brand-border rounded-xl p-3 sm:p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="flex-1 max-w-sm flex items-center gap-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => { setSearch(''); fetchOrders(); }}
            placeholder="Search order number..."
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          {['all', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-brand-primary text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <TableSkeleton rows={5} />}

      {/* Error Message */}
      {error && !loading && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <EmptyState
          title="No Orders Found"
          description={
            statusFilter !== 'all'
              ? `There are no orders with status '${statusFilter}'.`
              : 'You have not placed any orders yet. Discover our catalog to start shopping!'
          }
          actionText="Start Shopping"
          actionLink="/products"
        />
      )}

      {/* Orders Grid / List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 shadow-subtle hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-brand-dark">
                    {order.order_number}
                  </span>
                  {getStatusBadge(order.order_status)}
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-brand-dark">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Order Quick Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-800">Deliver To:</span> {order.customer_name} ({order.city || 'Standard Address'})
                  </p>
                  <p className="text-slate-500">
                    <span className="font-medium">Total Items:</span> {order.total_items || 1} • <span className="font-medium">Payment:</span> {order.payment_method || 'COD'} ({order.payment_status || 'Pending'})
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  <button
                    onClick={() => handleOpenTracking(order)}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-50 text-brand-primary hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Track Order</span>
                  </button>

                  <Link
                    to={`/invoice/${order.order_number}`}
                    className="py-1.5 px-3 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Invoice</span>
                  </Link>

                  {order.order_status === 'PLACED' && (
                    <button
                      onClick={() => handleCancelOrder(order.order_id)}
                      disabled={actionLoading}
                      className="py-1.5 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRACKING DETAILS MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-brand-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-elevated">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-brand-primary">Live Order Tracker</span>
                <h3 className="text-lg font-bold text-brand-dark">
                  Order {trackingOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Order Timeline Component */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-100">
              <OrderTimeline currentStatus={trackingOrder.order_status} createdAt={trackingOrder.created_at} />
            </div>

            {/* Order Items Snapshot */}
            {trackingOrder.items && trackingOrder.items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Items in this shipment ({trackingOrder.items.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {trackingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                          alt={item.product_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{item.product_name}</p>
                        <p className="text-slate-500 text-[11px]">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer & Delivery Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Delivery Address</span>
                <p className="text-slate-600 font-medium">{trackingOrder.customer_name}</p>
                <p className="text-slate-500">{trackingOrder.address}, {trackingOrder.city}, {trackingOrder.state} - {trackingOrder.pincode}</p>
                <p className="text-slate-500 mt-1">Phone: {trackingOrder.phone}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Payment & Charges</span>
                <p className="text-slate-600">Subtotal: <span className="font-semibold">{formatCurrency(trackingOrder.subtotal)}</span></p>
                <p className="text-slate-600">GST Tax (18%): <span className="font-semibold">{formatCurrency(trackingOrder.tax)}</span></p>
                <p className="text-slate-800 font-bold text-sm mt-1">
                  Total: {formatCurrency(trackingOrder.total_amount)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Method: {trackingOrder.payment_method || 'COD'} ({trackingOrder.payment_status || 'Pending'})
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/invoice/${trackingOrder.order_number}`}
                className="py-2 px-4 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>View Full Tax Invoice</span>
              </Link>

              <div className="flex items-center gap-2">
                {trackingOrder.order_status === 'PLACED' && (
                  <button
                    onClick={() => handleCancelOrder(trackingOrder.order_id)}
                    disabled={actionLoading}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                {trackingOrder.order_status === 'DELIVERED' && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Return</span>
                  </button>
                )}

                <button
                  onClick={() => setTrackingOrder(null)}
                  className="py-2 px-4 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RETURN REQUEST MODAL */}
      {showReturnModal && trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-brand-border max-w-md w-full p-6 space-y-4 shadow-elevated">
            <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Submit Return Request</span>
            </h3>

            <p className="text-xs text-brand-muted leading-relaxed">
              Order #{trackingOrder.order_number} is eligible for a full refund of {formatCurrency(trackingOrder.total_amount)}. Please tell us why you wish to return:
            </p>

            <form onSubmit={handleRequestReturn} className="space-y-4">
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Item size did not fit / damaged during delivery / not as described..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2 px-4 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
