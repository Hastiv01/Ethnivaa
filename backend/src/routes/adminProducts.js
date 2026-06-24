const express = require('express');
const { Product } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));



router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load products' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      color,
      image,

      originalPrice,
      images,
      isBestSeller,
      isNewArrival,
      rating,
      reviewsCount,
    } = req.body;

    if (!title || !description || price == null) {
      return res.status(400).json({ message: 'title, description, and price are required' });
    }

    const product = await Product.create({
      title,
      description,
      price,
      discountPrice: discountPrice ?? null,
      color: color ?? null,
      image: image ?? (images && images.length > 0 ? images[0] : null),

      isBestSeller: isBestSeller ?? false,
      isNewArrival: isNewArrival ?? false,
      rating: rating ?? 5.0,
      reviewsCount: reviewsCount ?? 0,
    });

    const createdProduct = await Product.findByPk(product.id);

    return res.status(201).json({ product: createdProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      title,
      description,
      price,
      discountPrice,
      color,
      image,

      originalPrice,
      images,
      isBestSeller,
      isNewArrival,
      rating,
      reviewsCount,
    } = req.body;



    await product.update({
      title: title ?? product.title,
      description: description ?? product.description,
      price: price ?? product.price,
      discountPrice: discountPrice ?? product.discountPrice,
      color: color ?? product.color,
      image: image ?? (images && images.length > 0 ? images[0] : product.image),

      isBestSeller: isBestSeller ?? product.isBestSeller,
      isNewArrival: isNewArrival ?? product.isNewArrival,
      rating: rating ?? product.rating,
      reviewsCount: reviewsCount ?? product.reviewsCount,
    });

    const updatedProduct = await Product.findByPk(product.id);

    return res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    return res.json({ message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;