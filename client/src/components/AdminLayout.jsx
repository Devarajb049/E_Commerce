import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, title, subtitle, actions }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <AdminSidebar />

      {/* Main Content Area indented for desktop sidebar */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-brand-border px-4 sm:px-8 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-brand-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {actions}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
