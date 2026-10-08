const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authenticateToken, requireAdmin, validateCategory, categoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, validateCategory, categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
