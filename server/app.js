const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const returnRoutes = require('./routes/returnRoutes');
const cartRoutes = require('./routes/cartRoutes');
const { seedUsers } = require('./seed');

// Auto-seed demo admin and customer accounts in PostgreSQL / embedded store
seedUsers().catch((err) => {
  console.warn('⚠️ Non-blocking user auto-seed notice:', err.message);
});

const app = express();

// Parse CORS configuration
const parseCorsOrigins = () => {
  const originEnv = process.env.CORS_ORIGIN;
  if (!originEnv || originEnv === '*') return '*';
  return originEnv.split(',').map((s) => s.trim()).filter(Boolean);
};

const allowedOrigins = parseCorsOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow local development origins
    if (process.env.NODE_ENV !== 'production') {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

const clientDistPath = path.resolve(__dirname, '../client/dist');

// Serve static assets from Vite production bundle if directory exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
  }));
}

// API root info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClickCart API is running',
    version: '1.0.0',
    tagline: 'Shop in a click.'
  });
});

// Health check endpoint verifying DB connection and platform status
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await db.checkConnection();

    res.status(200).json({
      success: true,
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
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
app.use('/api/addresses', addressRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/cart', cartRoutes);

// Serve React SPA index.html for all non-API GET routes in production
app.get('*', (req, res, next) => {
  // Do not serve index.html for API routes or asset requests with file extensions
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') || /\.[a-zA-Z0-9]+$/.test(req.path)) {
    return next();
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // If client dist is not built, return helpful status
  res.status(200).json({
    success: true,
    message: 'ClickCart API is running. Build frontend (npm run build) to view storefront.',
    version: '1.0.0'
  });
});

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
