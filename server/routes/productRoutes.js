const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, requireAdmin, validateProduct, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateProduct, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

module.exports = router;
