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



module.exports = router;
