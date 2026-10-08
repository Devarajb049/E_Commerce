import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PackageSuccessAnimation from '../components/order/PackageSuccessAnimation';

/**
 * ClickCart Order Success Page
 * Displays the hero package opening animation, checkmark draw, real order details, and actions.
 */
const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      api.getOrder(orderId)
        .then((res) => {
          if (res.success && res.data) {
            setOrder(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load order:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Confirming your order..." />
      </div>
    );
  }

  const orderNumber = order?.order_number || orderId || 'CC10245';
  const totalAmount = order?.total_amount || 0;
  const customerName = order?.customer_name || '';
  const deliveryMethod = order?.deliveryMethod || (order?.delivery_method === 'EXPRESS' ? 'Express Delivery' : 'Standard Delivery');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 page-transition">
      <PackageSuccessAnimation
        orderId={order?.order_id || orderId}
        orderNumber={orderNumber}
        totalAmount={totalAmount}
        customerName={customerName}
        deliveryMethod={deliveryMethod}
        onViewOrder={() => navigate(`/orders?order=${orderNumber}`)}
      />
    </div>
  );
};

export default OrderSuccess;
