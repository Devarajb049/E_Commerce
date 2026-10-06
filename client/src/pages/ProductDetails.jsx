import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProduct(id);
        if (res.success) {
          setProduct(res.data);
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
    return <LoadingSpinner fullScreen message="Loading ClickCart product details..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} onRetry={() => navigate('/products')} />;
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const cartItem = items.find((i) => i.product_id === product.product_id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;
  const remainingAvailable = Math.max(0, product.stock_quantity - currentCartQty);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, quantity);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-brand-muted">
        <Link to="/" className="hover:text-brand-indigo transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-indigo transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_id}`} className="hover:text-brand-indigo transition-colors">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-brand-dark font-medium truncate max-w-xs">{product.product_name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Product Image */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs flex items-center justify-center">
            {imgError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-16 h-16 opacity-40 mb-3" />
                <span className="text-sm font-semibold">ClickCart Authentic Quality</span>
              </div>
            ) : (
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                alt={product.product_name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Stock Overlay */}
            <div className="absolute top-4 left-4">
              {isOutOfStock ? (
                <span className="px-3 py-1 text-xs font-bold text-white bg-brand-error rounded-full shadow-sm">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 text-xs font-bold text-white bg-brand-orange rounded-full shadow-sm animate-pulse">
                  Only {product.stock_quantity} left in stock!
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full shadow-sm">
                  In Stock ({product.stock_quantity} available)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, Quantity & CTA */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-indigo bg-indigo-50 rounded-lg">
              {product.category_name}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight leading-snug">
              {product.product_name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-dark">4.9</span>
              <span className="text-xs text-brand-muted">• 128 verified ratings</span>
            </div>

            {/* Price Box */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-xs text-brand-muted">Standard 18% GST calculated at checkout</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'Premium retail product sourced with ClickCart quality standards.'}
              </p>
            </div>

            {/* In Cart Indicator */}
            {currentCartQty > 0 && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                <span>You currently have <strong>{currentCartQty}</strong> in your cart.</span>
                <Link to="/cart" className="font-bold underline text-brand-indigo">
                  View Cart
                </Link>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Quantity
                </span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:text-brand-indigo hover:bg-gray-100 transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-brand-dark">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:text-brand-indigo hover:bg-gray-100 transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-brand-muted">
                  (Max {product.stock_quantity})
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-indigo text-white hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <Link
                to="/products"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-[11px] text-brand-muted text-center">
              <div className="p-2 bg-gray-50 rounded-lg flex flex-col items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Fast Shipping</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg flex flex-col items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                <span>100% Genuine</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg flex flex-col items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-brand-success" />
                <span>Easy Return</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
