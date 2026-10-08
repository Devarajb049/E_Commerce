/**
 * Centralized Error Handling Middleware for ClickCart API
 */

// Custom API Error class with HTTP status code and error code
class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 404 handler for unknown routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
    error: 'NOT_FOUND'
  });
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  console.error('[API Error]', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.code
    });
  }

  // Handle PostgreSQL unique constraint violation (code 23505) and legacy MySQL (1062)
  if (err.code === '23505' || err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
    let duplicateMessage = 'A record with the specified value already exists.';
    if (err.detail && err.detail.includes('email')) {
      duplicateMessage = 'An account with this email address already exists.';
    } else if (err.detail && err.detail.includes('sku')) {
      duplicateMessage = 'A product with this SKU already exists.';
    }
    return res.status(409).json({
      success: false,
      message: duplicateMessage,
      error: 'DUPLICATE_ENTRY'
    });
  }

  // Handle PostgreSQL foreign key violation (code 23503) and legacy MySQL (1451 / 1452)
  if (err.code === '23503' || err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot perform this action because related records depend on it.',
      error: 'FOREIGN_KEY_CONFLICT'
    });
  }

  // Handle PostgreSQL check constraint failure (code 23514)
  if (err.code === '23514') {
    return res.status(422).json({
      success: false,
      message: 'Database check constraint failed for the submitted values.',
      error: 'CHECK_CONSTRAINT_VIOLATION'
    });
  }

  // Handle body JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
      error: 'BAD_REQUEST'
    });
  }

  // Generic 500 Internal Server Error (sanitize internal db/system details)
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'An unexpected error occurred on the server. Please try again later.'
      : err.message,
    error: err.code || 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = {
  ApiError,
  notFoundHandler,
  globalErrorHandler
};
