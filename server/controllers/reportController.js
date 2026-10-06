/**
 * Reports and Analytics Controller for ClickCart API
 * Uses SQL aggregate functions: SUM, COUNT, GROUP BY, and Date functions
 */
const db = require('../config/db');

// GET /api/reports/summary - Key Performance Indicators for Dashboard
const getSummary = async (req, res, next) => {
  try {
    // 1. Overall Orders and Revenue
    const [salesResult] = await db.query(`
      SELECT 
        COUNT(*) AS total_orders,
        COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' THEN total_amount ELSE 0 END), 0) AS total_sales,
        COALESCE(SUM(CASE WHEN order_status = 'PLACED' OR order_status = 'PROCESSING' THEN 1 ELSE 0 END), 0) AS pending_orders
      FROM Orders
    `);

    // 2. Today's metrics
    const [todayResult] = await db.query(`
      SELECT 
        COUNT(*) AS today_orders,
        COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' THEN total_amount ELSE 0 END), 0) AS today_sales
      FROM Orders
      WHERE DATE(created_at) = CURRENT_DATE()
    `);

    // 3. Product catalog stats
    const [productResult] = await db.query(`
      SELECT 
        COUNT(*) AS total_products,
        COALESCE(SUM(CASE WHEN stock_quantity <= 15 THEN 1 ELSE 0 END), 0) AS low_stock_products,
        COALESCE(SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_products
      FROM Products
    `);

    // 4. Category count
    const [categoryResult] = await db.query(`
      SELECT COUNT(*) AS total_categories FROM Categories
    `);

    return res.status(200).json({
      success: true,
      data: {
        total_sales: parseFloat(salesResult[0].total_sales || 0),
        total_orders: parseInt(salesResult[0].total_orders || 0, 10),
        pending_orders: parseInt(salesResult[0].pending_orders || 0, 10),
        today_sales: parseFloat(todayResult[0].today_sales || 0),
        today_orders: parseInt(todayResult[0].today_orders || 0, 10),
        total_products: parseInt(productResult[0].total_products || 0, 10),
        low_stock_products: parseInt(productResult[0].low_stock_products || 0, 10),
        out_of_stock_products: parseInt(productResult[0].out_of_stock_products || 0, 10),
        total_categories: parseInt(categoryResult[0].total_categories || 0, 10)
      },
      message: 'Dashboard analytics summary retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/sales-by-category - Aggregated sales by Category using GROUP BY
const getSalesByCategory = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.category_id,
        c.category_name,
        COUNT(DISTINCT p.product_id) AS product_count,
        COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
        COALESCE(SUM(oi.subtotal), 0) AS total_sales
      FROM Categories c
      LEFT JOIN Products p ON c.category_id = p.category_id
      LEFT JOIN Order_Items oi ON p.product_id = oi.product_id
      LEFT JOIN Orders o ON oi.order_id = o.order_id AND o.order_status != 'CANCELLED'
      GROUP BY c.category_id, c.category_name
      ORDER BY total_sales DESC, c.category_name ASC;
    `;
    const [rows] = await db.query(query);

    const formatted = rows.map((r) => ({
      category_id: r.category_id,
      category_name: r.category_name,
      product_count: parseInt(r.product_count, 10),
      total_units_sold: parseInt(r.total_units_sold, 10),
      total_sales: parseFloat(r.total_sales)
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      message: 'Category sales aggregation retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/top-products - Top selling products using SUM(quantity) and GROUP BY
const getTopProducts = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.product_id,
        p.product_name,
        c.category_name,
        p.price,
        p.stock_quantity,
        p.image_url,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
        COALESCE(SUM(oi.subtotal), 0) AS total_revenue
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Order_Items oi ON p.product_id = oi.product_id
      LEFT JOIN Orders o ON oi.order_id = o.order_id AND o.order_status != 'CANCELLED'
      GROUP BY p.product_id, p.product_name, c.category_name, p.price, p.stock_quantity, p.image_url
      ORDER BY total_quantity_sold DESC, total_revenue DESC
      LIMIT 10;
    `;
    const [rows] = await db.query(query);

    const formatted = rows.map((r) => ({
      product_id: r.product_id,
      product_name: r.product_name,
      category_name: r.category_name,
      price: parseFloat(r.price),
      stock_quantity: parseInt(r.stock_quantity, 10),
      image_url: r.image_url,
      total_quantity_sold: parseInt(r.total_quantity_sold, 10),
      total_revenue: parseFloat(r.total_revenue)
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      message: 'Top performing products retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/daily-sales - Daily sales trend using DATE(created_at) aggregation
const getDailySales = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        DATE(created_at) AS sale_date,
        COUNT(order_id) AS total_orders,
        COALESCE(SUM(subtotal), 0) AS subtotal,
        COALESCE(SUM(tax), 0) AS total_tax,
        COALESCE(SUM(total_amount), 0) AS total_sales
      FROM Orders
      WHERE order_status != 'CANCELLED'
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
      LIMIT 30;
    `;
    const [rows] = await db.query(query);

    const formatted = rows.map((r) => ({
      sale_date: r.sale_date,
      total_orders: parseInt(r.total_orders, 10),
      subtotal: parseFloat(r.subtotal),
      total_tax: parseFloat(r.total_tax),
      total_sales: parseFloat(r.total_sales)
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      message: 'Daily sales breakdown retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getSalesByCategory,
  getTopProducts,
  getDailySales
};
