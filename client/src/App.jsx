import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmptyState from './components/EmptyState';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Invoice from './pages/Invoice';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminReports from './pages/AdminReports';

function NotFoundPage() {
  return (
    <div className="py-20 max-w-md mx-auto px-4">
      <EmptyState
        title="Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        actionText="Back to Store"
        actionLink="/"
      />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-dark">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Customer Store Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/403" element={<Unauthorized />} />

          {/* Protected Admin Control Center Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
