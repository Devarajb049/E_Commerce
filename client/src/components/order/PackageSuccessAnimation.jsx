import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import AnimatedOrderButton from '../common/AnimatedOrderButton';

/**
 * ClickCart Production-Grade Order Placed Package Success Animation
 * Custom SVG parcel with opening lid, drawing checkmark, and real order metadata.
 */
const PackageSuccessAnimation = ({
  orderId,
  orderNumber,
  totalAmount,
  customerName,
  deliveryMethod = 'Standard Delivery',
  onViewOrder,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 px-4">
      
      {/* HERO PACKAGE ANIMATION CONTAINER */}
      <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-50/80 blur-xl pointer-events-none" />

        <div className="relative anim-package-enter">
          {/* Custom Stylized ClickCart Parcel SVG */}
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md select-none"
          >
            {/* Box Shadow Base */}
            <ellipse cx="70" cy="122" rx="46" ry="7" fill="#E5E7EB" opacity="0.6" />

            {/* Box Body */}
            <path
              d="M32 58L70 76L108 58V104L70 120L32 104V58Z"
              fill="#4338CA"
            />
            {/* Left Face shading */}
            <path
              d="M32 58L70 76V120L32 104V58Z"
              fill="#3730A3"
            />
            {/* Right Face highlight */}
            <path
              d="M70 76L108 58V104L70 120V76Z"
              fill="#4F46E5"
            />

            {/* ClickCart Orange Center Packaging Tape */}
            <path
              d="M62 72L70 76L78 72V116L70 120L62 116V72Z"
              fill="#F97316"
            />

            {/* Stylized ClickCart Logo on Box Front */}
            <circle cx="70" cy="94" r="5" fill="#FFFFFF" opacity="0.9" />
            <path
              d="M68 94L70 91L72 94H68Z"
              fill="#4F46E5"
            />

            {/* Opening Lid / Flaps with CSS animation */}
            <g className="anim-lid-open">
              {/* Left Flap */}
              <polygon
                points="32,58 70,76 70,68 32,50"
                fill="#6366F1"
                opacity="0.95"
              />
              {/* Right Flap */}
              <polygon
                points="70,76 108,58 108,50 70,68"
                fill="#818CF8"
                opacity="0.95"
              />
              {/* Top Seal / Tape */}
              <polygon
                points="62,64 78,56 82,60 66,68"
                fill="#FB923C"
              />
            </g>

            {/* Verified Floating Checkmark with self-drawing stroke animation */}
            <g transform="translate(48, 16)">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="#16A34A"
                className="filter drop-shadow-sm"
              />
              <path
                d="M14 22L19 27L30 16"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="anim-check-draw"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* CONFIRMATION TEXT SEQUENCE (Staggers in) */}
      <div className="anim-text-reveal space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span>✓ Order Placed Successfully</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
          Thank you{customerName ? `, ${customerName}` : ''}!
        </h1>

        <p className="text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
          Your order has been securely confirmed and registered in our fulfillment queue.
        </p>

        {/* ORDER DETAILS SUMMARY PILL */}
        <div className="bg-white border border-brand-border rounded-xl p-4 my-5 shadow-subtle text-left space-y-2.5 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
            <span className="text-brand-muted font-medium">Order Reference:</span>
            <span className="font-mono font-bold text-brand-dark">{orderNumber || `#CC-${orderId}`}</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
            <span className="text-brand-muted font-medium">Delivery:</span>
            <span className="font-medium text-brand-dark">{deliveryMethod}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-muted font-medium">Total Paid / Payable:</span>
            <span className="text-sm font-bold text-brand-primary">
              ₹{parseFloat(totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onViewOrder ? (
            <AnimatedOrderButton
              text="Track Order"
              icon={Eye}
              onClick={onViewOrder}
              className="w-full sm:w-auto"
            />
          ) : (
            <Link to={`/orders`}>
              <AnimatedOrderButton
                text="View My Orders"
                icon={Eye}
                className="w-full sm:w-auto"
              />
            </Link>
          )}

          <Link
            to="/products"
            className="w-full sm:w-auto py-2.5 px-5 text-sm font-medium rounded-lg border border-brand-border bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-brand-muted" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageSuccessAnimation;
