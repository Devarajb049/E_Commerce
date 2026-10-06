import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, Zap } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
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
    return <LoadingSpinner fullScreen message="Loading product details..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} onRetry={() => navigate('/products')} />;
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const cartItem = items.find((i) => i.product_id === product.product_id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;

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
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-muted">
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

      {/* Main Showcase Surface */}
      <div className="bg-white border border-brand-border rounded-card p-6 sm:p-8 shadow-subtle grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Image */}
        <div className="md:col-span-6 flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-md rounded-btn overflow-hidden bg-gray-50 border border-brand-border flex items-center justify-center">
            {imgError ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <img src="/logo-icon.svg" alt="ClickCart" className="w-12 h-12 opacity-30 mb-2" />
                <span className="text-xs font-semibold">ClickCart Item</span>
              </div>
            ) : (
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                alt={product.product_name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Semantic Stock Status */}
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
                <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-success bg-green-50 border border-green-200 rounded-full">
                  In Stock ({product.stock_quantity} units)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase Form */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-brand-indigo bg-indigo-50 border border-indigo-100 rounded-btn">
              {product.category_name}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight leading-snug">
              {product.product_name}
            </h1>

            {/* Price Box */}
            <div className="pt-2">
              <span className="text-3xl font-extrabold text-brand-dark tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-xs text-brand-muted block mt-0.5">
                Standard 18% GST calculated at checkout • Free shipping
              </span>
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-gray-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Product Details
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'Authentic quality guaranteed on ClickCart.'}
              </p>
            </div>

            {currentCartQty > 0 && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-btn text-xs text-indigo-950 flex items-center justify-between">
                <span>Currently in your cart: <strong>{currentCartQty}</strong></span>
                <Link to="/cart" className="font-bold underline text-brand-indigo">
                  View Cart
                </Link>
              </div>
            )}
          </div>

          {/* Quantity & CTAs */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quantity
                </span>
                <div className="flex items-center border border-brand-border rounded-btn bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-dark disabled:opacity-40"
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
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-dark disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full sm:flex-1 btn-primary py-3 ${
                  justAdded ? 'bg-emerald-600 hover:bg-emerald-600' : ''
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto btn-secondary py-3 px-6"
                >
                  <Zap className="w-4 h-4 text-brand-orange" />
                  <span>Buy Now</span>
                </button>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-[11px] text-brand-muted text-center">
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Truck className="w-3.5 h-3.5 text-brand-indigo" />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-indigo" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <RotateCcw className="w-3.5 h-3.5 text-brand-indigo" />
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
