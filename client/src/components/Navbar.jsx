import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Shield, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/products?view=categories' },
    { name: 'Orders', path: '/orders' },
  ];

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 rounded-md py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src="/logo-icon.svg" 
                alt="ClickCart" 
                className="w-7 h-7 flex-shrink-0"
              />
              <span className="text-xl font-bold tracking-tight text-brand-dark">
                Click<span className="text-brand-indigo">Cart</span>
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 text-sm font-medium rounded-btn transition-colors ${
                      isActive
                        ? 'text-brand-indigo bg-indigo-50/60 font-semibold'
                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* RIGHT: SEARCH, CART, ADMIN */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Search Toggle / Input */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleNavSearch} className="flex items-center animate-fadeIn">
                  <input
                    type="text"
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="w-48 sm:w-64 pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-brand-border rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 focus:border-brand-indigo transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-btn transition-colors"
                  title="Search"
                  aria-label="Open search input"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cart Button with Count Badge */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-brand-dark border border-brand-border rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              aria-label={`Shopping cart with ${totalItemsCount} items`}
            >
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {totalItemsCount > 0 ? (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-brand-orange rounded-full">
                  {totalItemsCount}
                </span>
              ) : (
                <span className="text-xs text-gray-400">0</span>
              )}
            </Link>

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-brand-indigo hover:bg-indigo-50/50 border border-brand-border rounded-btn transition-colors"
              title="Admin Control Center"
            >
              <Shield className="w-3.5 h-3.5 text-gray-500" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-brand-dark hover:bg-gray-100 rounded-btn focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU ACCORDION */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border py-3 px-2 space-y-1 bg-white">
            <form onSubmit={handleNavSearch} className="mb-3 px-1">
              <div className="relative">
                <input
                  type="text"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-brand-border rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-indigo hover:bg-gray-50 rounded-btn transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-indigo bg-indigo-50/50 hover:bg-indigo-100/50 rounded-btn transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
