/**
 * Product Controller for ClickCart API
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/products - Get all products with search, category filter, price filter & sorting
const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, sort, min_price, max_price, in_stock_only } = req.query;

    let sql = `
      SELECT 
        p.product_id,
        p.category_id,
        c.category_name,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    // Search query across name and description
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      sql += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    // Category filter by ID or name
    if (category && category !== 'all' && category !== '') {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) {
        sql += ' AND p.category_id = ?';
        params.push(catId);
      } else {
        sql += ' AND LOWER(c.category_name) = LOWER(?)';
        params.push(category.trim());
      }
    }

    // Price filters
    if (min_price && !isNaN(parseFloat(min_price))) {
      sql += ' AND p.price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price && !isNaN(parseFloat(max_price))) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    // Stock filter
    if (in_stock_only === 'true' || in_stock_only === '1') {
      sql += ' AND p.stock_quantity > 0';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC, p.product_id ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC, p.product_id ASC';
        break;
      case 'name_asc':
        sql += ' ORDER BY p.product_name ASC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC, p.product_id DESC';
        break;
      default:
        sql += ' ORDER BY p.product_id ASC';
        break;
    }

    const [rows] = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
      message: 'Products retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id - Get single product by ID
const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID parameter.', 'INVALID_ID');
    }

    const query = `
      SELECT 
        p.product_id,
        p.category_id,
        c.category_name,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM Products p
      INNER JOIN Categories c ON p.category_id = c.category_id
      WHERE p.product_id = ?
    `;
    const [rows] = await db.query(query, [productId]);

    if (rows.length === 0) {
      throw new ApiError(404, `Product with ID ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
      message: 'Product retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products - Create a new product
const createProduct = async (req, res, next) => {
  try {
    const { category_id, product_name, description, price, stock_quantity, image_url } = req.body;

    // Check if category exists
    const [cat] = await db.query('SELECT category_id FROM Categories WHERE category_id = ?', [category_id]);
    if (cat.length === 0) {
      throw new ApiError(404, `Category ID ${category_id} does not exist.`, 'CATEGORY_NOT_FOUND');
    }

    const [result] = await db.query(
      `INSERT INTO Products (category_id, product_name, description, price, stock_quantity, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, product_name, description || null, price, stock_quantity, image_url || null]
    );

    const [newProduct] = await db.query(
      `SELECT p.*, c.category_name 
       FROM Products p 
       JOIN Categories c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newProduct[0],
      message: 'Product created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id - Update product
const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID parameter.', 'INVALID_ID');
    }

    const { category_id, product_name, description, price, stock_quantity, image_url } = req.body;

    // Check if product exists
    const [existing] = await db.query('SELECT product_id FROM Products WHERE product_id = ?', [productId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Product with ID ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }

    // Check if category exists
    const [cat] = await db.query('SELECT category_id FROM Categories WHERE category_id = ?', [category_id]);
    if (cat.length === 0) {
      throw new ApiError(404, `Category ID ${category_id} does not exist.`, 'CATEGORY_NOT_FOUND');
    }

    await db.query(
      `UPDATE Products 
       SET category_id = ?, product_name = ?, description = ?, price = ?, stock_quantity = ?, image_url = ?
       WHERE product_id = ?`,
      [category_id, product_name, description || null, price, stock_quantity, image_url || null, productId]
    );

    const [updatedProduct] = await db.query(
      `SELECT p.*, c.category_name 
       FROM Products p 
       JOIN Categories c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      data: updatedProduct[0],
      message: 'Product updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id - Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID parameter.', 'INVALID_ID');
    }

    const [existing] = await db.query('SELECT product_id, product_name FROM Products WHERE product_id = ?', [productId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Product with ID ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }

    // Check if referenced in Order_Items
    const [orderedItems] = await db.query('SELECT COUNT(*) as count FROM Order_Items WHERE product_id = ?', [productId]);
    if (orderedItems[0].count > 0) {
      throw new ApiError(
        409,
        `Cannot delete product '${existing[0].product_name}' because it exists in ${orderedItems[0].count} historical order records. You may set its stock to 0 to prevent further purchases.`,
        'PRODUCT_IN_ORDERS'
      );
    }

    await db.query('DELETE FROM Products WHERE product_id = ?', [productId]);

    return res.status(200).json({
      success: true,
      data: { product_id: productId },
      message: `Product '${existing[0].product_name}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
