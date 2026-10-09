import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Package, 
  LockKeyhole,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const { items, totalItemsCount } = useCart();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    document.title = 'Cart | ClickKart';
  }, []);

  // 1. GUEST AUTHENTICATION GATE SCREEN (Rule #2)
  if (!isAuthenticated && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 page-transition">
        <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-10 shadow-subtle text-center space-y-6">
          
          {/* Brand & Padlock Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo shadow-2xs">
            <LockKeyhole className="w-8 h-8" />
          </div>

          {/* Exact Required Heading & Description */}
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              Your shopping cart awaits
            </h1>
            <p className="text-sm text-brand-muted leading-relaxed">
              Sign in or create an account to view your cart and continue shopping.
            </p>
          </div>

          {/* Guest items status notice */}
          {totalItemsCount > 0 && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-2 max-w-md mx-auto">
              <Package className="w-4 h-4 text-brand-orange flex-shrink-0" />
              <span>
                You have <strong>{totalItemsCount} item{totalItemsCount > 1 ? 's' : ''}</strong> saved in your guest bag. They will automatically merge with your account upon signing in!
              </span>
            </div>
          )}

          {/* Clear Auth Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            <Link
              to="/login?redirect=/cart"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-bold text-white bg-brand-indigo hover:bg-brand-indigo-hover shadow-subtle transition-all duration-fast active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>

            <Link
              to="/register?redirect=/cart"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-bold text-brand-dark bg-gray-50 hover:bg-gray-100 border border-brand-border shadow-2xs transition-all duration-fast active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-brand-indigo" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Continue Shopping Button */}
          <div className="pt-4 border-t border-gray-100">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-indigo transition-colors duration-fast"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Encrypted checkout • Instant inventory reservation on order placement</span>
          </div>

        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED EMPTY CART STATE
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-transition">
        <EmptyState
          icon={ShoppingBag}
          title="Your ClickKart is empty"
          message="You haven't added any products to your cart yet. Explore our catalog or check out today's Super Sale offers."
          actionLabel="Explore Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  // 3. AUTHENTICATED ACTIVE CART VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Shopping Cart ({totalItemsCount})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Review your selected products and adjust quantities before proceeding to checkout.
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-brand-indigo-hover inline-flex items-center gap-1 transition-colors duration-fast"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Cart Line Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {items.map((item) => (
            <CartItem key={item.product_id || item.id} item={item} />
          ))}
        </div>

        {/* Order Summary (4 Cols sticky) */}
        <div className="lg:col-span-4 sticky top-20">
          <CartSummary />
        </div>

      </div>
    </div>
  );
};

export default Cart;
