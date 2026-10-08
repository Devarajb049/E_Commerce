const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.get('/profile', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;
