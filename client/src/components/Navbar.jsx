import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Shield, User, LogIn, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  const { totalItemsCount } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prevCountRef = useRef(totalItemsCount);

  // Cart badge subtle bump animation on count change (Rule #19)
  useEffect(() => {
    if (prevCountRef.current !== totalItemsCount) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 240);
      prevCountRef.current = totalItemsCount;
      return () => clearTimeout(timer);
    }
  }, [totalItemsCount]);

  // Subtle scroll state (Rule #14)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

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

  const isLinkActive = (link) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (link.path === '/') {
      return currentPath === '/' && !currentSearch.includes('view=categories');
    }
    if (link.name === 'Categories') {
      return currentPath === '/products' && currentSearch.includes('view=categories');
    }
    if (link.name === 'Products') {
      return currentPath === '/products' && !currentSearch.includes('view=categories');
    }
    if (link.path === '/orders') {
      return currentPath.startsWith('/orders');
    }
    return currentPath === link.path;
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-white/98 backdrop-blur-md transition-shadow duration-normal border-b ${
        isScrolled ? 'border-brand-border shadow-subtle' : 'border-brand-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/30 rounded-[8px] py-1 transition-opacity duration-fast hover:opacity-95"
              aria-label="ClickCart Home"
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
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-3.5 py-1.5 text-sm font-medium rounded-[8px] transition-colors duration-fast ${
                      active
                        ? 'text-brand-indigo font-semibold bg-indigo-50/60'
                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {active && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-brand-indigo rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: SEARCH, CART & AUTH CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search Toggle / Form */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleNavSearch} className="flex items-center">
                  <div className="relative animate-fadeIn">
                    <input
                      type="text"
                      value={navSearchQuery}
                      onChange={(e) => setNavSearchQuery(e.target.value)}
                      placeholder="Search catalog..."
                      autoFocus
                      className="w-52 sm:w-64 pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-brand-border rounded-[8px] focus:bg-white focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all shadow-subtle"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                      aria-label="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-[8px] transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-brand-indigo/30"
                  aria-label="Open search input"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cart Button with Animated Badge (Rule #18 & #19) */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-brand-dark border border-brand-border rounded-[8px] transition-all duration-fast focus-visible:ring-2 focus-visible:ring-brand-indigo/30 active:scale-[0.98]"
              aria-label={`Shopping cart containing ${totalItemsCount} items`}
            >
              <ShoppingCart className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {totalItemsCount > 0 ? (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-brand-orange rounded-full transition-transform ${
                    badgeBump ? 'animate-badge-bump' : ''
                  }`}
                >
                  {totalItemsCount}
                </span>
              ) : (
                <span className="text-xs text-gray-400">0</span>
              )}
            </Link>

            {/* Authentication Area */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-indigo bg-indigo-50 border border-indigo-200 rounded-[8px] hover:bg-indigo-100/80 transition-colors duration-fast active:scale-[0.98]"
                    title="Control Center"
                  >
                    <Shield className="w-3.5 h-3.5 text-brand-indigo" />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <span className="text-xs text-gray-600 font-medium px-2.5 py-1.5 bg-gray-50 rounded-[8px] border border-gray-100">
                    {user?.name?.split(' ')[0] || 'Customer'}
                  </span>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-brand-error hover:bg-red-50 rounded-[8px] transition-colors duration-fast"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-brand-indigo hover:bg-gray-50 border border-brand-border rounded-[8px] transition-colors duration-fast active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5 text-gray-500" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-brand-dark hover:bg-gray-100 rounded-[8px] transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-brand-indigo/30"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER (Smooth slide & fade) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border py-3 px-1 space-y-1 bg-white animate-fadeIn">
            <form onSubmit={handleNavSearch} className="mb-3 px-1">
              <div className="relative">
                <input
                  type="text"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-brand-border rounded-[8px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </form>

            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                    active
                      ? 'text-brand-indigo bg-indigo-50 font-semibold'
                      : 'text-gray-700 hover:text-brand-indigo hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-gray-100 space-y-1">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-brand-indigo bg-indigo-50/70 rounded-[8px]"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-error hover:bg-red-50 rounded-[8px] text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out ({user?.email})</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-brand-indigo bg-indigo-50/60 rounded-[8px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
