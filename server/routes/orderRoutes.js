const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Customer-facing order creation (attaches user identity if logged in)
router.post('/', optionalAuth, validateOrder, orderController.createOrder);

// Customer-specific own orders retrieval
router.get('/my-orders', authenticateToken, orderController.getMyOrders);

// Admin-restricted: get all orders with filters
router.get('/', authenticateToken, requireAdmin, orderController.getAllOrders);

// Order details by ID/Number (enforces ownership in controller)
router.get('/:id', optionalAuth, orderController.getOrderById);

// Admin-restricted: update order status
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

// Customer self-cancellation for PLACED orders
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
