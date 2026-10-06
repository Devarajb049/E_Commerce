import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
  const totalAmount = order?.total_amount ? parseFloat(order.total_amount).toLocaleString('en-IN') : '0';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      
      {/* Clean Confirmation Card */}
      <div className="bg-white border border-brand-border rounded-card p-6 sm:p-10 shadow-subtle space-y-5">
        
        {/* Subtle Checkmark Circle */}
        <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-brand-success">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Order Confirmed
          </h1>
          <p className="text-xs text-brand-muted">
            Thank you for shopping with ClickCart.
          </p>
        </div>

        {/* Order Details Pill */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-btn text-xs font-mono text-brand-dark flex items-center justify-between">
          <span className="text-gray-500 font-sans">Order ID:</span>
          <span className="font-bold text-brand-indigo">{orderNumber}</span>
        </div>

        {order?.total_amount && (
          <div className="flex justify-between text-xs py-2 border-b border-gray-100">
            <span className="text-gray-500">Total:</span>
            <span className="font-bold text-brand-dark">₹{totalAmount}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link
            to={`/invoice/${orderNumber}`}
            className="w-full sm:w-auto btn-primary text-xs py-2.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </Link>

          <Link
            to="/orders"
            className="w-full sm:w-auto btn-secondary text-xs py-2.5"
          >
            <span>View Order History</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto text-xs text-gray-500 hover:text-brand-dark py-2 px-3 transition-colors"
          >
            Continue shopping
          </Link>
        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;
