/**
 * Validation Middleware for ClickCart API
 */
const { ApiError } = require('./errorHandler');

// Validate Category input
const validateCategory = (req, res, next) => {
  const { category_name } = req.body;
  if (!category_name || typeof category_name !== 'string' || category_name.trim().length === 0) {
    return next(new ApiError(422, 'Category name is required and cannot be empty.', 'VALIDATION_ERROR'));
  }
  if (category_name.trim().length > 100) {
    return next(new ApiError(422, 'Category name cannot exceed 100 characters.', 'VALIDATION_ERROR'));
  }
  req.body.category_name = category_name.trim();
  if (req.body.description && typeof req.body.description === 'string') {
    req.body.description = req.body.description.trim();
  }
  next();
};

// Validate Product input
const validateProduct = (req, res, next) => {
  const { category_id, product_name, price, stock_quantity } = req.body;

  if (!product_name || typeof product_name !== 'string' || product_name.trim().length === 0) {
    return next(new ApiError(422, 'Product name is required.', 'VALIDATION_ERROR'));
  }

  const parsedCatId = parseInt(category_id, 10);
  if (isNaN(parsedCatId) || parsedCatId <= 0) {
    return next(new ApiError(422, 'Valid category_id is required.', 'VALIDATION_ERROR'));
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return next(new ApiError(422, 'Product price must be a number greater than zero.', 'VALIDATION_ERROR'));
  }

  const parsedStock = parseInt(stock_quantity, 10);
  if (isNaN(parsedStock) || parsedStock < 0) {
    return next(new ApiError(422, 'Stock quantity must be a non-negative integer.', 'VALIDATION_ERROR'));
  }

  req.body.product_name = product_name.trim();
  req.body.category_id = parsedCatId;
  req.body.price = parsedPrice;
  req.body.stock_quantity = parsedStock;
  req.body.description = req.body.description ? String(req.body.description).trim() : '';
  req.body.image_url = req.body.image_url ? String(req.body.image_url).trim() : '';

  next();
};

// Validate Order input
const validateOrder = (req, res, next) => {
  const { customer, items } = req.body;

  if (!customer || typeof customer !== 'object') {
    return next(new ApiError(422, 'Customer details are required.', 'VALIDATION_ERROR'));
  }

  const { name, email, phone, address, city, state, pincode } = customer;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new ApiError(422, 'Customer full name is required (min 2 characters).', 'VALIDATION_ERROR'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    return next(new ApiError(422, 'A valid customer email address is required.', 'VALIDATION_ERROR'));
  }

  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
  if (!phone || !phoneRegex.test(String(phone).trim())) {
    return next(new ApiError(422, 'A valid contact phone number is required (at least 7 digits).', 'VALIDATION_ERROR'));
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    return next(new ApiError(422, 'Complete shipping address is required (min 5 characters).', 'VALIDATION_ERROR'));
  }

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return next(new ApiError(422, 'City is required.', 'VALIDATION_ERROR'));
  }

  if (!state || typeof state !== 'string' || state.trim().length < 2) {
    return next(new ApiError(422, 'State / Province is required.', 'VALIDATION_ERROR'));
  }

  const pinRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
  if (!pincode || !pinRegex.test(String(pincode).trim())) {
    return next(new ApiError(422, 'A valid PIN / Postal code is required.', 'VALIDATION_ERROR'));
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ApiError(422, 'Order must contain at least one item.', 'VALIDATION_ERROR'));
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = parseInt(item.productId || item.product_id, 10);
    const qty = parseInt(item.quantity, 10);

    if (isNaN(pid) || pid <= 0) {
      return next(new ApiError(422, `Item at index ${i} has an invalid product ID.`, 'VALIDATION_ERROR'));
    }

    if (isNaN(qty) || qty <= 0) {
      return next(new ApiError(422, `Item at index ${i} must have a quantity of at least 1.`, 'VALIDATION_ERROR'));
    }
  }

  next();
};

module.exports = {
  validateCategory,
  validateProduct,
  validateOrder
};
