const express = require('express');
const { sequelize, Cart, CartItem, Order, OrderItem, Product, Address, Category } = require('../models');
const { authenticate } = require('../middleware/auth');
const { positiveInteger } = require('../middleware/validate');

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

/**
 * POST /api/orders/checkout
 * Accepts either:
 *   - { addressId: number }  — use an existing saved address
 *   - { address: { recipientName, phone, line1, line2?, city, state, postalCode, country? } }  — create inline
 * Both paths complete the order in a single request.
 */
router.post('/checkout', async (req, res) => {
  try {
    const { addressId: rawAddressId, address: inlineAddress } = req.body;
    const addressId = positiveInteger(rawAddressId);

    let address;

    if (addressId) {
      // Use existing address
      address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });
      if (!address) {
        return res.status(400).json({ message: 'Invalid addressId' });
      }
    } else if (inlineAddress && inlineAddress.recipientName && inlineAddress.line1) {
      // Create address inline — no extra round-trip needed from frontend
      address = await Address.create({
        userId: req.user.id,
        label: inlineAddress.label || 'Shipping Address',
        recipientName: inlineAddress.recipientName,
        phone: inlineAddress.phone || '',
        line1: inlineAddress.line1,
        line2: inlineAddress.line2 || null,
        city: inlineAddress.city || '',
        state: inlineAddress.state || '',
        postalCode: inlineAddress.postalCode || '',
        country: inlineAddress.country || 'India',
        isDefault: false,
      });
    } else {
      return res.status(400).json({ message: 'Either addressId or inline address fields are required' });
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

      // Bulk create order items for better performance
      await OrderItem.bulkCreate(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: toMoney(Number(item.unitPrice) * Number(item.quantity)),
        })),
        { transaction }
      );

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