import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, Headphones, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-brand-border mt-auto">
      {/* Retail Guarantees */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-btn bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-dark flex-shrink-0">
              <Truck className="w-4 h-4 text-brand-indigo" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-dark">Fast Dispatch</p>
              <p className="text-[11px] text-brand-muted">Orders shipped in 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-btn bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-dark flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-brand-indigo" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-dark">100% Genuine</p>
              <p className="text-[11px] text-brand-muted">Authentic retail inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-btn bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-dark flex-shrink-0">
              <RotateCcw className="w-4 h-4 text-brand-indigo" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-dark">Easy Returns</p>
              <p className="text-[11px] text-brand-muted">7-day replacement window</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-btn bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-dark flex-shrink-0">
              <Headphones className="w-4 h-4 text-brand-indigo" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-dark">Dedicated Support</p>
              <p className="text-[11px] text-brand-muted">Help for every order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links & Team Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-2.5">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-6 h-6" />
              <span className="text-xl font-bold tracking-tight text-brand-dark">
                Click<span className="text-brand-indigo">Cart</span>
              </span>
            </Link>
            <p className="text-xs font-semibold text-brand-orange">Shop in a click.</p>
            <p className="text-xs text-brand-muted leading-relaxed max-w-sm">
              ClickCart is a modern e-commerce and order management system built with React, Node.js/Express, and MySQL.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-1.5 text-xs text-brand-muted">
              <li><Link to="/" className="hover:text-brand-indigo transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-brand-indigo transition-colors">Products</Link></li>
              <li><Link to="/products?view=categories" className="hover:text-brand-indigo transition-colors">Categories</Link></li>
              <li><Link to="/orders" className="hover:text-brand-indigo transition-colors">Orders</Link></li>
              <li><Link to="/cart" className="hover:text-brand-indigo transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">Support</p>
            <ul className="space-y-1.5 text-xs text-brand-muted">
              <li><span className="hover:text-brand-indigo cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Track Order</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Shipping Policy</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Returns & Refunds</span></li>
              <li><span className="hover:text-brand-indigo cursor-pointer">Privacy Terms</span></li>
            </ul>
          </div>

          {/* Project Team */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-indigo" />
              <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Project 10 — Development Team
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs text-brand-muted">
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
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-3">
          <p>© 2026 ClickCart. All rights reserved.</p>
          <p className="text-gray-400">
            React • Node.js / Express • MySQL 8+
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
