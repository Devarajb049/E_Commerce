const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, requireAdmin);

router.get('/summary', reportController.getSummary);
router.get('/sales-by-category', reportController.getSalesByCategory);
router.get('/top-products', reportController.getTopProducts);
router.get('/daily-sales', reportController.getDailySales);

module.exports = router;
