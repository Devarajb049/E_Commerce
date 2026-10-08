const express = require('express');
const cors = require('cors');
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

// Auto-seed demo admin and customer accounts in PostgreSQL / local store
seedUsers().catch((err) => {
  console.warn('⚠️ Non-blocking user auto-seed notice:', err.message);
});

const app = express();

// Security and Parsing Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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

const path = require('path');
const fs = require('fs');

const clientDistPath = path.join(__dirname, '../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

if (hasClientDist) {
  // Serve static assets from Vite production bundle
  app.use(express.static(clientDistPath));
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

// Fallback root endpoint if client dist is not built
if (!hasClientDist) {
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'ClickCart API is running',
      version: '1.0.0',
      tagline: 'Shop in a click.'
    });
  });
}

// Health check endpoint verifying DB connection
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const [result] = await db.query('SELECT 1 + 1 AS result');
    const dbLatency = Date.now() - startTime;
    const isConnected = Boolean(result && (result[0]?.result === 2 || result[0]?.['1 + 1'] === 2 || result.length > 0));

    res.status(200).json({
      success: true,
      status: 'healthy',
      database: {
        connected: isConnected,
        engine: db.isPostgres ? 'supabase-postgres' : 'sqlite-embedded',
        latency_ms: dbLatency,
        name: db.isPostgres ? 'postgres' : 'clickcart_db'
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
app.use('/api/addresses', addressRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/cart', cartRoutes);

// Serve React SPA index.html for all non-API GET routes in production
if (hasClientDist) {
  app.get('*', (req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
