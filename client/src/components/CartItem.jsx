import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(item.price);

  const lineSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(item.price * item.quantity);

  const isMaxStock = item.quantity >= item.stock_quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-brand-border rounded-2xl gap-4 hover:border-gray-300 transition-colors">
      {/* Product Image and Details */}
      <div className="flex items-center gap-4 flex-1">
        <Link to={`/products/${item.product_id}`} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
          {imgError ? (
            <img src="/logo-icon.svg" alt="ClickCart fallback" className="w-8 h-8 opacity-40" />
          ) : (
            <img
              src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
              alt={item.product_name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-brand-indigo uppercase tracking-wider">
            {item.category_name}
          </span>
          <Link to={`/products/${item.product_id}`} className="block hover:text-brand-indigo transition-colors">
            <h4 className="font-semibold text-sm sm:text-base text-brand-dark truncate">
              {item.product_name}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              {formattedPrice} each
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400">
              Stock: {item.stock_quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity & Subtotal Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        
        {/* Stepper */}
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-0.5 shadow-xs">
          <button
            onClick={() => decreaseQuantity(item.product_id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-brand-indigo hover:bg-gray-100 transition-colors shadow-xs"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-9 text-center text-xs sm:text-sm font-bold text-brand-dark">
            {item.quantity}
          </span>

          <button
            onClick={() => increaseQuantity(item.product_id)}
            disabled={isMaxStock}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs transition-colors ${
              isMaxStock
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-brand-indigo hover:bg-gray-100'
            }`}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[80px]">
          <span className="block text-xs text-gray-400">Subtotal</span>
          <span className="text-sm sm:text-base font-bold text-brand-dark">
            {lineSubtotal}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFromCart(item.product_id)}
          className="p-2 text-gray-400 hover:text-brand-error hover:bg-red-50 rounded-xl transition-colors"
          title="Remove from cart"
          aria-label={`Remove ${item.product_name} from cart`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
