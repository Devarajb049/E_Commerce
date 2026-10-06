import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
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
    <div className="group bg-white border border-brand-border rounded-card overflow-hidden hover:border-gray-300 transition-all flex flex-col justify-between shadow-subtle hover:shadow-elevated">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center border-b border-gray-100">
        {imgError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
            <img src="/logo-icon.svg" alt="ClickCart item" className="w-10 h-10 opacity-30 mb-1.5" />
            <span className="text-[11px] font-medium text-gray-400">ClickCart Product</span>
          </div>
        ) : (
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
            alt={product.product_name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-200"
          />
        )}

        {/* Semantic Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-brand-error bg-red-50 border border-red-200 rounded-full">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-brand-warning bg-amber-50 border border-amber-200 rounded-full">
              Only {product.stock_quantity} left
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-brand-success bg-green-50 border border-green-200 rounded-full">
              In stock
            </span>
          )}
        </div>

        {/* Category Tag */}
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-white/95 border border-gray-200/80 rounded-md">
          {product.category_name}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <Link 
            to={`/products/${product.product_id}`} 
            className="block group-hover:text-brand-indigo transition-colors"
          >
            <h3 className="font-semibold text-sm text-brand-dark line-clamp-1 leading-snug">
              {product.product_name}
            </h3>
          </Link>

          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
            {product.description || 'Authentic retail item from ClickCart.'}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-brand-dark tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product.product_id}`}
              className="p-2 rounded-btn text-gray-500 hover:text-brand-dark hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors"
              title="View details"
              aria-label={`View details for ${product.product_name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-indigo text-white hover:bg-indigo-700 active:scale-[0.98]'
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
