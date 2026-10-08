/**
 * Order Controller for ClickCart API (PostgreSQL / Supabase Ready)
 * Implements strict PostgreSQL transactions, row-level locking (FOR UPDATE),
 * price snapshots, and IAM customer order ownership protection.
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.18');

// Generate human-friendly order identifier (e.g. CC-10245 or ORD-839201)
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-5);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `CC-${timestamp}${randomSuffix}`;
};

/**
 * POST /api/orders - Create an order with atomic PostgreSQL transaction
 */
const createOrder = async (req, res, next) => {
  let connection;

  try {
    const { customer, items, shipping_fee = 0, discount = 0, payment_method = 'cod' } = req.body;
    const authUserId = req.user?.id || req.user?.userId || null;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Customer details and at least one item are required.', 'VALIDATION_ERROR');
    }

    // Acquire dedicated connection from pool for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Verify each product and lock row (FOR UPDATE) to prevent race conditions
    for (const item of items) {
      const productId = parseInt(item.productId || item.product_id || item.id, 10);
      const requestedQty = parseInt(item.quantity, 10);

      if (isNaN(productId) || isNaN(requestedQty) || requestedQty <= 0) {
        await connection.rollback();
        throw new ApiError(400, 'Invalid product ID or quantity specified.', 'VALIDATION_ERROR');
      }

      const [productRows] = await connection.query(
        'SELECT id, name, price, stock, image FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        throw new ApiError(404, `Product ID ${productId} does not exist in catalog.`, 'PRODUCT_NOT_FOUND');
      }

      const product = productRows[0];
      const availableStock = parseInt(product.stock, 10);

      // Check stock availability
      if (availableStock < requestedQty) {
        await connection.rollback();
        throw new ApiError(
          400,
          `Insufficient stock for '${product.name}'. Requested: ${requestedQty}, Available in stock: ${availableStock}.`,
          'INSUFFICIENT_STOCK'
        );
      }

      // Authoritative server-side price calculation from DB
      const currentPrice = parseFloat(product.price);
      const lineSubtotal = Math.round(currentPrice * requestedQty * 100) / 100;
      calculatedSubtotal += lineSubtotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: requestedQty,
        price: currentPrice,
        subtotal: lineSubtotal,
        current_stock: availableStock
      });
    }

    // Finalize financial calculations
    const subtotal = Math.round(calculatedSubtotal * 100) / 100;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shippingFee = Math.round(parseFloat(shipping_fee || 0) * 100) / 100;
    const discountAmount = Math.round(parseFloat(discount || 0) * 100) / 100;
    const totalAmount = Math.round((subtotal + tax + shippingFee - discountAmount) * 100) / 100;
    const orderNumber = generateOrderNumber();

    const normalizedPaymentMethod = (payment_method || 'cod').toLowerCase();
    const orderStatus = 'order_placed';

    // 1. Insert Orders record with authenticated user_id
    const [orderRows, orderMeta] = await connection.query(
      `INSERT INTO orders 
       (order_number, user_id, email, subtotal, tax, shipping_fee, discount, total, payment_method, payment_status, order_status, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13, $14, $15, $16, 'India')
       RETURNING id, order_number, total, created_at`,
      [
        orderNumber,
        authUserId,
        customer.email.trim(),
        subtotal,
        tax,
        shippingFee,
        discountAmount,
        totalAmount,
        normalizedPaymentMethod,
        orderStatus,
        customer.name.trim(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.state.trim(),
        customer.pincode ? customer.pincode.trim() : (customer.postalCode ? customer.postalCode.trim() : '000000')
      ]
    );

    const orderId = orderRows[0]?.id || orderMeta.insertId;

    // 2. Insert Order_Items records & safely decrement Product stock
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product_id, item.product_name, item.price, item.quantity, item.subtotal]
      );

      await connection.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1',
        [item.quantity, item.product_id]
      );
    }

    // 3. Create initial order_status_history record
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [orderId, 'Order Placed', 'Order placed successfully by customer', customer.name.trim()]
    );

    // 4. If authenticated user has active carts, clear their cart items
    if (authUserId) {
      try {
        await connection.query(
          `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)`,
          [authUserId]
        );
      } catch (cartErr) {
        // Non-blocking for order placement
      }
    }

    // Commit transaction atomically
    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        id: orderId,
        order_id: orderId,
        order_number: orderNumber,
        user_id: authUserId,
        customer_name: customer.name.trim(),
        email: customer.email.trim(),
        subtotal,
        tax,
        total_amount: totalAmount,
        total: totalAmount,
        order_status: 'PLACED',
        item_count: validatedItems.length
      },
      message: 'Order placed successfully!'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error rolling back PostgreSQL transaction:', rollbackErr);
      }
    }
    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * GET /api/orders - Get all orders (Administrator only)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, email, search } = req.query;

    let sql = `
      SELECT 
        o.id,
        o.id AS order_id,
        o.order_number,
        o.user_id,
        o.shipping_full_name AS customer_name,
        o.shipping_full_name,
        o.email,
        o.shipping_phone AS phone,
        o.shipping_city AS city,
        o.shipping_state AS state,
        o.shipping_postal_code AS pincode,
        o.subtotal,
        o.tax,
        o.shipping_fee,
        o.discount,
        o.total AS total_amount,
        o.total,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.created_at,
        COUNT(oi.id) AS total_items,
        COALESCE(SUM(oi.quantity), 0) AS total_units
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND (LOWER(o.order_status) = LOWER($${paramIndex}) OR UPPER(o.order_status) = UPPER($${paramIndex}))`;
      params.push(status.trim());
      paramIndex++;
    }

    if (email && email.trim() !== '') {
      sql += ` AND LOWER(o.email) = LOWER($${paramIndex})`;
      params.push(email.trim());
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (o.order_number ILIKE $${paramIndex} OR o.shipping_full_name ILIKE $${paramIndex} OR o.email ILIKE $${paramIndex} OR o.shipping_phone ILIKE $${paramIndex})`;
      params.push(term);
      paramIndex++;
    }

    sql += `
      GROUP BY 
        o.id, o.order_number, o.user_id, o.shipping_full_name, o.email, o.shipping_phone, 
        o.shipping_city, o.shipping_state, o.shipping_postal_code, o.subtotal, o.tax, o.shipping_fee, o.discount, o.total, 
        o.order_status, o.payment_method, o.payment_status, o.created_at
      ORDER BY o.created_at DESC;
    `;

    const [rows] = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
      message: 'Orders retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders - Customer gets only their own orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view your orders.',
        error: 'UNAUTHORIZED'
      });
    }

    const sql = `
      SELECT 
        o.id,
        o.id AS order_id,
        o.order_number,
        o.user_id,
        o.shipping_full_name AS customer_name,
        o.shipping_full_name,
        o.email,
        o.shipping_phone AS phone,
        o.shipping_address AS address,
        o.shipping_city AS city,
        o.shipping_state AS state,
        o.shipping_postal_code AS pincode,
        o.subtotal,
        o.tax,
        o.shipping_fee,
        o.discount,
        o.total AS total_amount,
        o.total,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.created_at,
        COUNT(oi.id) AS total_items,
        COALESCE(SUM(oi.quantity), 0) AS total_units
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE (o.user_id = $1 OR (o.user_id IS NULL AND LOWER(o.email) = LOWER($2)))
      GROUP BY 
        o.id, o.order_number, o.user_id, o.shipping_full_name, o.email, o.shipping_phone, 
        o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_postal_code, o.subtotal, o.tax, o.shipping_fee, o.discount, o.total, 
        o.order_status, o.payment_method, o.payment_status, o.created_at
      ORDER BY o.created_at DESC;
    `;

    const [rows] = await db.query(sql, [userId, userEmail]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
      message: 'Your orders retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id - Get complete order details with item list and invoice data
 */
const getOrderById = async (req, res, next) => {
  try {
    const orderIdentifier = req.params.id;
    const currentUser = req.user;

    let orderSql = `
      SELECT 
        o.id,
        o.id AS order_id,
        o.order_number,
        o.user_id,
        o.shipping_full_name AS customer_name,
        o.shipping_full_name,
        o.email,
        o.shipping_phone AS phone,
        o.shipping_address AS address,
        o.shipping_city AS city,
        o.shipping_state AS state,
        o.shipping_postal_code AS pincode,
        o.subtotal,
        o.tax,
        o.shipping_fee,
        o.discount,
        o.total AS total_amount,
        o.total,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.created_at
      FROM orders o
      WHERE 
    `;
    const params = [];

    const isNumeric = /^\d+$/.test(orderIdentifier);
    if (isNumeric) {
      orderSql += '(o.id = $1 OR o.order_number = $2)';
      params.push(parseInt(orderIdentifier, 10), orderIdentifier);
    } else {
      orderSql += 'o.order_number = $1';
      params.push(orderIdentifier);
    }

    const [orderRows] = await db.query(orderSql, params);

    if (orderRows.length === 0) {
      throw new ApiError(404, `Order '${orderIdentifier}' not found.`, 'ORDER_NOT_FOUND');
    }

    const order = orderRows[0];

    // IAM Access Control: Check ownership if user is not admin
    if (currentUser) {
      if (currentUser.role !== 'admin') {
        const orderUserId = order.user_id;
        const currentUserId = currentUser.id || currentUser.userId;
        const matchesUser = orderUserId && parseInt(orderUserId, 10) === parseInt(currentUserId, 10);
        const matchesEmail = !orderUserId && order.email && order.email.toLowerCase() === currentUser.email.toLowerCase();

        if (!matchesUser && !matchesEmail) {
          return res.status(403).json({
            success: false,
            message: 'Access restricted. You do not have permission to view this order.',
            error: 'FORBIDDEN'
          });
        }
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access order details.',
        error: 'UNAUTHORIZED'
      });
    }

    // Fetch order items with snapshot prices & current product info
    const [itemRows] = await db.query(
      `SELECT 
         oi.id,
         oi.id AS order_item_id,
         oi.order_id,
         oi.product_id,
         oi.quantity,
         oi.product_price AS price,
         oi.product_price,
         oi.subtotal,
         oi.product_name,
         p.image AS image_url,
         p.image,
         c.name AS category_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [order.id]
    );

    // Fetch order status history
    const [historyRows] = await db.query(
      `SELECT id, order_id, status, note, changed_by, created_at
       FROM order_status_history
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [order.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        items: itemRows,
        status_history: historyRows,
        history: historyRows
      },
      message: 'Order details retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status - Update order fulfillment status (Administrator only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId)) {
      throw new ApiError(400, 'Invalid order ID parameter.', 'INVALID_ID');
    }

    const validStatuses = [
      'order_placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
      'PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED',
      'Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'
    ];
    const matchedStatus = validStatuses.find(s => s.toLowerCase().replace(/[\s_]/g, '') === String(status || '').trim().toLowerCase().replace(/[\s_]/g, ''));
    if (!matchedStatus) {
      throw new ApiError(
        422,
        `Invalid status '${status}'. Must be one of: Order Placed, Processing, Shipped, Out for Delivery, Delivered, Cancelled, Returned`,
        'INVALID_STATUS'
      );
    }
    const targetStatus = matchedStatus;

    const [existing] = await db.query('SELECT id, order_status FROM orders WHERE id = $1', [orderId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Order ID ${orderId} not found.`, 'ORDER_NOT_FOUND');
    }

    const isCancelling = status.toUpperCase() === 'CANCELLED' || status.toLowerCase() === 'cancelled';
    const wasCancelled = existing[0].order_status.toUpperCase() === 'CANCELLED' || existing[0].order_status.toLowerCase() === 'cancelled';

    // If transitioning to CANCELLED from an active state, restore product stock
    if (isCancelling && !wasCancelled) {
      const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
      for (const item of items) {
        await db.query(
          'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    await db.query('UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [targetStatus, orderId]);

    // Record transition in order_status_history
    await db.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [orderId, targetStatus, req.body.note || `Status updated to ${targetStatus}`, req.user?.email || 'ADMIN']
    );

    const [updated] = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);

    return res.status(200).json({
      success: true,
      data: updated[0],
      message: `Order status updated to '${targetStatus}'.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/cancel - Customer self-cancellation if order is still PLACED
 */
const cancelOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id || req.user?.userId;

    if (isNaN(orderId)) {
      throw new ApiError(400, 'Invalid order ID parameter.', 'INVALID_ID');
    }

    const [existing] = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Order ID ${orderId} not found.`, 'ORDER_NOT_FOUND');
    }

    const order = existing[0];

    // Verify ownership
    if (req.user.role !== 'admin' && parseInt(order.user_id, 10) !== parseInt(currentUserId, 10)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders.',
        error: 'FORBIDDEN'
      });
    }

    const statusUpper = (order.order_status || '').toUpperCase();
    if (statusUpper !== 'PLACED' && statusUpper !== 'ORDER_PLACED') {
      return res.status(400).json({
        success: false,
        message: `Orders with status '${order.order_status}' cannot be cancelled online.`,
        error: 'CANNOT_CANCEL'
      });
    }

    // Restore stock
    const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    for (const item of items) {
      await db.query(
        'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await db.query("UPDATE orders SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [orderId]);

    // Record cancellation in order_status_history
    await db.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [orderId, 'Cancelled', 'Cancelled by customer', req.user?.email || 'CUSTOMER']
    );

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
