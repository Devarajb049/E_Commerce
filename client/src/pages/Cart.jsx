import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const { items, totalItemsCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <EmptyState
          title="Your cart is empty."
          message="Looks like you haven't added anything to your cart yet. Explore our products and find items you love."
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Shopping Cart ({totalItemsCount})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Review your products and adjust quantities before proceeding to checkout.
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
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
            <CartItem key={item.product_id} item={item} />
          ))}
        </div>

        {/* Order Summary (4 Cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <CartSummary />
        </div>

      </div>
    </div>
  );
};

export default Cart;
