import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  BarChart3, 
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Shield
} from 'lucide-react';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Header for Admin */}
      <div className="lg:hidden bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.svg" alt="ClickCart Admin" className="w-6 h-6" />
          <span className="font-bold text-sm text-brand-dark">ClickCart Admin</span>
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
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
        />
      )}

      {/* Sidebar (Desktop Fixed / Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-16 px-6 border-b border-brand-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-7 h-7" />
              <div>
                <span className="text-base font-bold text-brand-dark leading-none block">
                  Click<span className="text-brand-indigo">Cart</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mt-0.5">
                  Control Center
                </span>
              </div>
            </Link>

            <button onClick={closeMobile} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
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
                  end={link.path === '/admin'}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-btn transition-colors ${
                      isActive
                        ? 'bg-brand-indigo text-white shadow-subtle'
                        : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 hover:text-brand-indigo hover:bg-gray-50 rounded-btn transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
