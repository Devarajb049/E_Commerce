import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ShoppingBag, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      api.getOrder(orderId)
        .then((res) => {
          if (res.success) setOrder(res.data);
        })
        .catch((err) => console.error('Failed to load order:', err))
        .finally(() => setLoading(false));
    }
  }, [order, orderId]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Confirming your order..." />;
  }

  const orderNumber = order?.order_number || orderId || 'ORD-CLICKCART';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      
      {/* Branded Success Card */}
      <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-md space-y-6">
        
        {/* Animated Checkmark Circle */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce" style={{ animationIterationCount: 2 }}>
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Confirmed & Recorded in MySQL
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            Order placed successfully!
          </h1>
          <p className="text-base text-brand-muted max-w-md mx-auto">
            Thank you for shopping with <strong className="text-brand-dark font-semibold">ClickCart</strong>. Your order is being prepared for fulfillment.
          </p>
        </div>

        {/* Order Identifier Pill */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-brand-dark">
          <span>Order ID:</span>
          <span className="text-brand-indigo">{orderNumber}</span>
        </div>

        {order?.customer_name && (
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs sm:text-sm text-indigo-950 text-left max-w-md mx-auto space-y-1">
            <p><strong>Billed To:</strong> {order.customer_name}</p>
            {order.email && <p className="text-brand-muted">Confirmation sent to: {order.email}</p>}
            {order.total_amount && (
              <p className="pt-1 font-semibold text-brand-dark">
                Total Paid / Due: ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/invoice/${orderNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 active:scale-98"
          >
            <FileText className="w-4 h-4" />
            <span>View & Print Invoice</span>
          </Link>

          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-brand-indigo bg-white border border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all"
          >
            <span>My Orders History</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;
