const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

/**
 * GET /api/addresses - List addresses for authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const [rows] = await db.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/addresses - Create a new address for authenticated user
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { fullName, phone, addressLine, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !addressLine || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required.'
      });
    }

    if (isDefault) {
      await db.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      `INSERT INTO user_addresses (user_id, full_name, phone, address_line, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName.trim(), phone.trim(), addressLine.trim(), city.trim(), state.trim(), postalCode.trim(), country.trim(), isDefault ? 1 : 0]
    );

    const [created] = await db.query('SELECT * FROM user_addresses WHERE address_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      data: created[0],
      message: 'Address saved successfully.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/addresses/:id - Delete an address
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const addressId = parseInt(req.params.id, 10);

    await db.query('DELETE FROM user_addresses WHERE address_id = ? AND user_id = ?', [addressId, userId]);

    res.status(200).json({
      success: true,
      message: 'Address removed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
