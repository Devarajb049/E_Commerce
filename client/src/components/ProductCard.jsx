import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AnimatedOrderButton from './common/AnimatedOrderButton';

/**
 * ClickCart Production-Grade Product Card
 * Combines clean card structure, technical metadata (CC-PROD-XXX),
 * subtle hover zoom, secondary Add to Cart, and primary Order Now CTA.
 */
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const technicalCode = `CC-PROD-${String(product.product_id).padStart(3, '0')}`;

  // Add-to-cart micro-interaction
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding || justAdded) return;

    setIsAdding(true);
    setTimeout(() => {
      const added = addToCart(product, 1);
      setIsAdding(false);
      if (added) {
        setJustAdded(true);
        setTimeout(() => {
          setJustAdded(false);
        }, 1200);
      }
    }, 150);
  };

  // Immediate "Order Now" action: Adds to cart & jumps straight to checkout
  const handleOrderNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="group bg-white border border-brand-border rounded-[14px] overflow-hidden flex flex-col justify-between shadow-subtle hover:shadow-elevated hover:border-indigo-200 hover:-translate-y-[2px] transition-all duration-normal select-none">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50/60 overflow-hidden flex items-center justify-center p-2.5">
        <div className="w-full h-full rounded-[10px] overflow-hidden bg-white border border-slate-100 flex items-center justify-center relative">
          {imgError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
              <img src="/logo-icon.svg" alt="ClickCart item" className="w-10 h-10 opacity-30 mb-1" />
              <span className="text-[11px] font-medium text-slate-400">ClickCart</span>
            </div>
          ) : (
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
              alt={product.product_name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-normal"
            />
          )}

          {/* Quick Details Floating Eye Button */}
          <Link
            to={`/products/${product.product_id}`}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-600 hover:text-brand-primary hover:bg-white shadow-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-fast"
            title="View details"
            aria-label={`View details for ${product.product_name}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Technical Product Code Tag (Futuristic Detail) */}
        <div className="absolute top-4 left-4">
          <span className="font-mono text-[10px] font-semibold text-slate-600 bg-white/95 backdrop-blur-sm border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            {technicalCode}
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider block">
              {product.category_name}
            </span>

            {/* Semantic Stock Indicator */}
            {isOutOfStock ? (
              <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                <span>Out of Stock</span>
              </span>
            ) : isLowStock ? (
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                <span>Only {product.stock_quantity} left</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>In Stock</span>
              </span>
            )}
          </div>

          <Link 
            to={`/products/${product.product_id}`} 
            className="block group-hover:text-brand-primary transition-colors duration-fast"
          >
            <h3 className="font-bold text-sm text-brand-dark line-clamp-1 leading-snug">
              {product.product_name}
            </h3>
          </Link>

          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
            {product.description || 'Authentic retail item from ClickCart.'}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-brand-dark tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-[11px] text-brand-muted">incl. taxes</span>
          </div>

          {/* DUAL CTA ROW: Secondary Add to Cart + Primary Order Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all select-none active:scale-[0.98] ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
              aria-label={justAdded ? 'Added to cart' : isOutOfStock ? 'Sold out' : `Add ${product.product_name} to cart`}
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <AnimatedOrderButton
              text="Order Now"
              size="sm"
              disabled={isOutOfStock}
              onClick={handleOrderNow}
              className="w-full text-xs py-2"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
