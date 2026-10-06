import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { success, error: toastError } = useToast();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-dark">Your cart is empty</h2>
        <p className="text-xs text-brand-muted">Please add products to your cart before proceeding to checkout.</p>
        <div>
          <Link to="/products" className="btn-primary text-xs">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) {
      errs.name = 'Full name is required (min 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim() || !emailRegex.test(customer.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/;
    if (!customer.phone.trim() || !phoneRegex.test(customer.phone.trim())) {
      errs.phone = 'Valid phone number is required';
    }

    if (!customer.address.trim() || customer.address.trim().length < 5) {
      errs.address = 'Street address is required (min 5 characters)';
    }

    if (!customer.city.trim() || customer.city.trim().length < 2) {
      errs.city = 'City is required';
    }

    if (!customer.state.trim() || customer.state.trim().length < 2) {
      errs.state = 'State / Region is required';
    }

    const pinRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (!customer.pincode.trim() || !pinRegex.test(customer.pincode.trim())) {
      errs.pincode = 'Valid postal / PIN code is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          pincode: customer.pincode.trim()
        },
        items: items.map((i) => ({
          productId: i.product_id,
          quantity: i.quantity
        }))
      };

      const response = await api.createOrder(payload);

      if (response.success && response.data) {
        success('Order placed successfully!');
        clearCart();
        navigate(`/order-success/${response.data.order_number}`, {
          state: { order: response.data }
        });
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      const msg = err.message || 'Unable to place order. Please review your cart and stock.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Enter your delivery information to place your order.
          </p>
        </div>

        <Link
          to="/cart"
          className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-btn flex items-start gap-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-brand-error flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Could not place order</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Structured 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Customer Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-5">
          <h2 className="text-base font-bold text-brand-dark pb-3 border-b border-gray-100">
            Customer Information
          </h2>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className={`form-input ${errors.name ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className={`form-input ${errors.email ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={`form-input ${errors.phone ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Flat 402, Sunshine Apartments, MG Road"
                className={`form-input ${errors.address ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            {/* City, State, PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className={`form-input ${errors.city ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={customer.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className={`form-input ${errors.state ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
                />
                {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={customer.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  className={`form-input ${errors.pincode ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : ''}`}
                />
                {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Payment Info */}
            <div className="pt-3 border-t border-gray-100">
              <span className="block text-xs font-semibold text-gray-700 mb-2">
                Payment Method
              </span>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-btn flex items-center justify-between text-xs text-brand-dark">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-indigo" />
                  Cash on Delivery / Direct Store Payment
                </span>
                <span className="text-[11px] text-brand-success font-semibold">Standard</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Review & Submit (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-5 sticky top-20">
          <h2 className="text-base font-bold text-brand-dark pb-3 border-b border-gray-100">
            Order Summary ({items.length})
          </h2>

          {/* Product Items Breakdown */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                <div className="flex-1 pr-3 truncate">
                  <span className="font-semibold text-brand-dark block truncate">
                    {item.product_name}
                  </span>
                  <span className="text-gray-500">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </span>
                </div>
                <span className="font-bold text-brand-dark">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 text-xs sm:text-sm border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-brand-success">Free</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-sm">
              <span className="font-bold text-brand-dark">Total</span>
              <span className="text-xl font-extrabold text-brand-dark">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="w-full btn-primary py-3"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Place Order ({formatCurrency(total)})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
