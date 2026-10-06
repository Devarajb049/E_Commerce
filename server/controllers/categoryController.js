/**
 * Category Controller for ClickCart API
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/categories - Get all categories with product count
const getAllCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.category_id, 
        c.category_name, 
        c.description, 
        c.created_at,
        COUNT(p.product_id) AS product_count
      FROM Categories c
      LEFT JOIN Products p ON c.category_id = p.category_id
      GROUP BY c.category_id, c.category_name, c.description, c.created_at
      ORDER BY c.category_name ASC;
    `;
    const [rows] = await db.query(query);

    return res.status(200).json({
      success: true,
      data: rows,
      message: 'Categories retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id - Get single category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, 'Invalid category ID parameter.', 'INVALID_ID');
    }

    const query = `
      SELECT 
        c.category_id, 
        c.category_name, 
        c.description, 
        c.created_at,
        COUNT(p.product_id) AS product_count
      FROM Categories c
      LEFT JOIN Products p ON c.category_id = p.category_id
      WHERE c.category_id = ?
      GROUP BY c.category_id, c.category_name, c.description, c.created_at;
    `;
    const [rows] = await db.query(query, [categoryId]);

    if (rows.length === 0) {
      throw new ApiError(404, `Category with ID ${categoryId} not found.`, 'CATEGORY_NOT_FOUND');
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
      message: 'Category retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories - Create new category
const createCategory = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;

    // Check if category name already exists
    const [existing] = await db.query(
      'SELECT category_id FROM Categories WHERE LOWER(category_name) = LOWER(?)',
      [category_name]
    );
    if (existing.length > 0) {
      throw new ApiError(409, `Category '${category_name}' already exists.`, 'CATEGORY_EXISTS');
    }

    const [result] = await db.query(
      'INSERT INTO Categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );

    const [created] = await db.query(
      'SELECT category_id, category_name, description, created_at FROM Categories WHERE category_id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: created[0],
      message: 'Category created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id - Update existing category
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, 'Invalid category ID parameter.', 'INVALID_ID');
    }

    const { category_name, description } = req.body;

    const [existing] = await db.query('SELECT category_id FROM Categories WHERE category_id = ?', [categoryId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Category with ID ${categoryId} not found.`, 'CATEGORY_NOT_FOUND');
    }

    // Check if another category with the same name exists
    const [duplicate] = await db.query(
      'SELECT category_id FROM Categories WHERE LOWER(category_name) = LOWER(?) AND category_id != ?',
      [category_name, categoryId]
    );
    if (duplicate.length > 0) {
      throw new ApiError(409, `Another category with the name '${category_name}' already exists.`, 'CATEGORY_EXISTS');
    }

    await db.query(
      'UPDATE Categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name, description || null, categoryId]
    );

    const [updated] = await db.query(
      'SELECT category_id, category_name, description, created_at FROM Categories WHERE category_id = ?',
      [categoryId]
    );

    return res.status(200).json({
      success: true,
      data: updated[0],
      message: 'Category updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id - Delete category with dependency check
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, 'Invalid category ID parameter.', 'INVALID_ID');
    }

    const [existing] = await db.query('SELECT category_id, category_name FROM Categories WHERE category_id = ?', [categoryId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Category with ID ${categoryId} not found.`, 'CATEGORY_NOT_FOUND');
    }

    // Check dependent products
    const [productCount] = await db.query(
      'SELECT COUNT(*) AS count FROM Products WHERE category_id = ?',
      [categoryId]
    );

    if (productCount[0].count > 0) {
      throw new ApiError(
        409,
        `Cannot delete category '${existing[0].category_name}' because ${productCount[0].count} product(s) depend on it. Please reassign or delete the products first.`,
        'CATEGORY_HAS_DEPENDENTS'
      );
    }

    await db.query('DELETE FROM Categories WHERE category_id = ?', [categoryId]);

    return res.status(200).json({
      success: true,
      data: { category_id: categoryId },
      message: `Category '${existing[0].category_name}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
