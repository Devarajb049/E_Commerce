const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Customer-facing order creation (strictly requires authenticated customer)
router.post('/', authenticateToken, validateOrder, orderController.createOrder);

// Customer-specific own orders retrieval (strictly caller's own orders)
router.get('/my-orders', authenticateToken, orderController.getMyOrders);

// Admin-specific: get all orders with filters
router.get('/admin/orders', authenticateToken, requireAdmin, orderController.getAllOrders);

// Role-based retrieval for GET /api/orders: Admin sees all; customer sees only their own
router.get('/', authenticateToken, (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return orderController.getAllOrders(req, res, next);
  }
  return orderController.getMyOrders(req, res, next);
});

// Live tracking route: customer sees only their own order; admin can track any
router.get('/:id/track', authenticateToken, orderController.trackOrder);

// Order details by ID/Number: strictly requires authentication, enforces ownership
router.get('/:id', authenticateToken, orderController.getOrderById);

// Admin-restricted: update order status (PUT & PATCH)
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.put('/admin/orders/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.patch('/admin/orders/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

// Customer self-cancellation (enforces ownership in controller)
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);
router.post('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
