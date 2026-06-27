const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const proxyquire = require('proxyquire').noCallThru();

process.env.JWT_SECRET = 'test-secret-key';

function createAppWithRoutes(routeModules) {
  const app = express();
  app.use(express.json());
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  if (routeModules.auth) {
    app.use('/api/auth', routeModules.auth);
  }
  if (routeModules.products) {
    app.use('/api/products', routeModules.products);
  }
  if (routeModules.adminProducts) {
    app.use('/api/admin/products', routeModules.adminProducts);
  }
  if (routeModules.cart) {
    app.use('/api/cart', routeModules.cart);
  }
  if (routeModules.orders) {
    app.use('/api/orders', routeModules.orders);
  }
  if (routeModules.adminOrders) {
    app.use('/api/admin/orders', routeModules.adminOrders);
  }

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

  return app;
}

test('health route works', async () => {
  const app = createAppWithRoutes({});
  const response = await request(app).get('/health');

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('auth register and login routes work with model stubs', async () => {
  const userStub = {
    findOne: async ({ where }) => {
      if (where.email === 'user@example.com') {
        return {
          id: 2,
          email: 'user@example.com',
          name: 'User',
          role: 'CUSTOMER',
          passwordHash: 'hashed-secret',
        };
      }

      return null;
    },
    create: async (payload) => ({ id: 2, ...payload }),
    findByPk: async () => ({ id: 2, email: 'user@example.com', name: 'User', role: 'CUSTOMER' }),
  };

  const signupChallengeStub = {
    findOne: async () => null,
    create: async (payload) => ({ id: 1, ...payload }),
  };

  const authRouter = proxyquire('../src/routes/auth', {
    '../models': { User: userStub, SignupChallenge: signupChallengeStub, PasswordResetChallenge: { findOne: async () => null, create: async () => null } },
    bcrypt: {
      hash: async () => 'hashed-secret',
      compare: async () => true,
    },
    '../services/email': {
      sendBrevoOtpEmail: async () => ({})
    },
    '../services/googleAuth': {
      verifyGoogleIdToken: async () => ({ sub: 'g-1', email: 'google@example.com', name: 'Google User' })
    },
  });

  const app = createAppWithRoutes({ auth: authRouter });

  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email: 'new@example.com', password: 'secret123' });

  assert.equal(registerResponse.statusCode, 201);
  assert.equal(registerResponse.body.user.email, 'new@example.com');
  assert.equal(typeof registerResponse.body.token, 'string');

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: 'secret123' });

  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.body.user.email, 'user@example.com');
});

test('email OTP signup flow starts, verifies, and completes', async () => {
  let storedChallenge = null;
  const signupChallengeStub = {
    findOne: async ({ where }) => {
      if (!storedChallenge || storedChallenge.email !== where.email) {
        return null;
      }
      return storedChallenge;
    },
    create: async (payload) => {
      storedChallenge = {
        id: 11,
        ...payload,
        verifiedAt: null,
        save: async () => storedChallenge,
        destroy: async () => { storedChallenge = null; },
      };
      return storedChallenge;
    },
    findByPk: async (id) => (storedChallenge && storedChallenge.id === id ? storedChallenge : null),
  };

  const userStub = {
    findOne: async () => null,
    create: async (payload) => ({ id: 22, ...payload }),
  };

  const authRouter = proxyquire('../src/routes/auth', {
    '../models': { User: userStub, SignupChallenge: signupChallengeStub, PasswordResetChallenge: { findOne: async () => null, create: async () => null } },
    bcrypt: {
      hash: async (value) => `hashed:${value}`,
      compare: async () => true,
    },
    'node:crypto': {
      randomInt: () => 123456,
    },
    '../services/email': {
      sendBrevoOtpEmail: async ({ otp }) => {
        assert.equal(otp, '123456');
      },
    },
    '../services/googleAuth': {
      verifyGoogleIdToken: async () => ({ sub: 'g-1', email: 'google@example.com', name: 'Google User' }),
    },
  });

  const app = createAppWithRoutes({ auth: authRouter });

  const startResponse = await request(app)
    .post('/api/auth/signup/start')
    .send({ name: 'New User', email: 'newuser@example.com' });

  assert.equal(startResponse.statusCode, 200);

  const verifyResponse = await request(app)
    .post('/api/auth/signup/verify')
    .send({ email: 'newuser@example.com', otp: '123456' });

  assert.equal(verifyResponse.statusCode, 200);
  assert.equal(typeof verifyResponse.body.signupToken, 'string');

  const completeResponse = await request(app)
    .post('/api/auth/signup/complete')
    .send({ signupToken: verifyResponse.body.signupToken, password: 'secret123' });

  assert.equal(completeResponse.statusCode, 201);
  assert.equal(completeResponse.body.user.email, 'newuser@example.com');
});

test('google sign-in returns a token and user payload', async () => {
  const userState = {
    user: null,
  };

  const userStub = {
    findOne: async () => null,
    findOrCreate: async ({ defaults }) => {
      userState.user = {
        id: 33,
        ...defaults,
        update: async (payload) => Object.assign(userState.user, payload),
      };
      return [userState.user, true];
    },
  };

  const authRouter = proxyquire('../src/routes/auth', {
    '../models': { User: userStub, SignupChallenge: { findOne: async () => null, create: async () => null }, PasswordResetChallenge: { findOne: async () => null, create: async () => null } },
    bcrypt: {
      hash: async (value) => `hashed:${value}`,
      compare: async () => true,
    },
    'node:crypto': {
      randomInt: () => 123456,
    },
    '../services/email': {
      sendBrevoOtpEmail: async () => ({}),
    },
    '../services/googleAuth': {
      verifyGoogleIdToken: async () => ({ sub: 'google-sub-1', email: 'google@example.com', name: 'Google User' }),
    },
  });

  const app = createAppWithRoutes({ auth: authRouter });
  const response = await request(app)
    .post('/api/auth/google')
    .send({ idToken: 'fake-google-id-token' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.email, 'google@example.com');
  assert.equal(typeof response.body.token, 'string');
});

test('public products route returns products', async () => {
  const productStub = {
    findAll: async () => [{ id: 1, title: 'Kurta' }],
    findByPk: async () => ({ id: 1, title: 'Kurta' }),
  };

  const categoryStub = {};

  const productsRouter = proxyquire('../src/routes/products', {
    '../models': { Product: productStub, Category: categoryStub },
  });

  const app = createAppWithRoutes({ products: productsRouter });
  const response = await request(app).get('/api/products');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.products.length, 1);
});

test('cart route adds an item', async () => {
  const state = { carts: [], items: [] };

  const cartStub = {
    findOrCreate: async ({ defaults }) => {
      const cart = { id: 1, ...defaults };
      state.carts.push(cart);
      return [cart, true];
    },
    findOne: async ({ where }) => {
      if (where.userId === 1 && where.status === 'ACTIVE') {
        return { id: 1, userId: 1, status: 'ACTIVE', update: async (payload) => Object.assign(this, payload) };
      }
      return null;
    },
  };

  const cartItemStub = {
    findOne: async () => null,
    create: async (payload) => {
      state.items.push(payload);
      return payload;
    },
    destroy: async () => null,
  };

  const productStub = {
    findByPk: async () => ({
      id: 7,
      price: '100.00',
      discountPrice: '80.00',
      Category: { id: 3, name: 'Men', slug: 'men' },
    }),
  };

  const categoryStub = {};

  const sequelizeStub = {
    transaction: async (callback) => callback({ LOCK: { UPDATE: 'UPDATE' } }),
  };

  const cartRouter = proxyquire('../src/routes/cart', {
    '../models': { sequelize: sequelizeStub, Cart: cartStub, CartItem: cartItemStub, Product: productStub, Category: categoryStub },
    '../middleware/auth': {
      authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'CUSTOMER' };
        next();
      },
    },
  });

  const app = createAppWithRoutes({ cart: cartRouter });
  const response = await request(app).post('/api/cart/items').send({ productId: 7, quantity: 2 });

  assert.equal(response.statusCode, 201);
  assert.equal(state.items[0].quantity, 2);
});

test('checkout creates an order from the cart', async () => {
  const cartState = {
    cart: { id: 1, userId: 1, status: 'ACTIVE', CartItems: [{ productId: 7, quantity: 2, unitPrice: '80.00' }], update: async (payload) => Object.assign(cartState.cart, payload) },
  };

  const orderState = { created: null, items: [] };

  const orderRouter = proxyquire('../src/routes/orders', {
    '../models': {
      sequelize: {
        transaction: async (callback) => callback({ LOCK: { UPDATE: 'UPDATE' } }),
      },
      Cart: {
        findOne: async () => cartState.cart,
      },
      CartItem: {
        destroy: async () => null,
      },
      Order: {
        create: async (payload) => {
          orderState.created = { id: 99, ...payload };
          return orderState.created;
        },
        findByPk: async () => ({
          id: 99,
          orderNumber: orderState.created.orderNumber,
          update: async (payload) => {
            Object.assign(orderState.created, payload);
          }
        }),
      },
      OrderItem: {
        create: async (payload) => {
          orderState.items.push(payload);
          return payload;
        },
        bulkCreate: async (payloads) => {
          orderState.items.push(...payloads);
          return payloads;
        },
      },
      Product: {},
      Address: {
        findOne: async () => ({ id: 5, userId: 1 }),
      },
      Category: {},
    },
    '../middleware/auth': {
      authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'CUSTOMER' };
        next();
      },
    },
    'razorpay': class {
      constructor() {
        this.orders = {
          create: async () => ({ id: 'rzp_order_123' })
        };
      }
    }
  });

  const app = createAppWithRoutes({ orders: orderRouter });
  const response = await request(app).post('/api/orders/checkout').send({ addressId: 5 });

  assert.equal(response.statusCode, 201);
  assert.equal(orderState.items.length, 1);
  assert.equal(orderState.created.total, 240);
});

test('admin route protects non-admin requests', async () => {
  const adminProductsRouter = proxyquire('../src/routes/adminProducts', {
    '../models': {
      Product: { findAll: async () => [] },
      Category: {},
    },
    '../middleware/auth': {
      authenticate: (req, res, next) => {
        req.user = { id: 1, role: 'CUSTOMER' };
        next();
      },
      requireRole: (...allowedRoles) => (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
        return next();
      },
    },
  });

  const app = createAppWithRoutes({ adminProducts: adminProductsRouter });
  const response = await request(app).get('/api/admin/products');

  assert.equal(response.statusCode, 403);
});