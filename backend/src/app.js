const express = require('express');
const cors = require('cors');
const compression = require('compression');
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

const app = express();

app.use(compression());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Ethnivaa API Server is running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/visitors', visitorRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
