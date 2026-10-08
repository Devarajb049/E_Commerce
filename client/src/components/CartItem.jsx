import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [qtyAnim, setQtyAnim] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(item.price);

  const lineSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(item.price * item.quantity);

  const isMaxStock = item.quantity >= item.stock_quantity;

  const handleRemove = () => {
    setIsRemoving(true);
    // Smooth collapse transition (Rule #20)
    setTimeout(() => {
      removeFromCart(item.product_id);
    }, 200);
  };

  const handleIncrease = () => {
    setQtyAnim(true);
    increaseQuantity(item.product_id);
    setTimeout(() => setQtyAnim(false), 200);
  };

  const handleDecrease = () => {
    setQtyAnim(true);
    decreaseQuantity(item.product_id);
    setTimeout(() => setQtyAnim(false), 200);
  };

  return (
    <div
      className={`transition-all duration-200 overflow-hidden ${
        isRemoving
          ? 'opacity-0 max-h-0 py-0 mb-0 scale-[0.98] border-transparent'
          : 'opacity-100 max-h-48 py-4 mb-3 bg-white border border-brand-border rounded-[12px] shadow-subtle'
      }`}
    >
      <div className="px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Product Image and Details */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <Link 
            to={`/products/${item.product_id}`} 
            className="w-16 h-16 rounded-[8px] bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center p-1 group"
          >
            {imgError ? (
              <img src="/logo-icon.svg" alt="ClickCart" className="w-6 h-6 opacity-40" />
            ) : (
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                alt={item.product_name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-[6px] group-hover:scale-105 transition-transform duration-fast"
              />
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              {item.category_name}
            </span>
            <Link to={`/products/${item.product_id}`} className="block hover:text-brand-indigo transition-colors duration-fast">
              <h4 className="font-semibold text-sm text-brand-dark truncate">
                {item.product_name}
              </h4>
            </Link>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <span>{formattedPrice} each</span>
              <span>•</span>
              <span className={item.stock_quantity <= 5 ? 'text-brand-warning font-medium' : ''}>
                {item.stock_quantity} in stock
              </span>
            </div>
          </div>
        </div>

        {/* Steppers & Line Total */}
        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          
          {/* Quantity Controls (Tactile micro-interaction) */}
          <div className="flex items-center border border-brand-border rounded-[8px] bg-gray-50">
            <button
              onClick={handleDecrease}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-brand-dark hover:bg-white rounded-l-[7px] transition-colors duration-fast active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span
              className={`w-8 text-center text-xs font-bold text-brand-dark transition-transform duration-fast ${
                qtyAnim ? 'scale-110 text-brand-indigo' : 'scale-100'
              }`}
            >
              {item.quantity}
            </span>

            <button
              onClick={handleIncrease}
              disabled={isMaxStock}
              className={`w-7 h-7 flex items-center justify-center text-gray-600 rounded-r-[7px] transition-colors duration-fast active:scale-95 ${
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
          <div className="text-right min-w-[80px]">
            <span className="text-sm font-bold text-brand-dark block tracking-tight">
              {lineSubtotal}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="p-1.5 text-gray-400 hover:text-brand-error hover:bg-red-50 rounded-[8px] transition-colors duration-fast active:scale-95"
            title="Remove item"
            aria-label={`Remove ${item.product_name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartItem;
