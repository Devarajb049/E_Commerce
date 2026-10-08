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
      'SELECT * FROM Orders WHERE order_id = ? AND (user_id = ? OR email = ?)',
      [orderId, userId, req.user.email]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your account.'
      });
    }

    const order = orderRows[0];
    if (order.order_status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Return requests can only be submitted for delivered orders.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO order_returns (order_id, user_id, product_id, reason, status, refund_amount)
       VALUES (?, ?, ?, ?, 'REQUESTED', ?)`,
      [orderId, userId, productId || null, reason.trim(), order.total_amount]
    );

    await db.query(
      "UPDATE Orders SET order_status = 'RETURN_REQUESTED' WHERE order_id = ?",
      [orderId]
    );

    res.status(201).json({
      success: true,
      data: { return_id: result.insertId, order_id: orderId, status: 'REQUESTED' },
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
      SELECT r.*, o.order_number, o.customer_name, o.total_amount
      FROM order_returns r
      JOIN Orders o ON r.order_id = o.order_id
    `;
    const params = [];

    if (!isAdmin) {
      sql += ' WHERE r.user_id = ?';
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
      'UPDATE order_returns SET status = ?, admin_notes = ? WHERE return_id = ?',
      [status, adminNotes || '', returnId]
    );

    // If completed, update order to RETURNED and payment_status to REFUNDED
    if (status === 'COMPLETED') {
      const [retRows] = await db.query('SELECT order_id FROM order_returns WHERE return_id = ?', [returnId]);
      if (retRows.length > 0) {
        await db.query(
          "UPDATE Orders SET order_status = 'RETURNED', payment_status = 'REFUNDED' WHERE order_id = ?",
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
