const express = require('express');
const { User, Order } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { positiveInteger } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/admin/users — list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'authProvider', 'emailVerifiedAt', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    // Count orders per user
    const usersWithOrderCount = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.count({ where: { userId: u.id } });
        return { ...u.toJSON(), orderCount };
      })
    );

    return res.json({ users: usersWithOrderCount });
  } catch (error) {
    console.error('Failed to load users:', error);
    return res.status(500).json({ message: 'Failed to load users' });
  }
});

// PATCH /api/admin/users/:id/role — change user role
router.patch('/:id/role', async (req, res) => {
  try {
    const userId = positiveInteger(req.params.id);
    const { role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'id must be a positive integer' });
    }

    const validRoles = ['CUSTOMER', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${validRoles.join(', ')}` });
    }

    // Prevent admin from demoting themselves
    if (Number(userId) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return res.status(500).json({ message: 'Failed to update user role' });
  }
});

module.exports = router;
