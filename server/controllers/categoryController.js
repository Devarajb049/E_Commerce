/**
 * Category Controller for ClickCart API (PostgreSQL / Supabase Ready)
 */
const db = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/categories - Get all categories with product count
const getAllCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.id AS category_id,
        c.name,
        c.name AS category_name,
        c.slug,
        c.description,
        c.image,
        c.status,
        c.created_at,
        c.updated_at,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.slug, c.description, c.image, c.status, c.created_at, c.updated_at
      ORDER BY c.name ASC;
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

// GET /api/categories/:id - Get single category by ID or slug
const getCategoryById = async (req, res, next) => {
  try {
    const param = req.params.id;
    const isNumeric = /^\d+$/.test(param);

    const query = `
      SELECT 
        c.id,
        c.id AS category_id,
        c.name,
        c.name AS category_name,
        c.slug,
        c.description,
        c.image,
        c.status,
        c.created_at,
        c.updated_at,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE ${isNumeric ? 'c.id = $1' : 'c.slug = $1'}
      GROUP BY c.id, c.name, c.slug, c.description, c.image, c.status, c.created_at, c.updated_at;
    `;
    const [rows] = await db.query(query, [isNumeric ? parseInt(param, 10) : param]);

    if (rows.length === 0) {
      throw new ApiError(404, `Category '${param}' not found.`, 'CATEGORY_NOT_FOUND');
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

// POST /api/categories - Create new category (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { category_name, name, description, image } = req.body;
    const catName = category_name || name;

    if (!catName || catName.trim() === '') {
      throw new ApiError(400, 'Category name is required.', 'VALIDATION_ERROR');
    }

    // Check if category name already exists
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [catName.trim()]
    );
    if (existing.length > 0) {
      throw new ApiError(409, `Category '${catName}' already exists.`, 'CATEGORY_EXISTS');
    }

    const slug = catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [createdRows, meta] = await db.query(
      `INSERT INTO categories (name, slug, description, image, status) 
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [catName.trim(), slug, description || null, image || null]
    );

    const newId = createdRows[0]?.id || meta.insertId;

    const [created] = await db.query(
      `SELECT c.id, c.id AS category_id, c.name, c.name AS category_name, c.slug, c.description, c.image, c.status, c.created_at
       FROM categories c WHERE c.id = $1`,
      [newId]
    );

    return res.status(201).json({
      success: true,
      data: created[0] || createdRows[0],
      message: 'Category created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id - Update category (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, 'Invalid category ID parameter.', 'INVALID_ID');
    }

    const { category_name, name, description, image, status } = req.body;
    const catName = category_name || name;

    const [existing] = await db.query('SELECT id, name FROM categories WHERE id = $1', [categoryId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Category ID ${categoryId} not found.`, 'CATEGORY_NOT_FOUND');
    }

    // If changing name, check for uniqueness conflict
    if (catName && catName.trim().toLowerCase() !== existing[0].name.toLowerCase()) {
      const [duplicate] = await db.query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
        [catName.trim(), categoryId]
      );
      if (duplicate.length > 0) {
        throw new ApiError(409, `Category name '${catName}' is already taken.`, 'CATEGORY_NAME_TAKEN');
      }
    }

    await db.query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           image = COALESCE($3, image), 
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [catName ? catName.trim() : null, description !== undefined ? description : null, image || null, status || null, categoryId]
    );

    const [updated] = await db.query(
      `SELECT c.id, c.id AS category_id, c.name, c.name AS category_name, c.slug, c.description, c.image, c.status, c.created_at, c.updated_at
       FROM categories c WHERE c.id = $1`,
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

// DELETE /api/categories/:id - Delete category (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      throw new ApiError(400, 'Invalid category ID parameter.', 'INVALID_ID');
    }

    const [existing] = await db.query('SELECT id, name FROM categories WHERE id = $1', [categoryId]);
    if (existing.length === 0) {
      throw new ApiError(404, `Category with ID ${categoryId} not found.`, 'CATEGORY_NOT_FOUND');
    }

    // Integrity check: Prevent deletion if products reference this category
    const [productsCount] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [categoryId]
    );
    if (parseInt(productsCount[0]?.count || 0, 10) > 0) {
      throw new ApiError(
        409,
        `Cannot delete category '${existing[0].name}' because it contains ${productsCount[0].count} product(s). Remove or reassign the products first.`,
        'CATEGORY_HAS_PRODUCTS'
      );
    }

    await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);

    return res.status(200).json({
      success: true,
      data: { category_id: categoryId, id: categoryId },
      message: `Category '${existing[0].name}' deleted successfully.`
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
