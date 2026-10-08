const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clickcart_secure_jwt_token_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Middleware to authenticate JWT Bearer tokens
 * Returns 401 Unauthorized for missing, malformed, invalid, or expired tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this resource.',
      error: 'UNAUTHORIZED'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired 
          ? 'Your session has expired. Please log in again.' 
          : 'Invalid authentication token. Please log in again.',
        error: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }

    // Standardize identity object
    const userId = decoded.id || decoded.userId;
    req.user = {
      id: userId,
      userId: userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  });
};

// Alias for convenience
const authenticate = authenticateToken;

/**
 * Middleware to restrict access to administrator roles only
 * Returns 403 Forbidden if user is authenticated but not an admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
      error: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required.',
      error: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Middleware to restrict access to customer roles only
 * Returns 403 Forbidden if user is not a customer
 */
const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
      error: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer privileges are required.',
      error: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Optional authentication middleware: parses token if available, proceeds either way
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const userId = decoded.id || decoded.userId;
      req.user = {
        id: userId,
        userId: userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    } else {
      req.user = null;
    }
    next();
  });
};

module.exports = {
  authenticate,
  authenticateToken,
  requireAdmin,
  requireCustomer,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
