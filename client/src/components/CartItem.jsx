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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-brand-border rounded-card gap-4 hover:border-gray-300 transition-colors">
      
      {/* Product Image and Details */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <Link 
          to={`/products/${item.product_id}`} 
          className="w-16 h-16 rounded-btn bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center"
        >
          {imgError ? (
            <img src="/logo-icon.svg" alt="ClickCart" className="w-6 h-6 opacity-40" />
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
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
            {item.category_name}
          </span>
          <Link to={`/products/${item.product_id}`} className="block hover:text-brand-indigo transition-colors">
            <h4 className="font-semibold text-sm text-brand-dark truncate">
              {item.product_name}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span>{formattedPrice} each</span>
            <span>•</span>
            <span className={item.stock_quantity <= 5 ? 'text-brand-warning font-medium' : ''}>
              {item.stock_quantity} available
            </span>
          </div>
        </div>
      </div>

      {/* Steppers & Line Total */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        
        {/* Quantity Controls */}
        <div className="flex items-center border border-brand-border rounded-btn bg-gray-50">
          <button
            onClick={() => decreaseQuantity(item.product_id)}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-brand-dark hover:bg-white rounded-l-btn transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="w-8 text-center text-xs font-bold text-brand-dark">
            {item.quantity}
          </span>

          <button
            onClick={() => increaseQuantity(item.product_id)}
            disabled={isMaxStock}
            className={`w-7 h-7 flex items-center justify-center text-gray-600 rounded-r-btn transition-colors ${
              isMaxStock
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:text-brand-dark hover:bg-white'
            }`}
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Line Subtotal */}
        <div className="text-right min-w-[75px]">
          <span className="text-sm font-bold text-brand-dark block">
            {lineSubtotal}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFromCart(item.product_id)}
          className="p-1.5 text-gray-400 hover:text-brand-error hover:bg-red-50 rounded-btn transition-colors"
          title="Remove item"
          aria-label={`Remove ${item.product_name} from cart`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default CartItem;
