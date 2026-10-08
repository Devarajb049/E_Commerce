import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Header for Admin */}
      <div className="lg:hidden bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.svg" alt="ClickCart Admin" className="w-6 h-6" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-brand-dark">ClickCart</span>
            <span className="text-[10px] font-semibold text-brand-indigo bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
              ADMIN
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-gray-600 hover:text-brand-dark rounded-btn border border-brand-border"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={closeMobile}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity duration-normal"
        />
      )}

      {/* Sidebar (Desktop Fixed / Mobile Drawer with smooth slide animation per Rule #39) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Brand Header (Rule #39: ClickCart ADMIN) */}
          <div className="h-16 px-6 border-b border-brand-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-7 h-7 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-brand-dark leading-none">
                    Click<span className="text-brand-indigo">Cart</span>
                  </span>
                  <span className="text-[10px] font-bold text-brand-indigo bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded leading-none">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] font-medium text-brand-muted block mt-1">
                  Shop in a click.
                </span>
              </div>
            </Link>

            <button onClick={closeMobile} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation List (Rule #39: Active item = light indigo bg, indigo icon, indigo text) */}
          <nav className="p-4 space-y-1">
            <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Management
            </span>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/admin' || link.path === '/admin/dashboard'}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-btn transition-colors duration-fast ${
                      isActive
                        ? 'bg-indigo-50 text-brand-indigo border border-indigo-100/60'
                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-brand-indigo' : 'text-gray-500'
                      }`} />
                      <span>{link.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Settings (Rule #39) */}
            <button
              onClick={() => { setSettingsModalOpen(true); closeMobile(); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-600 hover:text-brand-dark hover:bg-gray-50 rounded-btn transition-colors duration-fast text-left"
            >
              <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info & Actions (Rule #39: Logout) */}
        <div className="p-4 border-t border-brand-border space-y-2.5">
          {/* Admin User Info */}
          <div className="p-2.5 bg-gray-50 rounded-btn border border-brand-border flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="block text-xs font-bold text-brand-dark truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="block text-[10px] text-brand-muted truncate font-mono">
                {user?.email || 'admin@clickcart.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-brand-error hover:bg-red-50 rounded-btn transition-colors duration-fast flex-shrink-0"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 hover:text-brand-indigo hover:bg-gray-50 rounded-btn transition-colors duration-fast"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </aside>

      {/* Settings Modal (Rule #39 & #25) */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-modal max-w-md w-full p-6 shadow-dropdown border border-brand-border space-y-4 animate-modal-enter">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-indigo" />
                <h3 className="text-sm font-bold text-brand-dark">Store Configuration</h3>
              </div>
              <button 
                onClick={() => setSettingsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-btn border border-gray-100 space-y-1">
                <span className="font-semibold text-brand-dark block">System Environment</span>
                <p className="text-brand-muted">Production E-Commerce Engine</p>
                <p className="text-gray-500 font-mono text-[11px]">API: Express.js • Database: MySQL 8+ (Active)</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-btn border border-gray-100 space-y-1">
                <span className="font-semibold text-brand-dark block">Default Currency & Tax</span>
                <p className="text-brand-muted">Currency: INR (₹) • GST Rate: 18% standard</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-btn border border-gray-100 space-y-1">
                <span className="font-semibold text-brand-dark block">Authenticated Session</span>
                <p className="text-gray-700 font-medium">Logged in as {user?.email || 'admin@clickcart.com'}</p>
                <p className="text-brand-muted text-[11px]">Role: System Administrator (Full Access)</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
