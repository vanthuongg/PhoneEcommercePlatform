import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error.response?.data || { message: 'Lỗi kết nối server' });
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Users
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Addresses
export const addressAPI = {
  getAll: () => api.get('/users/addresses'),
  add: (data) => api.post('/users/addresses', data),
  update: (id, data) => api.put(`/users/addresses/${id}`, data),
  delete: (id) => api.delete(`/users/addresses/${id}`),
  setDefault: (id) => api.patch(`/users/addresses/${id}/default`),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock, variantId) => api.patch(`/products/${id}/stock`, { stock, variantId }),
};

// Categories
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Brands
export const brandAPI = {
  getAll: () => api.get('/brands'),
  getAllAdmin: () => api.get('/brands/admin'),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Vouchers
export const voucherAPI = {
  getAll: () => api.get('/vouchers'),
  getAvailable: (orderValue) => api.get('/vouchers/available', { params: { orderValue } }),
  getAllAdmin: () => api.get('/vouchers/admin'),
  validate: (code, orderValue, cartBrands) => api.post('/vouchers/validate', { code, orderValue, cartBrands }),
  resetDaily: () => api.post('/vouchers/reset'),
  notifyUsers: (id) => api.post(`/vouchers/${id}/notify`),
  create: (data) => api.post('/vouchers', data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
};

// Banners
export const bannerAPI = {
  getAll: (params) => api.get('/banners', { params }),
  getAllAdmin: () => api.get('/banners/admin'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  create: (data) => api.post('/notifications', data),
};

// Tickets
export const ticketAPI = {
  getMy: () => api.get('/tickets/my'),
  getAllStaff: (params) => api.get('/tickets/staff', { params }),
  create: (data) => api.post('/tickets', data),
  reply: (id, message) => api.post(`/tickets/${id}/reply`, { message }),
  close: (id) => api.put(`/tickets/${id}/close`),
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity, size, color) => api.post('/cart', { productId, quantity, size, color }),
  update: (productId, quantity, size, color) => api.put(`/cart/${productId}`, { quantity, size, color }),
  remove: (productId, size, color) => api.delete(`/cart/${productId}`, { data: { size, color } }),
  clear: () => api.delete('/cart'),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  updatePaymentStatus: (id, paymentStatus) => api.put(`/orders/${id}/payment-status`, { paymentStatus }),
  cancel: (id, cancelReason) => api.put(`/orders/${id}/cancel`, { cancelReason }),
};

// Reviews
export const reviewAPI = {
  getMy: () => api.get('/reviews/my'),
  getByProduct: (productId) => api.get(`/reviews/${productId}?t=${Date.now()}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Stats
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getRevenue: () => api.get('/stats/revenue'),
};

// Chatbot
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
};

export const settingAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
