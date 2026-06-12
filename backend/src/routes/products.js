const express = require('express');
const { Product, Category } = require('../models');

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

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: productInclude,
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