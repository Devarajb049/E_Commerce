const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedUsers } = require('./seed');

// Auto-seed demo admin and customer accounts in MySQL
seedUsers().catch((err) => {
  console.warn('⚠️ Non-blocking user auto-seed notice:', err.message);
});

const app = express();

// Security and Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClickCart API is running',
    version: '1.0.0',
    tagline: 'Shop in a click.'
  });
});

// Health check endpoint verifying MySQL DB connection
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const [result] = await db.query('SELECT 1 + 1 AS result');
    const dbLatency = Date.now() - startTime;

    res.status(200).json({
      success: true,
      status: 'healthy',
      database: {
        connected: result && result[0].result === 2,
        latency_ms: dbLatency,
        name: process.env.DB_NAME || 'ecommerce_db'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Register API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
