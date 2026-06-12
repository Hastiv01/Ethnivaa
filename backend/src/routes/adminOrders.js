const express = require('express');
const { Order, OrderItem, Product, Category } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

const orderItemInclude = [
  {
    model: Product,
    attributes: ['id', 'title', 'description', 'price', 'discountPrice', 'color', 'image'],
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug'],
      },
    ],
  },
];

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, include: orderItemInclude }],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const orderId = positiveInteger(req.params.id);
    const { status, paymentStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'id must be a positive integer' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates = {};
    if (status) {
      updates.status = status;
    }
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    await order.update(updates);

    const updatedOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: orderItemInclude }],
    });

    return res.json({ order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order' });
  }
});

module.exports = router;