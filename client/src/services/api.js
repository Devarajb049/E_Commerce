import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clickcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error messaging
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Server request timed out. Please check your connection.';
    } else if (error.message === 'Network Error') {
      friendlyMessage = 'Unable to connect to ClickCart server. Ensure backend is running.';
    }

    const customError = new Error(friendlyMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export const api = {
  // Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),

  // Categories
  getCategories: () => apiClient.get('/categories'),
  getCategory: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  // Cart (Protected server-side cart & merge API)
  getCart: () => apiClient.get('/cart'),
  addToCart: (productId, quantity = 1) => apiClient.post('/cart', { productId, quantity }),
  updateCartItem: (id, quantity) => apiClient.put(`/cart/${id}`, { quantity }),
  removeCartItem: (id) => apiClient.delete(`/cart/${id}`),
  clearCart: () => apiClient.delete('/cart'),
  mergeCart: (items) => apiClient.post('/cart/merge', { items }),

  // Products
  getProducts: (params = {}) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  getSaleProducts: () => apiClient.get('/products', { params: { sale: 'true' } }),
  getFeaturedProducts: () => apiClient.get('/products', { params: { featured: 'true' } }),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // Orders
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getOrders: (params = {}) => apiClient.get('/orders', { params }),
  getMyOrders: () => apiClient.get('/orders/my-orders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),

  // Addresses
  getAddresses: () => apiClient.get('/addresses'),
  createAddress: (data) => apiClient.post('/addresses', data),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),

  // Returns & Refunds
  getReturns: () => apiClient.get('/returns'),
  requestReturn: (data) => apiClient.post('/returns', data),
  updateReturnStatus: (id, data) => apiClient.put(`/returns/${id}/status`, data),

  // Reports
  getSummary: () => apiClient.get('/reports/summary'),
  getSalesByCategory: () => apiClient.get('/reports/sales-by-category'),
  getTopProducts: () => apiClient.get('/reports/top-products'),
  getDailySales: () => apiClient.get('/reports/daily-sales'),

  // Health
  getHealth: () => apiClient.get('/health')
};

export default api;
