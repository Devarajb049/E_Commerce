import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-brand-border mt-auto">
      {/* Brand Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-brand-indigo flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">Fast Dispatch</p>
              <p className="text-xs text-brand-muted">Orders shipped in 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">100% Genuine</p>
              <p className="text-xs text-brand-muted">Authentic retail items</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-brand-success flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">Easy Returns</p>
              <p className="text-xs text-brand-muted">7-day replacement warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">Help & Support</p>
              <p className="text-xs text-brand-muted">Assistance at every step</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Team Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-7 h-7" />
              <span className="text-2xl font-extrabold tracking-tight text-brand-dark">
                Click<span className="text-brand-indigo">Cart</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-brand-orange">Shop in a click.</p>
            <p className="text-sm text-brand-muted leading-relaxed max-w-sm">
              ClickCart is a modern full-stack retail platform delivering frictionless product discovery, real-time cart synchronization, and reliable order fulfillment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><Link to="/" className="hover:text-brand-indigo transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-brand-indigo transition-colors">Products</Link></li>
              <li><Link to="/products?view=categories" className="hover:text-brand-indigo transition-colors">Categories</Link></li>
              <li><Link to="/orders" className="hover:text-brand-indigo transition-colors">Orders</Link></li>
              <li><Link to="/cart" className="hover:text-brand-indigo transition-colors">My Cart</Link></li>
              <li><Link to="/admin" className="hover:text-brand-indigo transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Customer Support</p>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><span className="hover:text-brand-indigo cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Order Tracking</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Shipping Rates</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Return Policy</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Privacy & Security</span></li>
            </ul>
          </div>

          {/* Project Team */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-indigo" />
              <p className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                Project 10 — Development Team
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs text-brand-muted">
              <div>• Patnam Jahnavi (24691A05J8)</div>
              <div>• P. Chinnari Saranya (25695A0512)</div>
              <div>• Shaik Daulamma Farzana (25695A0513)</div>
              <div>• Pinninti Durga Prasad (25695A0515)</div>
              <div>• Kempeli Ganesh (25695A0516)</div>
              <div>• Erllamuthaka Ganga Maheswari (25695A0517)</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© 2026 ClickCart. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>React</span>
            <span>•</span>
            <span>Node.js / Express</span>
            <span>•</span>
            <span>MySQL 8+</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
