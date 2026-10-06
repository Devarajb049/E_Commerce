/**
 * Order Controller for ClickCart API
 * Implements strict MySQL transaction handling, stock checks, and server-side price calculation
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.18');

// Generate human-friendly order identifier (e.g. ORD-839201)
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `ORD-${timestamp}${randomSuffix}`;
};

// POST /api/orders - Create an order with atomic MySQL transaction
const createOrder = async (req, res, next) => {
  let connection;

  try {
    const { customer, items } = req.body;

    // Acquire dedicated connection from pool for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Verify each product and lock row (FOR UPDATE) to prevent race conditions
    for (const item of items) {
      const productId = parseInt(item.productId || item.product_id, 10);
      const requestedQty = parseInt(item.quantity, 10);

      const [productRows] = await connection.query(
        'SELECT product_id, product_name, price, stock_quantity, image_url FROM Products WHERE product_id = ? FOR UPDATE',
        [productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        throw new ApiError(404, `Product ID ${productId} does not exist in catalog.`, 'PRODUCT_NOT_FOUND');
      }

      const product = productRows[0];

      // Check stock availability
      if (product.stock_quantity < requestedQty) {
        await connection.rollback();
        throw new ApiError(
          400,
          `Insufficient stock for '${product.product_name}'. Requested: ${requestedQty}, Available in stock: ${product.stock_quantity}.`,
          'INSUFFICIENT_STOCK'
        );
      }

      // Authoritative server-side price calculation from DB
      const currentPrice = parseFloat(product.price);
      const lineSubtotal = Math.round(currentPrice * requestedQty * 100) / 100;
      calculatedSubtotal += lineSubtotal;

      validatedItems.push({
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: requestedQty,
        price: currentPrice,
        subtotal: lineSubtotal,
        current_stock: product.stock_quantity
      });
    }

    // Finalize financial calculations
    const subtotal = Math.round(calculatedSubtotal * 100) / 100;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;
    const orderNumber = generateOrderNumber();

    // 1. Insert Orders record
    const [orderResult] = await connection.query(
      `INSERT INTO Orders 
       (order_number, customer_name, email, phone, address, city, state, pincode, subtotal, tax, total_amount, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLACED')`,
      [
        orderNumber,
        customer.name.trim(),
        customer.email.trim(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.state.trim(),
        customer.pincode.trim(),
        subtotal,
        tax,
        totalAmount
      ]
    );

    const orderId = orderResult.insertId;

    // 2. Insert Order_Items records & update Product stock
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO Order_Items (order_id, product_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.subtotal]
      );

      await connection.query(
        'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Commit transaction atomically
    await connection.commit();

    return res.status(201).json({
      success: true,
      data: {
        order_id: orderId,
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        email: customer.email.trim(),
        subtotal,
        tax,
        total_amount: totalAmount,
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
        console.error('Error rolling back transaction:', rollbackErr);
      }
    }
    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// GET /api/orders - Get all orders with item count & optional status filter
const getAllOrders = async (req, res, next) => {
  try {
    const { status, email, search } = req.query;

    let sql = `
      SELECT 
        o.order_id,
        o.order_number,
        o.customer_name,
        o.email,
        o.phone,
        o.city,
        o.state,
        o.pincode,
        o.subtotal,
        o.tax,
        o.total_amount,
        o.order_status,
        o.created_at,
        COUNT(oi.order_item_id) AS total_items,
        SUM(oi.quantity) AS total_units
      FROM Orders o
      LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND o.order_status = ?';
      params.push(status.toUpperCase());
    }

    if (email && email.trim() !== '') {
      sql += ' AND LOWER(o.email) = LOWER(?)';
      params.push(email.trim());
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.email LIKE ? OR o.phone LIKE ?)';
      params.push(term, term, term, term);
    }

    sql += `
      GROUP BY 
        o.order_id, o.order_number, o.customer_name, o.email, o.phone, 
        o.city, o.state, o.pincode, o.subtotal, o.tax, o.total_amount, 
        o.order_status, o.created_at
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

// GET /api/orders/:id - Get complete order details with item list and invoice data
const getOrderById = async (req, res, next) => {
  try {
    const orderIdentifier = req.params.id;

    // Can search by integer ID or string order_number (e.g. ORD-123456)
    let orderSql = 'SELECT * FROM Orders WHERE ';
    const params = [];

    const isNumeric = /^\d+$/.test(orderIdentifier);
    if (isNumeric) {
      orderSql += 'order_id = ? OR order_number = ?';
      params.push(parseInt(orderIdentifier, 10), orderIdentifier);
    } else {
      orderSql += 'order_number = ?';
      params.push(orderIdentifier);
    }

    const [orderRows] = await db.query(orderSql, params);

    if (orderRows.length === 0) {
      throw new ApiError(404, `Order '${orderIdentifier}' not found.`, 'ORDER_NOT_FOUND');
    }

    const order = orderRows[0];

    // Fetch order items with snapshot prices & current product info
    const [itemRows] = await db.query(
      `SELECT 
         oi.order_item_id,
         oi.order_id,
         oi.product_id,
         oi.quantity,
         oi.price,
         oi.subtotal,
         p.product_name,
         p.image_url,
         c.category_name
       FROM Order_Items oi
       LEFT JOIN Products p ON oi.product_id = p.product_id
       LEFT JOIN Categories c ON p.category_id = c.category_id
       WHERE oi.order_id = ?
       ORDER BY oi.order_item_id ASC`,
      [order.order_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        items: itemRows
      },
      message: 'Order details retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status - Update order fulfillment status
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId)) {
      throw new ApiError(400, 'Invalid order ID parameter.', 'INVALID_ID');
    }

    const validStatuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(
        422,
        `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
        'INVALID_STATUS'
      );
    }

    const newStatus = status.toUpperCase();

    const [existing] = await db.query('SELECT order_id, order_status FROM Orders WHERE order_id = ?', [orderId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Order ID ${orderId} not found.`, 'ORDER_NOT_FOUND');
    }

    // If transitioning to CANCELLED from an active state, optionally restore product stock
    if (newStatus === 'CANCELLED' && existing[0].order_status !== 'CANCELLED') {
      const [items] = await db.query('SELECT product_id, quantity FROM Order_Items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await db.query(
          'UPDATE Products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await db.query('UPDATE Orders SET order_status = ? WHERE order_id = ?', [newStatus, orderId]);

    const [updated] = await db.query('SELECT * FROM Orders WHERE order_id = ?', [orderId]);

    return res.status(200).json({
      success: true,
      data: updated[0],
      message: `Order status updated to '${newStatus}'.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
