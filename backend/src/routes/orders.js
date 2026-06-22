const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { sequelize, Cart, CartItem, Order, OrderItem, Product, Address, Category } = require('../models');
const { authenticate } = require('../middleware/auth');
const { positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

// ─── Razorpay Client ────────────────────────────────────────────────────────
// Switch test → live by changing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function toMoney(value) {
  return Number(Number(value).toFixed(2));
}

function buildOrderNumber(userId) {
  return `ORD-${Date.now()}-${userId}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
  // Mirror the frontend rule: free shipping over ₹5,000; ₹150 otherwise
  const shippingCost = subtotal === 0 ? 0 : subtotal > 5000 ? 0 : 150;
  return {
    subtotal: toMoney(subtotal),
    shippingCost: toMoney(shippingCost),
    discountTotal: 0,
    total: toMoney(subtotal + shippingCost),
  };
}

// ─── GET /api/orders/me ──────────────────────────────────────────────────────
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
 *
 * Two-step payment flow:
 *   1. Creates a DB order (status=PENDING, paymentStatus=PENDING)
 *   2. Creates a Razorpay Order via the SDK
 *   3. Returns both so the frontend can open the Razorpay checkout popup
 *
 * Accepts either:
 *   - { addressId: number }            — existing saved address
 *   - { address: { recipientName, phone, line1, city, state, postalCode } }  — inline
 */
router.post('/checkout', async (req, res) => {
  try {
    const { addressId: rawAddressId, address: inlineAddress, paymentMethod } = req.body;
    const addressId = positiveInteger(rawAddressId);

    // ── 1. Resolve shipping address ──────────────────────────────────────────
    let address;
    if (addressId) {
      address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });
      if (!address) {
        return res.status(400).json({ message: 'Invalid addressId' });
      }
    } else if (inlineAddress && inlineAddress.recipientName && inlineAddress.line1) {
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

    // ── 2. Create DB order inside a transaction ───────────────────────────────
    const dbOrder = await sequelize.transaction(async (transaction) => {
      const cart = await Cart.findOne({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: [{ model: CartItem, include: orderItemInclude }],
        transaction,
        // Lock only the Cart row (not the joined tables) — avoids PostgreSQL
        // "FOR UPDATE cannot be applied to the nullable side of an outer join"
        lock: { level: transaction.LOCK.UPDATE, of: Cart },
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
          paymentMethod: paymentMethod || null,
          ...totals,
        },
        { transaction }
      );

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

    // ── 3. Create Razorpay Order (outside DB transaction — external API call) ─
    const amountInPaise = Math.round(Number(dbOrder.total) * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: dbOrder.orderNumber,
      notes: {
        dbOrderId: String(dbOrder.id),
        userId: String(req.user.id),
      },
    });

    // Store Razorpay Order ID on our DB order for later signature verification
    await dbOrder.update({ razorpayOrderId: razorpayOrder.id });

    // ── 4. Return everything the frontend needs to open Razorpay Checkout ─────
    return res.status(201).json({
      order: dbOrder,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message || 'Failed to create order' });
  }
});

/**
 * PATCH /api/orders/:id/confirm-payment
 *
 * Called by the frontend after Razorpay payment succeeds.
 * Verifies the HMAC-SHA256 signature using the Razorpay key secret.
 * Only marks order SUCCESS if the signature is authentic.
 *
 * Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }
 */
router.patch('/:id/confirm-payment', async (req, res) => {
  try {
    const orderId = positiveInteger(req.params.id);
    if (!orderId) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        message: 'Missing Razorpay verification fields: razorpayPaymentId, razorpayOrderId, razorpaySignature',
      });
    }

    // ── 1. Load order and verify ownership ────────────────────────────────────
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'SUCCESS') {
      // Idempotent — already confirmed, return the updated order
      const confirmed = await Order.findByPk(order.id, {
        include: [Address, { model: OrderItem, include: orderItemInclude }],
      });
      return res.json({ order: confirmed });
    }

    if (order.paymentStatus === 'FAILED') {
      return res.status(400).json({ message: 'Cannot confirm a failed payment' });
    }

    // ── 2. Verify HMAC-SHA256 signature ───────────────────────────────────────
    // Razorpay signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('--- RAZORPAY SIGNATURE MISMATCH ---');
      console.error(`Expected: ${expectedSignature}`);
      console.error(`Received: ${razorpaySignature}`);
      console.error(`RAZORPAY_KEY_SECRET Configured: ${process.env.RAZORPAY_KEY_SECRET ? 'YES' : 'NO'}`);
      console.error(`RAZORPAY_KEY_SECRET Length: ${process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : 0}`);
      
      // Signature mismatch — potential tampering attempt
      await order.update({ paymentStatus: 'FAILED' });
      return res.status(400).json({
        message: 'Payment verification failed: signature mismatch. Contact support if you believe this is an error.',
      });
    }

    // ── 3. Signature valid — confirm the order ────────────────────────────────
    await order.update({
      paymentStatus: 'SUCCESS',
      status: 'CONFIRMED',
      razorpayPaymentId,
    });

    const confirmed = await Order.findByPk(order.id, {
      include: [Address, { model: OrderItem, include: orderItemInclude }],
    });

    return res.json({ order: confirmed });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to confirm payment' });
  }
});

module.exports = router;