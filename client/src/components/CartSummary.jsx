import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Trash2, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AnimatedOrderButton from './common/AnimatedOrderButton';

const CartSummary = ({ showCheckoutBtn = true, showClearBtn = true }) => {
  const { subtotal, tax, total, clearCart, items } = useCart();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="bg-white border border-brand-border rounded-[12px] p-5 sm:p-6 shadow-subtle space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-brand-dark">
          Order Summary
        </h3>
        <span className="text-xs text-brand-muted">
          {items.reduce((acc, i) => acc + i.quantity, 0)} items
        </span>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Items Subtotal</span>
          <span className="font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Applicable GST (18%)</span>
          <span className="font-semibold text-brand-dark">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between text-gray-600 items-center">
          <span>Standard Delivery</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
            FREE
          </span>
        </div>

        {/* Visually dominant grand total (Rule #33) */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-brand-dark block">Grand Total</span>
            <span className="text-[11px] text-brand-muted">Inclusive of all taxes</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-brand-dark tracking-tight">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-1">
        {showCheckoutBtn && (
          <Link to="/checkout" className="block w-full">
            <AnimatedOrderButton
              text="Proceed to Checkout"
              fullWidth
              size="lg"
            />
          </Link>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            to="/products"
            className="text-gray-500 hover:text-brand-indigo font-medium inline-flex items-center gap-1 transition-colors duration-fast"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue shopping
          </Link>

          {showClearBtn && items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-brand-error font-medium inline-flex items-center gap-1 transition-colors duration-fast"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear cart
            </button>
          )}
        </div>
      </div>

      {/* Trust pill */}
      <div className="p-3 bg-gray-50 rounded-[8px] border border-gray-100 flex items-center gap-2 text-[11px] text-brand-muted">
        <ShieldCheck className="w-4 h-4 text-brand-success flex-shrink-0" />
        <span>Secure commercial checkout • Instant GST receipt</span>
      </div>
    </div>
  );
};

export default CartSummary;
