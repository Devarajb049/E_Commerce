import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  Zap, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AnimatedOrderButton from '../components/common/AnimatedOrderButton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProduct(id);
        if (res.success) {
          setProduct(res.data);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading product details..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} onRetry={() => navigate('/products')} />;
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const cartItem = items.find((i) => i.product_id === product.product_id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  // Multi-image gallery list (fallback to product image and curated perspectives)
  const galleryImages = [
    product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
  ];

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  // Add-to-cart tactile micro-interaction (Rule #18)
  const handleAddToCart = () => {
    if (isOutOfStock || isAdding || justAdded) return;
    setIsAdding(true);

    setTimeout(() => {
      const added = addToCart(product, quantity);
      setIsAdding(false);
      if (added) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
      }
    }, 120);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link to="/" className="hover:text-brand-indigo transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/products" className="hover:text-brand-indigo transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to={`/products?category=${product.category_id}`} className="hover:text-brand-indigo transition-colors">
          {product.category_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-brand-dark font-medium truncate max-w-xs">{product.product_name}</span>
      </nav>

      {/* Main Showcase Surface (Rule #32: Image gallery | Product information) */}
      <div className="bg-white border border-brand-border rounded-card p-6 sm:p-8 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: IMAGE GALLERY (Rule #27: subtle zoom, hover, thumbnail selection, image transition) */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Main Selected Image */}
          <div className="relative aspect-square w-full rounded-[10px] overflow-hidden bg-gray-50 border border-brand-border flex items-center justify-center group">
            {imgError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <img src="/logo-icon.svg" alt="ClickCart" className="w-12 h-12 opacity-30 mb-2" />
                <span className="text-xs font-semibold">ClickCart Item</span>
              </div>
            ) : (
              <img
                src={galleryImages[selectedImageIndex] || galleryImages[0]}
                alt={product.product_name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-normal ease-out"
              />
            )}

            {/* Semantic Stock Status Badge */}
            <div className="absolute top-3 left-3">
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-brand-error bg-red-50 border border-red-200 rounded-full">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-brand-warning bg-amber-50 border border-amber-200 rounded-full">
                  Only {product.stock_quantity} left
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                  In Stock ({product.stock_quantity} available)
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Selection Strip (Rule #27) */}
          <div className="flex items-center gap-2.5">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-16 rounded-[8px] overflow-hidden border-2 transition-all duration-fast ${
                  selectedImageIndex === idx
                    ? 'border-brand-indigo ring-2 ring-indigo-50 shadow-subtle'
                    : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Select product image view ${idx + 1}`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFORMATION & PURCHASE FORM */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-brand-indigo bg-indigo-50 border border-indigo-100 rounded-[8px]">
              {product.category_name}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight leading-snug">
              {product.product_name}
            </h1>

            {/* Price Row */}
            <div className="pt-2">
              <span className="text-3xl font-bold text-brand-dark tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-xs text-brand-muted block mt-0.5">
                Standard 18% GST included at checkout • Fast dispatch
              </span>
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Product Details
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'Authentic retail item from ClickCart. Guaranteed dispatch within 24 hours.'}
              </p>
            </div>

            {currentCartQty > 0 && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-[8px] text-xs text-indigo-950 flex items-center justify-between">
                <span>Currently in your cart: <strong>{currentCartQty}</strong> units</span>
                <Link to="/cart" className="font-semibold underline text-brand-indigo hover:text-brand-indigo-hover">
                  View Cart
                </Link>
              </div>
            )}
          </div>

          {/* Quantity Stepper & CTA Hierarchy (Rule #32) */}
          <div className="pt-4 border-t border-gray-100 space-y-5">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quantity
                </span>
                <div className="flex items-center border border-brand-border rounded-[8px] bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-dark disabled:opacity-40 transition-colors active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-brand-dark">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-dark disabled:opacity-40 transition-colors active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA Hierarchy (Rule #32: [ Add to Cart ] and [ Buy Now ], NOT visually identical) */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Primary: Add to Cart (Rule #18 micro-interaction) */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`w-full sm:flex-1 py-3 px-6 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-fast select-none active:scale-[0.98] ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-indigo text-white hover:bg-brand-indigo-hover'
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              {/* Accent: Order Now (Animated CTA) */}
              {!isOutOfStock && (
                <AnimatedOrderButton
                  text="Order Now"
                  size="md"
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto py-3 px-6 text-xs font-semibold"
                />
              )}
            </div>

            {/* Retail Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-[11px] text-brand-muted text-center">
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Truck className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
                <span>7-Day Returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
