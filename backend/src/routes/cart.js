const express = require('express');
const { sequelize, Cart, CartItem, Product, Category } = require('../models');
const { authenticate } = require('../middleware/auth');
const { requireFields, positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

const cartItemInclude = [
  {
    model: Product,
    attributes: ['id', 'title', 'description', 'price', 'discountPrice', 'color', 'image', 'inventory'],
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug'],
      },
    ],
  },
];

function getActiveCartWhere(userId) {
  return {
    userId,
    status: 'ACTIVE',
  };
}

async function getOrCreateActiveCart(userId, transaction) {
  const [cart] = await Cart.findOrCreate({
    where: getActiveCartWhere(userId),
    defaults: { userId, status: 'ACTIVE' },
    transaction,
  });

  return cart;
}

function serializeCart(cart) {
  const items = cart?.CartItems ?? [];
  const normalizedItems = items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);
    return {
      id: item.id,
      quantity,
      unitPrice,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
      product: item.Product,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart?.id,
    status: cart?.status,
    items: normalizedItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

async function fetchCart(userId) {
  return Cart.findOne({
    where: getActiveCartWhere(userId),
    include: [{ model: CartItem, include: cartItemInclude }],
  });
}

router.get('/', async (req, res) => {
  try {
    const cart = await fetchCart(req.user.id);
    return res.json({ cart: serializeCart(cart) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load cart' });
  }
});

router.post('/items', requireFields(['productId']), async (req, res) => {
  try {
    const productId = positiveInteger(req.body.productId);
    const quantity = positiveInteger(req.body.quantity ?? 1);

    if (!productId) {
      return res.status(400).json({ message: 'productId must be a positive integer' });
    }

    if (!quantity) {
      return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    const product = await Product.findByPk(productId, {
      include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const unitPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);

    let cartId;
    await sequelize.transaction(async (transaction) => {
      const cart = await getOrCreateActiveCart(req.user.id, transaction);
      cartId = cart.id;
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId: product.id },
        transaction,
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.unitPrice = unitPrice;
        await existingItem.save({ transaction });
      } else {
        await CartItem.create(
          {
            cartId: cart.id,
            productId: product.id,
            quantity,
            unitPrice,
          },
          { transaction }
        );
      }
    });

    // Single fetch after transaction (instead of fetching inside + outside)
    const updatedCart = await fetchCart(req.user.id);
    return res.status(201).json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

router.patch('/items/:itemId', async (req, res) => {
  try {
    const itemId = positiveInteger(req.params.itemId);
    const quantity = positiveInteger(req.body.quantity);

    if (!itemId) {
      return res.status(400).json({ message: 'itemId must be a positive integer' });
    }

    if (!quantity) {
      return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    const cart = await Cart.findOne({ where: getActiveCartWhere(req.user.id) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    item.quantity = quantity;
    await item.save();

    const refreshedCart = await fetchCart(req.user.id);
    return res.json({ cart: serializeCart(refreshedCart) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update cart item' });
  }
});

router.delete('/items/:itemId', async (req, res) => {
  try {
    const itemId = positiveInteger(req.params.itemId);

    if (!itemId) {
      return res.status(400).json({ message: 'itemId must be a positive integer' });
    }

    const cart = await Cart.findOne({ where: getActiveCartWhere(req.user.id) });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await item.destroy();

    const updatedCart = await fetchCart(req.user.id);
    return res.json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove cart item' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: getActiveCartWhere(req.user.id) });
    if (!cart) {
      return res.json({ message: 'Cart already empty' });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    return res.json({ message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;