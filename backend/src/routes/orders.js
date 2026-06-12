const express = require('express');
const { sequelize, Cart, CartItem, Order, OrderItem, Product, Address, Category } = require('../models');
const { authenticate } = require('../middleware/auth');
const { requireFields, positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

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

function toMoney(value) {
  return Number(Number(value).toFixed(2));
}

function buildOrderNumber(userId) {
  return `ORD-${Date.now()}-${userId}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  return {
    subtotal: toMoney(subtotal),
    shippingCost: 0,
    discountTotal: 0,
    total: toMoney(subtotal),
  };
}

router.get('/me', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Address },
        {
          model: OrderItem,
          include: orderItemInclude,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.post('/checkout', requireFields(['addressId']), async (req, res) => {
  try {
    const addressId = positiveInteger(req.body.addressId);

    if (!addressId) {
      return res.status(400).json({ message: 'addressId must be a positive integer' });
    }

    const address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });
    if (!address) {
      return res.status(400).json({ message: 'Invalid addressId' });
    }

    const result = await sequelize.transaction(async (transaction) => {
      const cart = await Cart.findOne({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: [{ model: CartItem, include: orderItemInclude }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const items = cart?.CartItems ?? [];
      if (items.length === 0) {
        const error = new Error('Cart is empty');
        error.statusCode = 400;
        throw error;
      }

      const totals = calculateTotals(items);
      const order = await Order.create(
        {
          userId: req.user.id,
          addressId: address.id,
          orderNumber: buildOrderNumber(req.user.id),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          ...totals,
        },
        { transaction }
      );

      for (const item of items) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: toMoney(Number(item.unitPrice) * Number(item.quantity)),
          },
          { transaction }
        );
      }

      await CartItem.destroy({ where: { cartId: cart.id }, transaction });
      await cart.update({ status: 'ORDERED' }, { transaction });

      return Order.findByPk(order.id, {
        include: [Address, { model: OrderItem, include: orderItemInclude }],
        transaction,
      });
    });

    return res.status(201).json({ order: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message || 'Failed to create order' });
  }
});

module.exports = router;