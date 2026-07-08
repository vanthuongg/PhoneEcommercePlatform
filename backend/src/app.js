const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiting for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
});
app.use('/api/auth/login', loginLimiter);

// Feature Routes
app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/users', require('./features/users/user.routes'));
app.use('/api/products', require('./features/products/product.routes'));
app.use('/api/categories', require('./features/categories/category.routes'));
app.use('/api/brands', require('./features/brands/brand.routes'));
app.use('/api/vouchers', require('./features/vouchers/voucher.routes'));
app.use('/api/banners', require('./features/banners/banner.routes'));
app.use('/api/wishlist', require('./features/wishlist/wishlist.routes'));
app.use('/api/notifications', require('./features/notifications/notification.routes'));
app.use('/api/tickets', require('./features/tickets/ticket.routes'));
app.use('/api/audit', require('./features/audit/audit.routes'));
app.use('/api/cart', require('./features/cart/cart.routes'));
app.use('/api/orders', require('./features/orders/order.routes'));
app.use('/api/reviews', require('./features/reviews/review.routes'));
app.use('/api/stats', require('./features/stats/stats.routes'));
app.use('/api/chatbot', require('./features/chatbot/chatbot.routes'));
app.use('/api/settings', require('./features/settings/setting.routes'));
app.use('/api/inventory', require('./features/inventory/inventory.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running 🚀' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Lỗi server' });
});

module.exports = app;
