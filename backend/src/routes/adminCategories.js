const express = require('express');
const { Category, Product } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/admin/categories — list all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    // Add product count for each category
    const withCounts = await Promise.all(
      categories.map(async (c) => {
        const productCount = await Product.count({ where: { CategoryId: c.id } });
        return { ...c.toJSON(), productCount };
      })
    );

    return res.json({ categories: withCounts });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load categories' });
  }
});

// POST /api/admin/categories — create a new category
router.post('/', async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'name and slug are required' });
    }

    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'A category with this slug already exists' });
    }

    const category = await Category.create({ name: String(name).trim(), slug: String(slug).trim().toLowerCase() });
    return res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
});

// DELETE /api/admin/categories/:id — delete category (only if no products)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productCount = await Product.count({ where: { CategoryId: category.id } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category — it has ${productCount} product(s). Move or delete products first.`,
      });
    }

    await category.destroy();
    return res.json({ message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category' });
  }
});

module.exports = router;
