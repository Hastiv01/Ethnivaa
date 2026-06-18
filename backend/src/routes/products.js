const express = require('express');
const { Product, Category, Review, User } = require('../models');

const router = express.Router();

const productInclude = [
  {
    model: Category,
    attributes: ['id', 'name', 'slug'],
  },
];

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: productInclude,
      order: [['createdAt', 'DESC']],
    });

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load products' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        ...productInclude,
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load product' });
  }
});

module.exports = router;