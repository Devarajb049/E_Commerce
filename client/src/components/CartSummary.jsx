import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
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
    <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-brand-dark pb-4 border-b border-gray-100">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-brand-muted">
          <span>Items Subtotal</span>
          <span className="font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-brand-muted">
          <span className="flex items-center gap-1">
            Standard Tax (GST 18%)
          </span>
          <span className="font-semibold text-brand-dark">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between text-brand-muted">
          <span>Shipping Charges</span>
          <span className="font-semibold text-emerald-600">FREE</span>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
          <span className="text-base font-bold text-brand-dark">Grand Total</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-brand-dark tracking-tight">
              {formatCurrency(total)}
            </span>
            <span className="block text-[11px] text-gray-400">Inclusive of all taxes</span>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="p-3 bg-indigo-50/60 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900 border border-indigo-100/70">
        <ShieldCheck className="w-4 h-4 text-brand-indigo flex-shrink-0" />
        <span>Safe & Encrypted Checkout • ClickCart Buyer Protection</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {showCheckoutBtn && (
          <Link
            to="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 active:scale-[0.99]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-indigo transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>

          {showClearBtn && items.length > 0 && (
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
