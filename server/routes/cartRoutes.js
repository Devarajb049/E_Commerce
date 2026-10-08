const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

/**
 * Helper to retrieve or create a cart for an authenticated user or guest session
 */
async function getOrCreateCart(req) {
  const userId = req.user?.id || req.user?.userId || null;
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || null;

  if (userId) {
    const [rows] = await db.query('SELECT id FROM carts WHERE user_id = $1 LIMIT 1', [userId]);
    if (rows.length > 0) return rows[0].id;

    const [created] = await db.query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    return created[0].id;
  }

  if (sessionId) {
    const [rows] = await db.query('SELECT id FROM carts WHERE session_id = $1 LIMIT 1', [sessionId]);
    if (rows.length > 0) return rows[0].id;

    const [created] = await db.query(
      'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
      [sessionId]
    );
    return created[0].id;
  }

  // Fallback temporary session cart
  const fallbackSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const [created] = await db.query(
    'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
    [fallbackSessionId]
  );
  return created[0].id;
}

/**
 * GET /api/cart - Retrieve current cart items
 */
router.get('/', async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req);

    const [items] = await db.query(
      `SELECT 
         ci.id,
         ci.id AS cart_item_id,
         ci.cart_id,
         ci.product_id,
         ci.quantity,
         p.name,
         p.name AS product_name,
         p.price,
         p.stock,
         p.stock AS stock_quantity,
         p.image,
         p.image AS image_url,
         (ci.quantity * p.price) AS subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        cart_id: cartId,
        items,
        subtotal,
        tax,
        total,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart - Add product to cart
 */
router.post('/', async (req, res, next) => {
  try {
    const { productId, product_id, quantity = 1 } = req.body;
    const pId = parseInt(productId || product_id, 10);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!pId || isNaN(pId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required.'
      });
    }

    // Verify product and stock
    const [pRows] = await db.query('SELECT id, name, price, stock FROM products WHERE id = $1', [pId]);
    if (pRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = pRows[0];
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for '${product.name}'. Available: ${product.stock}`
      });
    }

    const cartId = await getOrCreateCart(req);

    // Upsert cart_items
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, pId]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Stock limit: ${product.stock}`
        });
      }

      await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQty, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
        [cartId, pId, qty]
      );
    }

    res.status(200).json({
      success: true,
      message: `'${product.name}' added to cart.`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/cart/:id - Update item quantity in cart
 */
router.put('/:id', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(itemId) || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and positive quantity required.'
      });
    }

    const [itemRows] = await db.query(
      `SELECT ci.id, ci.product_id, p.stock, p.name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = $1`,
      [itemId]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    if (qty > itemRows[0].stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${itemRows[0].stock} units available for '${itemRows[0].name}'.`
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [qty, itemId]
    );

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart/:id - Remove item from cart
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid cart item ID required.'
      });
    }

    await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
