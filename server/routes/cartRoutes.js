const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// All cart operations strictly require valid authentication (Rule #8)
router.use(authenticateToken);

/**
 * Helper to retrieve or create cart for an authenticated user
 */
async function getOrCreateCart(userId) {
  if (!userId) {
    throw new Error('User ID is required for cart operations.');
  }

  const [rows] = await db.query(
    'SELECT id FROM carts WHERE user_id = $1 ORDER BY id ASC LIMIT 1',
    [userId]
  );
  if (rows.length > 0) return rows[0].id;

  const [created] = await db.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
    [userId]
  );
  return created[0].id;
}

/**
 * GET /api/cart - Retrieve current cart items for authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const cartId = await getOrCreateCart(userId);

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
         p.original_price,
         p.stock,
         p.stock AS stock_quantity,
         p.image,
         p.image AS image_url,
         c.name AS category_name,
         (ci.quantity * p.price) AS subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
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
 * POST /api/cart - Add product to authenticated user's cart
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { productId, product_id, quantity = 1 } = req.body;
    const pId = parseInt(productId || product_id, 10);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!pId || isNaN(pId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required.'
      });
    }

    // Verify product and stock in catalog
    const [pRows] = await db.query(
      'SELECT id, name, price, stock FROM products WHERE id = $1',
      [pId]
    );
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

    const cartId = await getOrCreateCart(userId);

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
 * PUT /api/cart/:id - Update item quantity in cart with ownership verification
 */
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const targetId = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(targetId) || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and positive quantity required.'
      });
    }

    const cartId = await getOrCreateCart(userId);

    // Verify ownership: ensure item belongs to this user's cart (by item id or product id)
    const [itemRows] = await db.query(
      `SELECT ci.id, ci.product_id, ci.cart_id, p.stock, p.name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE (ci.id = $1 OR ci.product_id = $1) AND ci.cart_id = $2`,
      [targetId, cartId]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found or does not belong to your cart.'
      });
    }

    const item = itemRows[0];
    if (qty > item.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock} units available for '${item.name}'.`
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [qty, item.id]
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
 * DELETE /api/cart/:id - Remove item from cart with ownership verification
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid cart item ID required.'
      });
    }

    const cartId = await getOrCreateCart(userId);

    const [deleteResult] = await db.query(
      'DELETE FROM cart_items WHERE (id = $1 OR product_id = $1) AND cart_id = $2',
      [targetId, cartId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found or does not belong to your cart.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart - Clear entire cart for authenticated user
 */
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const cartId = await getOrCreateCart(userId);

    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/merge - Merge guest cart with authenticated user's cart (Rule #6)
 */
router.post('/merge', async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { items = [] } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required for merging cart.'
      });
    }

    const cartId = await getOrCreateCart(userId);
    const adjustments = [];

    // If guest cart is empty, return current server cart
    if (items.length === 0) {
      const [currentItems] = await db.query(
        `SELECT ci.id, ci.id AS cart_item_id, ci.cart_id, ci.product_id, ci.quantity,
                p.name, p.name AS product_name, p.price, p.stock, p.stock AS stock_quantity,
                p.image, p.image AS image_url, c.name AS category_name,
                (ci.quantity * p.price) AS subtotal
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE ci.cart_id = $1
         ORDER BY ci.created_at ASC`,
        [cartId]
      );
      const subtotal = currentItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
      const tax = Math.round(subtotal * 0.18 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      return res.status(200).json({
        success: true,
        message: 'Cart synchronized.',
        data: {
          cart_id: cartId,
          items: currentItems,
          subtotal,
          tax,
          total,
          item_count: currentItems.reduce((sum, item) => sum + item.quantity, 0),
          adjustments: []
        }
      });
    }

    // Retrieve existing items in user's server cart
    const [existingCartItems] = await db.query(
      'SELECT id, product_id, quantity FROM cart_items WHERE cart_id = $1',
      [cartId]
    );
    const existingMap = new Map();
    existingCartItems.forEach((item) => {
      existingMap.set(parseInt(item.product_id, 10), item);
    });

    // Merge each guest item
    for (const guestItem of items) {
      const pId = parseInt(guestItem.product_id || guestItem.productId || guestItem.id, 10);
      const guestQty = Math.max(1, parseInt(guestItem.quantity, 10) || 1);

      if (isNaN(pId)) continue;

      // Validate product existence and stock in catalog
      const [productRows] = await db.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1',
        [pId]
      );

      if (productRows.length === 0) {
        adjustments.push({
          productId: pId,
          message: `Product ID ${pId} is no longer available and was omitted.`
        });
        continue;
      }

      const product = productRows[0];
      const stock = parseInt(product.stock, 10);

      if (stock <= 0) {
        adjustments.push({
          productId: pId,
          productName: product.name,
          message: `'${product.name}' is out of stock and was omitted.`
        });
        continue;
      }

      const existing = existingMap.get(pId);
      const currentQty = existing ? existing.quantity : 0;
      let targetQty = currentQty + guestQty;

      if (targetQty > stock) {
        targetQty = stock;
        adjustments.push({
          productId: pId,
          productName: product.name,
          adjustedTo: stock,
          message: `'${product.name}' quantity was adjusted to maximum available stock (${stock}).`
        });
      }

      if (existing) {
        await db.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [targetQty, existing.id]
        );
      } else {
        await db.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP`,
          [cartId, pId, targetQty]
        );
      }
    }

    // Retrieve updated cart items
    const [finalItems] = await db.query(
      `SELECT ci.id, ci.id AS cart_item_id, ci.cart_id, ci.product_id, ci.quantity,
              p.name, p.name AS product_name, p.price, p.stock, p.stock AS stock_quantity,
              p.image, p.image AS image_url, c.name AS category_name,
              (ci.quantity * p.price) AS subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    const subtotal = finalItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return res.status(200).json({
      success: true,
      message: 'Cart merged successfully.',
      data: {
        cart_id: cartId,
        items: finalItems,
        subtotal,
        tax,
        total,
        item_count: finalItems.reduce((sum, item) => sum + item.quantity, 0),
        adjustments
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
