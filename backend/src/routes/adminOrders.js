const express = require('express');
const { Op } = require('sequelize');
const { sequelize, Order, OrderItem, Product, Category, User, Address } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

const orderItemInclude = [
  {
    model: Product,
    attributes: ['id', 'title', 'description', 'price', 'discountPrice', 'color', 'image', 'material'],
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug'],
      },
    ],
  },
];

// GET /api/admin/dashboard — real stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalOrders = await Order.count({ where: { paymentStatus: 'SUCCESS' } });
    const totalProducts = await Product.count();
    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });
    const lowStockCount = await Product.count({ where: { inventory: { [Op.lt]: 10 } } });

    const revenueResult = await Order.findOne({
      where: { paymentStatus: 'SUCCESS' },
      attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']],
      raw: true,
    });
    const totalRevenue = Number(revenueResult?.totalRevenue) || 0;

    const recentOrders = await Order.findAll({
      where: { paymentStatus: 'SUCCESS' },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Address, paranoid: false },
        { model: OrderItem, include: orderItemInclude },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return res.json({ totalOrders, totalProducts, totalCustomers, totalRevenue, lowStockCount, recentOrders });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { paymentStatus: 'SUCCESS' },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Address, paranoid: false },
        { model: OrderItem, include: orderItemInclude },
      ],
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
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Address, paranoid: false },
        { model: OrderItem, include: orderItemInclude },
      ],
    });

    return res.json({ order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order' });
  }
});

module.exports = router;