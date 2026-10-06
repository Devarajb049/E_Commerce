import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Trash2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartSummary = ({ showCheckoutBtn = true, showClearBtn = true }) => {
  const { subtotal, tax, total, clearCart, items } = useCart();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="bg-white border border-brand-border rounded-card p-5 sm:p-6 shadow-subtle space-y-5">
      <h3 className="text-base font-bold text-brand-dark pb-3 border-b border-gray-100">
        Order Summary
      </h3>

      <div className="space-y-2.5 text-xs sm:text-sm">
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

        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
          <span className="text-sm font-bold text-brand-dark">Total</span>
          <div className="text-right">
            <span className="text-xl font-extrabold text-brand-dark tracking-tight">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-1">
        {showCheckoutBtn && (
          <Link
            to="/checkout"
            className="w-full btn-primary py-3"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            to="/products"
            className="text-gray-500 hover:text-brand-indigo font-medium inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue shopping
          </Link>

          {showClearBtn && items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-brand-error font-medium inline-flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
