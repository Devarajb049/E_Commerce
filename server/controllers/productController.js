/**
 * Product Controller for ClickCart API (PostgreSQL / Supabase Ready)
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/products - Get all products with search, category filter, price filter & sorting
const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, sort, min_price, max_price, in_stock_only } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.id AS product_id,
        p.category_id,
        c.name AS category_name,
        c.name,
        p.name,
        p.name AS product_name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.stock AS stock_quantity,
        p.image,
        p.image AS image_url,
        p.sku,
        p.status,
        p.created_at,
        p.updated_at
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Search query across name and description
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(searchTerm);
      paramIndex++;
    }

    // Category filter by ID, slug, or name
    if (category && category !== 'all' && category !== '') {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) {
        sql += ` AND p.category_id = $${paramIndex}`;
        params.push(catId);
        paramIndex++;
      } else {
        sql += ` AND (LOWER(c.name) = LOWER($${paramIndex}) OR LOWER(c.slug) = LOWER($${paramIndex}))`;
        params.push(category.trim());
        paramIndex++;
      }
    }

    // Price filters
    if (min_price && !isNaN(parseFloat(min_price))) {
      sql += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price && !isNaN(parseFloat(max_price))) {
      sql += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    // Stock filter
    if (in_stock_only === 'true' || in_stock_only === '1') {
      sql += ' AND p.stock > 0';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC, p.id ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC, p.id ASC';
        break;
      case 'name_asc':
        sql += ' ORDER BY p.name ASC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC, p.id DESC';
        break;
      default:
        sql += ' ORDER BY p.id ASC';
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

// GET /api/products/:id - Get single product by ID or slug
const getProductById = async (req, res, next) => {
  try {
    const param = req.params.id;
    const isNumeric = /^\d+$/.test(param);

    const query = `
      SELECT 
        p.id,
        p.id AS product_id,
        p.category_id,
        c.name AS category_name,
        c.name,
        p.name,
        p.name AS product_name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.stock AS stock_quantity,
        p.image,
        p.image AS image_url,
        p.sku,
        p.status,
        p.created_at,
        p.updated_at
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = $1' : 'p.slug = $1'}
    `;
    const [rows] = await db.query(query, [isNumeric ? parseInt(param, 10) : param]);

    if (rows.length === 0) {
      throw new ApiError(404, `Product '${param}' not found.`, 'PRODUCT_NOT_FOUND');
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

// POST /api/products - Create a new product (Admin)
const createProduct = async (req, res, next) => {
  try {
    const { category_id, product_name, name, description, price, stock_quantity, stock, image_url, image, sku } = req.body;
    const prodName = product_name || name;
    const prodStock = stock_quantity !== undefined ? stock_quantity : stock;
    const prodImage = image_url || image;

    if (!prodName || !category_id || price === undefined) {
      throw new ApiError(400, 'Product name, category ID, and price are required.', 'VALIDATION_ERROR');
    }

    // Check if category exists
    const [cat] = await db.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (cat.length === 0) {
      throw new ApiError(404, `Category ID ${category_id} does not exist.`, 'CATEGORY_NOT_FOUND');
    }

    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    const prodSku = sku || 'SKU-' + Date.now().toString().slice(-6);

    const [insertRows, meta] = await db.query(
      `INSERT INTO products (category_id, name, slug, description, price, stock, image, sku, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [category_id, prodName, slug, description || null, price, prodStock || 0, prodImage || null, prodSku]
    );

    const newId = insertRows[0]?.id || meta.insertId;

    const [newProduct] = await db.query(
      `SELECT p.id, p.id AS product_id, p.name, p.name AS product_name, p.price, p.stock, p.stock AS stock_quantity, p.image, p.image AS image_url, c.name AS category_name
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [newId]
    );

    return res.status(201).json({
      success: true,
      data: newProduct[0] || insertRows[0],
      message: 'Product created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id - Update product (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID parameter.', 'INVALID_ID');
    }

    const { category_id, product_name, name, description, price, stock_quantity, stock, image_url, image } = req.body;
    const prodName = product_name || name;
    const prodStock = stock_quantity !== undefined ? stock_quantity : stock;
    const prodImage = image_url || image;

    // Check if product exists
    const [existing] = await db.query('SELECT id, name FROM products WHERE id = $1', [productId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Product with ID ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }

    // Check if category exists if provided
    if (category_id) {
      const [cat] = await db.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (cat.length === 0) {
        throw new ApiError(404, `Category ID ${category_id} does not exist.`, 'CATEGORY_NOT_FOUND');
      }
    }

    await db.query(
      `UPDATE products 
       SET category_id = COALESCE($1, category_id), 
           name = COALESCE($2, name), 
           description = COALESCE($3, description), 
           price = COALESCE($4, price), 
           stock = COALESCE($5, stock), 
           image = COALESCE($6, image),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [category_id || null, prodName || null, description || null, price || null, prodStock || null, prodImage || null, productId]
    );

    const [updatedProduct] = await db.query(
      `SELECT p.id, p.id AS product_id, p.name, p.name AS product_name, p.price, p.stock, p.stock AS stock_quantity, p.image, p.image AS image_url, c.name AS category_name
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
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

// DELETE /api/products/:id - Delete product (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      throw new ApiError(400, 'Invalid product ID parameter.', 'INVALID_ID');
    }

    const [existing] = await db.query('SELECT id, name FROM products WHERE id = $1', [productId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Product with ID ${productId} not found.`, 'PRODUCT_NOT_FOUND');
    }

    // Check if referenced in order_items
    const [orderedItems] = await db.query('SELECT COUNT(*) as count FROM order_items WHERE product_id = $1', [productId]);
    if (parseInt(orderedItems[0]?.count || 0, 10) > 0) {
      throw new ApiError(
        409,
        `Cannot delete product '${existing[0].name}' because it exists in historical order records. You may set its stock to 0 to prevent further purchases.`,
        'PRODUCT_IN_ORDERS'
      );
    }

    await db.query('DELETE FROM products WHERE id = $1', [productId]);

    return res.status(200).json({
      success: true,
      data: { product_id: productId, id: productId },
      message: `Product '${existing[0].name}' deleted successfully.`
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
