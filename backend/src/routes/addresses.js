const express = require('express');
const { Address } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id, isSaved: true },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ addresses });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load addresses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      label,
      recipientName,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!recipientName || !phone || !line1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: 'recipientName, phone, line1, city, state, and postalCode are required' });
    }

    const count = await Address.count({ where: { userId: req.user.id, isSaved: true } });
    if (count >= 5) {
      return res.status(400).json({ message: 'Maximum limit of 5 saved addresses reached. Please delete an existing address to add a new one.' });
    }

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const address = await Address.create({
      userId: req.user.id,
      label: label ?? 'Shipping Address',
      recipientName,
      phone,
      line1,
      line2: line2 ?? null,
      city,
      state,
      postalCode,
      country: country ?? 'India',
      isDefault: Boolean(isDefault),
    });

    return res.status(201).json({ address });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create address' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    await address.destroy();
    return res.json({ message: 'Address deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete address' });
  }
});

module.exports = router;

