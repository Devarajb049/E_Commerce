import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, AlertCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const added = addToCart(product, 1);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="group bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center">
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
            <img src="/logo-icon.svg" alt="ClickCart fallback" className="w-12 h-12 opacity-30 mb-2" />
            <span className="text-xs font-medium">ClickCart Product</span>
          </div>
        ) : (
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
            alt={product.product_name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand-error rounded-full shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand-orange rounded-full shadow-sm animate-pulse">
              Only {product.stock_quantity} left!
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 rounded-full shadow-sm">
              In Stock
            </span>
          )}
        </div>

        {/* Category Pill Overlay */}
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-white/90 backdrop-blur-sm rounded-md shadow-xs">
          {product.category_name}
        </span>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating Dummy for E-Commerce Polish */}
          <div className="flex items-center gap-1 mb-1.5 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-semibold text-brand-dark">4.8</span>
            <span className="text-[11px] text-gray-400">(42 reviews)</span>
          </div>

          <Link to={`/products/${product.product_id}`} className="block group-hover:text-brand-indigo transition-colors">
            <h3 className="font-semibold text-sm sm:text-base text-brand-dark line-clamp-1 leading-snug">
              {product.product_name}
            </h3>
          </Link>

          <p className="text-xs text-brand-muted line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Authentic quality guaranteed on ClickCart.'}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-4 mt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-brand-muted block">Price</span>
            <span className="text-lg font-bold text-brand-dark tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Link
              to={`/products/${product.product_id}`}
              className="p-2 rounded-xl text-gray-600 hover:text-brand-indigo bg-gray-100 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
              title="View product details"
              aria-label="View product details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-indigo text-white hover:bg-indigo-700 shadow-sm active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
