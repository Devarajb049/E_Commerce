import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, BarChart3, ArrowLeft } from 'lucide-react';

const AdminNav = () => {
  const tabs = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
          
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-brand-dark text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
              Admin
            </span>
            <h1 className="text-xl font-extrabold text-brand-dark tracking-tight">
              ClickCart Control Center
            </h1>
          </div>

          <NavLink
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-indigo-800 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Store</span>
          </NavLink>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                end={tab.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-brand-indigo text-brand-indigo bg-indigo-50/40'
                      : 'border-transparent text-gray-500 hover:text-brand-dark hover:border-gray-300'
                  }`
                }
              >
                <Icon className="w-4 h-4 opacity-75" />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
