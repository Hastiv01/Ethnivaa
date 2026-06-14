const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminProductRoutes = require('./routes/adminProducts');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminOrderRoutes = require('./routes/adminOrders');
const addressRoutes = require('./routes/addresses');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

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

app.get('/health', (req, res) => res.json({status: 'ok'}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/addresses', addressRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
