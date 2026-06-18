const express = require('express');
const { Review, Product, User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// POST /api/reviews — submit a review for a product
router.post('/', async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || rating == null) {
      return res.status(400).json({ message: 'productId and rating are required' });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existing = await Review.findOne({
      where: { userId: req.user.id, productId: Number(productId) },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      userId: req.user.id,
      productId: Number(productId),
      rating: ratingNum,
      comment: comment ? String(comment).trim() : null,
    });

    // Update product average rating
    const allReviews = await Review.findAll({ where: { productId: Number(productId) } });
    const avgRating = allReviews.reduce((s, r) => s + Number(r.rating), 0) / allReviews.length;
    await product.update({ rating: Number(avgRating.toFixed(1)), reviewsCount: allReviews.length });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'name'] }],
    });

    return res.status(201).json({ review: fullReview });
  } catch (error) {
    console.error('Review error:', error);
    return res.status(500).json({ message: 'Failed to submit review' });
  }
});

module.exports = router;
