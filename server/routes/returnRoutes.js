const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * POST /api/returns - Customer requests return for a delivered order
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { orderId, productId, reason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and return reason are required.'
      });
    }

    const [orderRows] = await db.query(
      'SELECT id, total, order_status FROM orders WHERE id = $1 AND (user_id = $2 OR email = $3)',
      [orderId, userId, req.user.email]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your account.'
      });
    }

    const order = orderRows[0];
    const statusUpper = (order.order_status || '').toUpperCase();
    if (statusUpper !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Return requests can only be submitted for delivered orders.'
      });
    }

    const [insertRows, meta] = await db.query(
      `INSERT INTO order_returns (order_id, user_id, product_id, reason, status, refund_amount)
       VALUES ($1, $2, $3, $4, 'REQUESTED', $5)
       RETURNING *`,
      [orderId, userId, productId || null, reason.trim(), order.total]
    );

    await db.query(
      "UPDATE orders SET order_status = 'RETURN_REQUESTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [orderId]
    );

    const returnId = insertRows[0]?.id || meta.insertId;

    res.status(201).json({
      success: true,
      data: { return_id: returnId, id: returnId, order_id: orderId, status: 'REQUESTED' },
      message: 'Return request submitted successfully. Our team will review it.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/returns - Admin views all return requests; Customer views own returns
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const isAdmin = req.user.role === 'admin';

    let sql = `
      SELECT 
        r.id,
        r.id AS return_id,
        r.order_id,
        r.user_id,
        r.product_id,
        r.reason,
        r.status,
        r.refund_amount,
        r.admin_notes,
        r.created_at,
        o.order_number,
        o.shipping_full_name AS customer_name,
        o.total AS total_amount
      FROM order_returns r
      JOIN orders o ON r.order_id = o.id
    `;
    const params = [];

    if (!isAdmin) {
      sql += ' WHERE r.user_id = $1';
      params.push(userId);
    }

    sql += ' ORDER BY r.created_at DESC';

    const [rows] = await db.query(sql, params);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/returns/:id/status - Admin reviews and updates return request
 */
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const returnId = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    const validStatuses = ['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid return status.'
      });
    }

    await db.query(
      'UPDATE order_returns SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, adminNotes || '', returnId]
    );

    // If completed, update order to RETURNED and payment_status to REFUNDED
    if (status === 'COMPLETED') {
      const [retRows] = await db.query('SELECT order_id FROM order_returns WHERE id = $1', [returnId]);
      if (retRows.length > 0) {
        await db.query(
          "UPDATE orders SET order_status = 'RETURNED', payment_status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [retRows[0].order_id]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Return request updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
