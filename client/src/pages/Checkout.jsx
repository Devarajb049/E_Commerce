import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
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

  // If cart is empty, redirect or show message
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-brand-indigo">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">Your cart is empty</h2>
        <p className="text-sm text-brand-muted">Please add at least one product to your cart before proceeding to checkout.</p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) {
      errs.name = 'Full name is required (at least 2 letters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim() || !emailRegex.test(customer.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/;
    if (!customer.phone.trim() || !phoneRegex.test(customer.phone.trim())) {
      errs.phone = 'Valid phone number is required (at least 7 digits)';
    }

    if (!customer.address.trim() || customer.address.trim().length < 5) {
      errs.address = 'Detailed shipping address is required (min 5 characters)';
    }

    if (!customer.city.trim() || customer.city.trim().length < 2) {
      errs.city = 'City name is required';
    }

    if (!customer.state.trim() || customer.state.trim().length < 2) {
      errs.state = 'State / Region is required';
    }

    const pinRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (!customer.pincode.trim() || !pinRegex.test(customer.pincode.trim())) {
      errs.pincode = 'Valid PIN / Postal code is required';
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
      toastError('Please fill in all required customer fields correctly.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Checkout
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Complete your shipping details to place your order with ClickCart.
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Order Placement Error</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-50 text-brand-indigo text-xs font-bold flex items-center justify-center">
                1
              </span>
              Shipping & Customer Information
            </h2>
            <span className="text-xs text-brand-muted">* All fields required</span>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                  }`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Street Address / Flat / Landmark
              </label>
              <textarea
                rows="2"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Flat 402, Sunshine Apartments, MG Road"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.address ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                }`}
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            {/* City, State, PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.city ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                  }`}
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={customer.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.state ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                  }`}
                />
                {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={customer.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.pincode ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-gray-200 focus:ring-brand-indigo/30 focus:border-brand-indigo'
                  }`}
                />
                {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="pt-4 border-t border-gray-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                Payment Option
              </span>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs font-semibold text-brand-dark">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-indigo" />
                  Cash on Delivery / Direct Store Payment (Standard)
                </span>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Zero Extra Fees
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Review & Place Order Button (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-brand-dark pb-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-50 text-brand-indigo text-xs font-bold flex items-center justify-center">
              2
            </span>
            Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>

          {/* Product Items Breakdown */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                <div className="flex-1 pr-3 truncate">
                  <span className="font-semibold text-brand-dark block truncate">
                    {item.product_name}
                  </span>
                  <span className="text-brand-muted">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </span>
                </div>
                <span className="font-bold text-brand-dark">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-2 pt-2 text-sm border-t border-gray-100">
            <div className="flex justify-between text-brand-muted">
              <span>Items Subtotal</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>GST (18%)</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-brand-dark">Grand Total</span>
              <span className="text-2xl font-extrabold text-brand-dark">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={submitting}
            className={`w-full py-4 px-6 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              submitting
                ? 'bg-indigo-400 cursor-wait'
                : 'bg-brand-indigo hover:bg-indigo-700 hover:shadow-lg'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order with MySQL...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Order ({formatCurrency(total)})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-brand-muted">
            By placing this order, stock is reserved and verified directly in the MySQL database.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
