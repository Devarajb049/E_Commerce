import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertCircle, ShieldCheck, Truck, CreditCard, Banknote, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/form/FormInput';
import SelectionCard from '../components/form/SelectionCard';
import AnimatedOrderButton from '../components/common/AnimatedOrderButton';

/**
 * ClickCart Production-Grade Checkout Experience
 * Multi-section flow: Contact Details → Delivery Address → Delivery Method → Payment Method → Order Review
 * Uses FormInput, SelectionCard, and AnimatedOrderButton with real atomic transaction.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { success, error: toastError } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [deliveryMethod, setDeliveryMethod] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses()
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setSavedAddresses(res.data);
            const defaultAddr = res.data.find((a) => a.is_default) || res.data[0];
            setSelectedAddressId(String(defaultAddr.address_id));
            setCustomer((prev) => ({
              ...prev,
              name: defaultAddr.full_name || prev.name,
              phone: defaultAddr.phone || prev.phone,
              address: defaultAddr.address_line || prev.address,
              city: defaultAddr.city || prev.city,
              state: defaultAddr.state || prev.state,
              pincode: defaultAddr.postal_code || prev.pincode
            }));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(String(addr.address_id));
    setCustomer({
      name: addr.full_name,
      email: customer.email,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.postal_code
    });
    setErrors({});
  };

  const shippingFee = deliveryMethod === 'EXPRESS' ? 149 : 0;
  const finalTotal = total + shippingFee;

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 page-transition">
        <h2 className="text-xl font-bold text-brand-dark">Your ClickCart is empty</h2>
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
    if (e) e.preventDefault();
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
        })),
        deliveryMethod,
        shippingFee,
        paymentMethod
      };

      const response = await api.createOrder(payload);

      if (response.success && response.data) {
        setIsSuccess(true);
        success('Order placed successfully!');
        clearCart();
        
        // Brief success hold before navigating to Order Success page
        setTimeout(() => {
          navigate(`/order-success/${response.data.order_number}`, {
            state: {
              order: {
                ...response.data,
                deliveryMethod: deliveryMethod === 'EXPRESS' ? 'Express Delivery' : 'Standard Delivery',
                paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'
              }
            }
          });
        }, 600);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Review delivery details and finalize your purchase.
          </p>
        </div>

        <Link
          to="/cart"
          className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover inline-flex items-center gap-1 transition-colors duration-fast"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs animate-pop-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Could not place order</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Structured Multi-Section Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Form & Options (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Saved Addresses (If Logged In) */}
          {isAuthenticated && savedAddresses.length > 0 && (
            <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-subtle space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <span>Choose Delivery Address</span>
                </h2>
              </div>

              <div className="space-y-2.5 pt-1">
                {savedAddresses.map((addr) => (
                  <SelectionCard
                    key={addr.address_id}
                    name="addressSelection"
                    value={String(addr.address_id)}
                    checked={selectedAddressId === String(addr.address_id)}
                    onChange={() => handleSelectAddress(addr)}
                    label={addr.full_name}
                    description={`${addr.address_line}, ${addr.city}, ${addr.state} - ${addr.postal_code}`}
                    badge={addr.is_default ? 'Default' : null}
                  />
                ))}

                <SelectionCard
                  name="addressSelection"
                  value="new"
                  checked={selectedAddressId === 'new'}
                  onChange={() => {
                    setSelectedAddressId('new');
                    setCustomer({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: ''
                    });
                  }}
                  label="Deliver to a Different Address"
                  description="Enter new shipping and contact information below"
                />
              </div>
            </div>
          )}

          {/* Section 2: Contact & Shipping Form */}
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-subtle space-y-4">
            <h2 className="text-sm font-bold text-brand-dark pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Contact & Delivery Details</span>
              <span className="text-[11px] font-normal text-brand-muted">Required for delivery</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  required
                  error={errors.name}
                />

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  required
                  error={errors.email}
                />
              </div>

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={customer.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                error={errors.phone}
              />

              <FormInput
                label="Street Address / Flat / Floor"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Flat 402, Green Avenue, Landmark Road"
                required
                error={errors.address}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormInput
                  label="City"
                  name="city"
                  value={customer.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  required
                  error={errors.city}
                />

                <FormInput
                  label="State / Region"
                  name="state"
                  value={customer.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  required
                  error={errors.state}
                />

                <FormInput
                  label="PIN / Postal Code"
                  name="pincode"
                  value={customer.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  required
                  error={errors.pincode}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Method */}
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-subtle space-y-3">
            <h2 className="text-sm font-bold text-brand-dark pb-2 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-primary" />
              <span>Delivery Method</span>
            </h2>

            <div className="space-y-2.5 pt-1">
              <SelectionCard
                name="deliveryMethod"
                value="STANDARD"
                checked={deliveryMethod === 'STANDARD'}
                onChange={() => setDeliveryMethod('STANDARD')}
                icon={Truck}
                label="Standard Delivery"
                description="Estimated arrival in 3–5 business days"
                priceTag="Free"
                badge="Recommended"
              />

              <SelectionCard
                name="deliveryMethod"
                value="EXPRESS"
                checked={deliveryMethod === 'EXPRESS'}
                onChange={() => setDeliveryMethod('EXPRESS')}
                icon={Truck}
                label="Express Dispatch"
                description="Priority handling, arrives within 24–48 hours"
                priceTag="₹149"
              />
            </div>
          </div>

          {/* Section 4: Payment Method */}
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-subtle space-y-3">
            <h2 className="text-sm font-bold text-brand-dark pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-primary" />
              <span>Payment Option</span>
            </h2>

            <div className="space-y-2.5 pt-1">
              <SelectionCard
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                icon={Banknote}
                label="Cash on Delivery (COD)"
                description="Pay in cash or UPI directly when your shipment arrives at your doorstep"
                badge="Popular"
              />

              <SelectionCard
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={() => setPaymentMethod('ONLINE')}
                icon={CreditCard}
                label="Online Payment (Cards / UPI / NetBanking)"
                description="Secure payment gateway transaction with instant order confirmation"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-subtle space-y-5 sticky top-24">
            <h2 className="text-sm font-bold text-brand-dark pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-brand-primary bg-indigo-50 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            {/* Item Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3 text-xs">
                  <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark truncate">{item.product_name}</p>
                    <p className="text-slate-500 text-[11px]">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-brand-dark">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated GST Tax (18%)</span>
                <span className="font-semibold text-brand-dark">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-brand-dark">
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-brand-dark">Total Amount</span>
                <span className="text-lg font-bold text-brand-primary">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Primary Order Now Animated Button */}
            <div className="pt-2">
              <AnimatedOrderButton
                text="Place Order"
                loadingText="Securing Order..."
                successText="Order Placed ✓"
                loading={submitting}
                isSuccess={isSuccess}
                onClick={handleSubmitOrder}
                fullWidth
                size="lg"
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Encrypted Checkout • 100% Genuine Guarantee</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
