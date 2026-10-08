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
      `SELECT 
         id,
         id AS address_id,
         user_id,
         full_name,
         phone,
         address_line,
         city,
         state,
         postal_code,
         country,
         is_default,
         created_at,
         updated_at
       FROM addresses 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
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
    const { fullName, full_name, phone, addressLine, address_line, city, state, postalCode, postal_code, country = 'India', isDefault = false, is_default = false } = req.body;

    const name = (fullName || full_name || '').trim();
    const ph = (phone || '').trim();
    const line = (addressLine || address_line || '').trim();
    const ct = (city || '').trim();
    const st = (state || '').trim();
    const post = (postalCode || postal_code || '').trim();
    const shouldBeDefault = Boolean(isDefault || is_default);

    if (!name || !ph || !line || !ct || !st || !post) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required.'
      });
    }

    if (shouldBeDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }

    const [insertRows, meta] = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, name, ph, line, ct, st, post, country.trim(), shouldBeDefault]
    );

    const newId = insertRows[0]?.id || meta.insertId;

    const [created] = await db.query(
      `SELECT id, id AS address_id, user_id, full_name, phone, address_line, city, state, postal_code, country, is_default, created_at
       FROM addresses WHERE id = $1`,
      [newId]
    );

    res.status(201).json({
      success: true,
      data: created[0] || insertRows[0],
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

    await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);

    res.status(200).json({
      success: true,
      message: 'Address removed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
