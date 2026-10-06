const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/summary', reportController.getSummary);
router.get('/sales-by-category', reportController.getSalesByCategory);
router.get('/top-products', reportController.getTopProducts);
router.get('/daily-sales', reportController.getDailySales);

module.exports = router;
