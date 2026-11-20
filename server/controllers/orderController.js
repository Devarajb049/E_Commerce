/**
 * Order Controller for ClickCart API (PostgreSQL / Supabase Ready)
 * Implements strict PostgreSQL transactions, row-level locking (FOR UPDATE),
 * price snapshots, and IAM customer order ownership protection.
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.18');

/**
 * Standardize lifecycle order status strings across database, APIs, and frontends.
 * Uniformly maps legacy/case-variant statuses to canonical uppercase tokens:
 * PLACED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED.
 */
const normalizeOrderStatus = (raw) => {
  if (!raw) return 'PLACED';
  const clean = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (clean === 'ORDER_PLACED' || clean === 'ORDERPLACED' || clean === 'PLACED') return 'PLACED';
  if (clean === 'PROCESSING') return 'PROCESSING';
  if (clean === 'SHIPPED') return 'SHIPPED';
  if (clean === 'OUT_FOR_DELIVERY' || clean === 'OUTFORDELIVERY') return 'OUT_FOR_DELIVERY';
  if (clean === 'DELIVERED') return 'DELIVERED';
  if (clean === 'CANCELLED' || clean === 'CANCELED') return 'CANCELLED';
  if (clean === 'RETURN_REQUESTED' || clean === 'RETURNREQUESTED') return 'RETURN_REQUESTED';
  if (clean === 'RETURNED') return 'RETURNED';
  if (clean === 'REFUNDED') return 'REFUNDED';
  return clean;
};

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
    const orderStatus = 'PLACED';

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

      const [stockUpdateRows, stockMeta] = await connection.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1 RETURNING id, stock',
        [item.quantity, item.product_id]
      );

      const stockUpdated = (stockUpdateRows && stockUpdateRows.length > 0) || (stockMeta && stockMeta.affectedRows > 0);
      if (!stockUpdated) {
        await connection.rollback();
        throw new ApiError(
          400,
          `Inventory for '${item.product_name}' became insufficient during purchase. Order could not be completed.`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // 3. Create initial order_status_history record
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [orderId, 'PLACED', 'Order placed successfully by customer', customer.name.trim()]
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
      const clean = normalizeOrderStatus(status);
      sql += ` AND (
        UPPER(o.order_status) = $${paramIndex} OR 
        UPPER(REPLACE(REPLACE(o.order_status, ' ', '_'), '-', '_')) = $${paramIndex} OR 
        LOWER(o.order_status) = LOWER($${paramIndex})
      )`;
      params.push(clean);
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
    const normalizedRows = rows.map((r) => ({
      ...r,
      order_status: normalizeOrderStatus(r.order_status)
    }));

    return res.status(200).json({
      success: true,
      count: normalizedRows.length,
      data: normalizedRows,
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
    const normalizedRows = rows.map((r) => ({
      ...r,
      order_status: normalizeOrderStatus(r.order_status)
    }));

    return res.status(200).json({
      success: true,
      count: normalizedRows.length,
      data: normalizedRows,
      message: 'Your orders retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id - Get complete order details with item list and invoice data
 * Enforces strict user isolation: customer only accesses own order, admin accesses any.
 * Returns 404 Not Found if inaccessible.
 */
const getOrderById = async (req, res, next) => {
  try {
    const orderIdentifier = req.params.id;
    const currentUser = req.user;
    const currentUserId = currentUser.id || currentUser.userId;
    const isAdmin = currentUser.role === 'admin';

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
        o.shipping_country,
        o.subtotal,
        o.tax,
        o.shipping_fee,
        o.discount,
        o.total AS total_amount,
        o.total,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.estimated_delivery_date,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE 
    `;
    const params = [];

    if (isAdmin) {
      orderSql += '(o.id::text = $1 OR o.order_number = $1)';
      params.push(orderIdentifier);
    } else {
      orderSql += '(o.id::text = $1 OR o.order_number = $1) AND o.user_id = $2';
      params.push(orderIdentifier, currentUserId);
    }

    const [orderRows] = await db.query(orderSql, params);

    if (orderRows.length === 0) {
      throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
    }

    const order = orderRows[0];

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
        order_status: normalizeOrderStatus(order.order_status),
        items: itemRows,
        status_history: historyRows.map((h) => ({
          ...h,
          status: normalizeOrderStatus(h.status)
        })),
        history: historyRows.map((h) => ({
          ...h,
          status: normalizeOrderStatus(h.status)
        }))
      },
      message: 'Order details retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id/track - Live tracking data with status history, delivery estimate & current stage
 */
const trackOrder = async (req, res, next) => {
  try {
    const orderIdentifier = req.params.id;
    const currentUser = req.user;
    const currentUserId = currentUser.id || currentUser.userId;
    const isAdmin = currentUser.role === 'admin';

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
        o.shipping_country,
        o.subtotal,
        o.tax,
        o.shipping_fee,
        o.discount,
        o.total AS total_amount,
        o.total,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.estimated_delivery_date,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE 
    `;
    const params = [];

    if (isAdmin) {
      orderSql += '(o.id::text = $1 OR o.order_number = $1)';
      params.push(orderIdentifier);
    } else {
      orderSql += '(o.id::text = $1 OR o.order_number = $1) AND o.user_id = $2';
      params.push(orderIdentifier, currentUserId);
    }

    const [orderRows] = await db.query(orderSql, params);

    if (orderRows.length === 0) {
      throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
    }

    const order = orderRows[0];

    // Fetch order line items
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

    // Fetch real chronological history events from database
    const [historyRows] = await db.query(
      `SELECT id, order_id, status, note, changed_by, created_at
       FROM order_status_history
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [order.id]
    );

    const latestHistory = historyRows.length > 0 ? historyRows[historyRows.length - 1] : null;
    const latestTimestamp = latestHistory ? latestHistory.created_at : (order.updated_at || order.created_at);

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        order_status: normalizeOrderStatus(order.order_status),
        items: itemRows,
        status_history: historyRows.map((h) => ({
          ...h,
          status: normalizeOrderStatus(h.status)
        })),
        history: historyRows.map((h) => ({
          ...h,
          status: normalizeOrderStatus(h.status)
        })),
        latest_status_timestamp: latestTimestamp,
        last_updated: latestTimestamp
      },
      message: 'Order tracking retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status - Update order fulfillment status (Administrator only)
 * Supports targeting by numeric ID or human-readable order number.
 * Updates order_status in database and logs transition into order_status_history.
 */
const updateOrderStatus = async (req, res, next) => {
  let connection;
  try {
    const orderIdentifier = req.params.id;
    const { status, note } = req.body;

    if (!orderIdentifier) {
      throw new ApiError(400, 'Order identifier parameter is required.', 'INVALID_ID');
    }

    const normalizedStatus = normalizeOrderStatus(status);

    const validStatuses = [
      'PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED', 'RETURN_REQUESTED'
    ];

    if (!validStatuses.includes(normalizedStatus)) {
      throw new ApiError(
        422,
        `Invalid status '${status}'. Must be one of: PLACED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED, REFUNDED`,
        'INVALID_STATUS'
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id, order_number, order_status FROM orders WHERE (id::text = $1 OR order_number = $1) FOR UPDATE',
      [String(orderIdentifier)]
    );
    if (existing.length === 0) {
      await connection.rollback();
      throw new ApiError(404, `Order '${orderIdentifier}' not found.`, 'ORDER_NOT_FOUND');
    }

    const targetOrder = existing[0];
    const targetOrderId = targetOrder.id;
    const currentStatus = normalizeOrderStatus(targetOrder.order_status);
    const isCancelling = normalizedStatus === 'CANCELLED';
    const wasCancelled = currentStatus === 'CANCELLED';

    // If transitioning to Cancelled from an active state, restore product stock safely
    if (isCancelling && !wasCancelled) {
      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [targetOrderId]);
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.query(
      'UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [normalizedStatus, targetOrderId]
    );

    // Record transition in order_status_history
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [targetOrderId, normalizedStatus, note || `Status updated to ${normalizedStatus}`, req.user?.email || 'ADMIN']
    );

    await connection.commit();

    const [updated] = await db.query('SELECT * FROM orders WHERE id = $1', [targetOrderId]);

    return res.status(200).json({
      success: true,
      data: {
        ...updated[0],
        order_status: normalizeOrderStatus(updated[0].order_status)
      },
      message: `Order status updated to '${normalizedStatus}'.`
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rErr) {}
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

/**
 * PUT /api/orders/:id/cancel - Customer self-cancellation if order is still in PLACED status
 */
const cancelOrder = async (req, res, next) => {
  let connection;
  try {
    const orderIdentifier = req.params.id;
    const currentUserId = req.user?.id || req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    connection = await db.getConnection();
    await connection.beginTransaction();

    let checkSql = 'SELECT id, order_number, user_id, order_status FROM orders WHERE (id::text = $1 OR order_number = $1)';
    const checkParams = [orderIdentifier];

    if (!isAdmin) {
      checkSql += ' AND user_id = $2';
      checkParams.push(currentUserId);
    }
    checkSql += ' FOR UPDATE';

    const [existing] = await connection.query(checkSql, checkParams);
    if (existing.length === 0) {
      await connection.rollback();
      throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
    }

    const order = existing[0];
    const statusNormalized = normalizeOrderStatus(order.order_status);

    if (statusNormalized === 'CANCELLED') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This order is already cancelled.',
        error: 'ALREADY_CANCELLED'
      });
    }

    if (statusNormalized !== 'PLACED') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Orders with status '${order.order_status}' cannot be cancelled online.`,
        error: 'CANNOT_CANCEL'
      });
    }

    // Atomically restore product stock
    const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await connection.query("UPDATE orders SET order_status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [order.id]);

    // Record cancellation in order_status_history
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [order.id, 'CANCELLED', 'Cancelled by customer', req.user?.email || 'CUSTOMER']
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rErr) {}
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  normalizeOrderStatus
};

