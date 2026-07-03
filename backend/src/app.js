const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminProductRoutes = require('./routes/adminProducts');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminOrderRoutes = require('./routes/adminOrders');
const adminUserRoutes = require('./routes/adminUsers');
const adminCategoryRoutes = require('./routes/adminCategories');
const reviewRoutes = require('./routes/reviews');
const addressRoutes = require('./routes/addresses');
const visitorRoutes = require('./routes/visitors');
const { notFound, errorHandler } = require('./middleware/errors');
const { generalAuthLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security: HTTP Headers ───────────────────────────────────────────────────
// Helmet sets a suite of protective response headers:
//   X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
//   X-XSS-Protection, Content-Security-Policy, and more.
app.use(helmet());

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Guard: reject wildcard '*' in production — it would allow any site to call the API
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && allowedOrigins.includes('*')) {
  console.error('[SECURITY] CORS_ORIGIN is set to "*" in production — this is not allowed. Exiting.');
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── Body Parsing — with size limit to prevent payload bloat attacks ──────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ─── Cookie Parsing (required for httpOnly JWT session cookies) ───────────────
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Ethnivaa API Server is running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/visitors', visitorRoutes);

// ─── Admin Routes — rate-limited ──────────────────────────────────────────────
app.use('/api/admin/products', generalAuthLimiter, adminProductRoutes);
app.use('/api/admin/orders', generalAuthLimiter, adminOrderRoutes);
app.use('/api/admin/users', generalAuthLimiter, adminUserRoutes);
app.use('/api/admin/categories', generalAuthLimiter, adminCategoryRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
