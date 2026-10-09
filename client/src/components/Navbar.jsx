import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  Shield, 
  User, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  BadgePercent, 
  LayoutGrid, 
  Package, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ANNOUNCEMENT_STORAGE_KEY = 'clickkart_announcement_dismissed_v1';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    return !localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
  });

  const { totalItemsCount } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const dropdownTimerRef = useRef(null);
  const prevCountRef = useRef(totalItemsCount);

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;
    setCategoriesLoading(true);
    api.getCategories()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        console.warn('Navbar categories fetch notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cart badge subtle bump animation on count change
  useEffect(() => {
    if (prevCountRef.current !== totalItemsCount) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 240);
      prevCountRef.current = totalItemsCount;
      return () => clearTimeout(timer);
    }
  }, [totalItemsCount]);

  // Subtle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setMobileCategoriesOpen(false);
  }, [location.pathname, location.search]);

  // Click outside listener for categories dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoriesDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDismissAnnouncement = () => {
    setShowAnnouncement(false);
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
    } catch {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleMouseEnterCategories = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setCategoriesDropdownOpen(true);
  };

  const handleMouseLeaveCategories = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setCategoriesDropdownOpen(false);
    }, 150);
  };

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    if (path === '/products') return location.pathname === '/products' && !location.search.includes('sale=true');
    if (path === '/super-sale') return location.pathname === '/super-sale' || location.search.includes('sale=true');
    if (path === '/orders') return location.pathname.startsWith('/orders');
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. SLIM PROMOTIONAL ANNOUNCEMENT BAR */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-indigo-800/40 select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden truncate mx-auto sm:mx-0">
              <span className="inline-flex items-center justify-center p-1 rounded-full bg-orange-500/20 text-brand-orange flex-shrink-0">
                <BadgePercent className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold tracking-wide uppercase text-[11px] text-amber-300">
                ClickKart Super Sale
              </span>
              <span className="text-gray-300 hidden sm:inline">—</span>
              <span className="text-gray-200 text-xs truncate">
                Limited-time offers on selected genuine products.
              </span>
              <Link 
                to="/super-sale" 
                className="hidden md:inline-flex items-center gap-1 font-semibold text-brand-orange hover:text-orange-300 transition-colors ml-2 underline text-xs"
              >
                Shop Deals
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <button
              onClick={handleDismissAnnouncement}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss announcement"
              title="Close announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className={`transition-shadow duration-normal border-b border-brand-border bg-white ${isScrolled ? 'shadow-subtle' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            
            {/* LEFT: BRAND LOGO */}
            <Link 
              to="/" 
              className="flex items-center gap-2.5 py-1 focus:outline-none rounded-lg group select-none flex-shrink-0"
              aria-label="ClickKart Home"
            >
              <img 
                src="/logo-icon.svg" 
                alt="ClickKart Logo" 
                className="w-8 h-8 flex-shrink-0 transition-transform duration-fast group-hover:scale-105" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-brand-dark leading-none">
                  Click<span className="text-brand-indigo">Kart</span>
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-brand-orange uppercase leading-tight mt-0.5">
                  Shop in a Click
                </span>
              </div>
            </Link>

            {/* CENTER: LARGE PRODUCT SEARCH FIELD */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands and categories..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-brand-border rounded-lg focus:bg-white focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 transition-all text-slate-800 placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-indigo hover:bg-brand-indigo-hover text-white rounded text-[11px] font-semibold transition-colors duration-fast"
                >
                  Search
                </button>
              </form>
            </div>

            {/* RIGHT: CART & AUTH CONTROLS */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Cart Button with live count */}
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-brand-dark border border-brand-border rounded-lg transition-all duration-fast select-none active:scale-[0.98]"
                aria-label={`Shopping cart containing ${totalItemsCount} items`}
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline">Cart</span>
                {totalItemsCount > 0 ? (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-brand-orange rounded-full transition-transform ${
                      badgeBump ? 'animate-badge-bump' : ''
                    }`}
                  >
                    {totalItemsCount}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">0</span>
                )}
              </Link>

              {/* Authentication Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-indigo bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100/80 transition-colors"
                      title="Admin Control Center"
                    >
                      <Shield className="w-3.5 h-3.5 text-brand-indigo" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-brand-indigo hover:bg-gray-50 border border-brand-border rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-brand-indigo hover:bg-brand-indigo-hover rounded-lg transition-colors duration-fast active:scale-[0.98] shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. DESKTOP NAVIGATION ROW */}
        <div className="hidden md:block border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 py-1.5" aria-label="Store Navigation">
              {/* Home */}
              <Link
                to="/"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isLinkActive('/')
                    ? 'text-brand-indigo bg-indigo-50/70 font-bold'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              {/* Shop / All Products */}
              <Link
                to="/products"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isLinkActive('/products')
                    ? 'text-brand-indigo bg-indigo-50/70 font-bold'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                Shop
              </Link>

              {/* Categories Dropdown */}
              <div 
                ref={dropdownRef} 
                className="relative"
                onMouseEnter={handleMouseEnterCategories}
                onMouseLeave={handleMouseLeaveCategories}
              >
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors select-none ${
                    categoriesDropdownOpen || location.pathname.startsWith('/categories')
                      ? 'text-brand-indigo bg-indigo-50/70 font-bold'
                      : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                  }`}
                  aria-expanded={categoriesDropdownOpen}
                  aria-haspopup="true"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-fast ${categoriesDropdownOpen ? 'rotate-180 text-brand-indigo' : 'text-gray-400'}`} />
                </button>

                {/* Dropdown Panel */}
                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-brand-border rounded-xl shadow-elevated py-2 z-50 animate-pop-in">
                    <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Browse by Category
                      </span>
                      <span className="text-[10px] font-semibold text-brand-indigo">
                        {categories.length} Categories
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1">
                      {categoriesLoading ? (
                        <div className="p-4 text-center text-xs text-gray-400">Loading categories...</div>
                      ) : categories.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">No categories found</div>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat.id || cat.category_id}
                            to={`/categories/${cat.slug || cat.id}`}
                            onClick={() => setCategoriesDropdownOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2 text-xs text-gray-700 hover:bg-indigo-50/70 hover:text-brand-indigo transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="p-1 rounded bg-gray-100 text-gray-600">
                                <Package className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-medium text-slate-800 hover:text-brand-indigo">
                                {cat.name || cat.category_name}
                              </span>
                            </div>
                            {cat.product_count !== undefined && (
                              <span className="text-[11px] text-gray-400 font-mono">
                                {cat.product_count}
                              </span>
                            )}
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-1 border-t border-gray-100 px-2">
                      <Link
                        to="/categories"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-brand-indigo bg-indigo-50/60 hover:bg-indigo-100/80 transition-colors"
                      >
                        <span>View All Categories</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Super Sale */}
              <Link
                to="/super-sale"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isLinkActive('/super-sale')
                    ? 'text-brand-orange bg-orange-50 font-bold'
                    : 'text-gray-700 hover:text-brand-orange hover:bg-orange-50/50'
                }`}
              >
                <BadgePercent className="w-3.5 h-3.5 text-brand-orange" />
                <span>Super Sale</span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-brand-orange text-white rounded-full">
                  Hot
                </span>
              </Link>

              {/* My Orders (when authenticated) */}
              {isAuthenticated && (
                <Link
                  to="/orders"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isLinkActive('/orders')
                      ? 'text-brand-indigo bg-indigo-50/70 font-bold'
                      : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  My Orders
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* 4. MOBILE MENU ACCORDION DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border py-3 px-4 space-y-3 bg-white animate-fadeIn">
            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-brand-border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>

            <div className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-sm font-semibold rounded-lg text-gray-700 hover:text-brand-indigo hover:bg-gray-50"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-sm font-semibold rounded-lg text-gray-700 hover:text-brand-indigo hover:bg-gray-50"
              >
                Shop All Products
              </Link>

              {/* Mobile Categories Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:text-brand-indigo hover:bg-gray-50 rounded-lg text-left"
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-gray-500" />
                    <span>Categories</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? 'rotate-180 text-brand-indigo' : 'text-gray-400'}`} />
                </button>

                {mobileCategoriesOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-indigo-100 ml-4 my-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id || cat.category_id}
                        to={`/categories/${cat.slug || cat.id}`}
                        className="flex items-center justify-between py-1.5 text-xs text-gray-600 hover:text-brand-indigo font-medium"
                      >
                        <span>{cat.name || cat.category_name}</span>
                        {cat.product_count !== undefined && (
                          <span className="text-[10px] text-gray-400">({cat.product_count})</span>
                        )}
                      </Link>
                    ))}
                    <Link
                      to="/categories"
                      className="block py-2 text-xs font-bold text-brand-indigo hover:underline pt-2 border-t border-gray-100"
                    >
                      View All Categories →
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/super-sale"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-brand-orange bg-orange-50/50 hover:bg-orange-50"
              >
                <BadgePercent className="w-4 h-4 text-brand-orange" />
                <span>ClickKart Super Sale</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-sm font-semibold rounded-lg text-gray-700 hover:text-brand-indigo hover:bg-gray-50"
                >
                  My Orders
                </Link>
              )}
            </div>

            {/* Mobile Auth Bottom Bar */}
            <div className="pt-3 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 px-3">
                    Signed in as <strong>{user?.name || user?.email}</strong>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-indigo bg-indigo-50 rounded-lg"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white bg-brand-indigo rounded-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
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
