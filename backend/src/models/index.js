const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFactory = require('./user');
const CategoryFactory = require('./category');
const ProductFactory = require('./product');
const CartFactory = require('./cart');
const CartItemFactory = require('./cartItem');
const OrderFactory = require('./order');
const OrderItemFactory = require('./orderItem');
const ReviewFactory = require('./review');
const AddressFactory = require('./address');
const SignupChallengeFactory = require('./signupChallenge');

const User = UserFactory(sequelize, DataTypes);
const Category = CategoryFactory(sequelize, DataTypes);
const Product = ProductFactory(sequelize, DataTypes);
const Cart = CartFactory(sequelize, DataTypes);
const CartItem = CartItemFactory(sequelize, DataTypes);
const Order = OrderFactory(sequelize, DataTypes);
const OrderItem = OrderItemFactory(sequelize, DataTypes);
const Review = ReviewFactory(sequelize, DataTypes);
const Address = AddressFactory(sequelize, DataTypes);
const SignupChallenge = SignupChallengeFactory(sequelize, DataTypes);

User.hasMany(Address, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Address.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

User.hasMany(Cart, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Cart.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

Cart.hasMany(CartItem, { foreignKey: { name: 'cartId', allowNull: false }, onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: { name: 'cartId', allowNull: false } });

Product.hasMany(CartItem, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'RESTRICT' });
CartItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false } });

Category.hasMany(Product, { foreignKey: { name: 'categoryId', allowNull: false }, onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: { name: 'categoryId', allowNull: false } });

User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

Address.hasMany(Order, { foreignKey: { name: 'addressId', allowNull: false }, onDelete: 'RESTRICT' });
Order.belongsTo(Address, { foreignKey: { name: 'addressId', allowNull: false } });

Order.hasMany(OrderItem, { foreignKey: { name: 'orderId', allowNull: false }, onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false } });

Product.hasMany(OrderItem, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false } });

User.hasMany(Review, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Review.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

Product.hasMany(Review, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false } });

module.exports = {
  sequelize,
  User,
  SignupChallenge,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Address,
};
