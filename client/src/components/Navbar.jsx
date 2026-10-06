import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Shield, Package, Grid, Home as HomeIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/products?view=categories', icon: Grid },
    { name: 'Orders', path: '/orders', icon: Package },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* BRAND LOGO */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 rounded-lg p-1"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-50/80 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <img 
                src="/logo-icon.svg" 
                alt="ClickCart Icon" 
                className="w-7 h-7" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight leading-none text-brand-dark">
                Click<span className="text-brand-indigo">Cart</span>
              </span>
              <span className="text-[10px] font-medium text-brand-muted tracking-wider uppercase mt-0.5">
                Shop in a click.
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive && !location.search.includes('view=categories')
                        ? 'text-brand-indigo bg-indigo-50/70 font-semibold'
                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS: CART & ADMIN */}
          <div className="flex items-center space-x-3">
            {/* CART BUTTON */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-brand-dark bg-gray-100/80 hover:bg-indigo-50 hover:text-brand-indigo border border-transparent hover:border-indigo-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
              aria-label={`Shopping Cart with ${totalItemsCount} items`}
            >
              <ShoppingCart className="w-5 h-5 text-brand-indigo" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 ? (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-brand-orange rounded-full shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              ) : (
                <span className="text-xs font-normal text-gray-400">0</span>
              )}
            </Link>

            {/* ADMIN LINK */}
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-50 hover:text-brand-indigo hover:bg-indigo-50/50 border border-gray-200/80 transition-colors"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-gray-500" />
              <span>Admin</span>
            </Link>

            {/* MOBILE HAMBURGER TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-brand-dark hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border py-3 px-2 space-y-1 bg-white animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-brand-indigo hover:bg-indigo-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors"
              >
                <Shield className="w-5 h-5 text-brand-indigo" />
                ClickCart Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
