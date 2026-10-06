import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const { items, totalItemsCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Your cart is waiting."
          message="Discover products you love and add them to your ClickCart with a single click."
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight flex items-center gap-3">
            <span>Shopping Cart</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 bg-indigo-50 text-brand-indigo rounded-full">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Review your chosen items, adjust quantities, or proceed to secure checkout.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-indigo hover:text-indigo-800 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main 2-Column Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary (4 Columns) */}
        <div className="lg:col-span-4 sticky top-24">
          <CartSummary />
        </div>

      </div>
    </div>
  );
};

export default Cart;
