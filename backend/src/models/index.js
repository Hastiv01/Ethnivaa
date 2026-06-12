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

User.hasMany(Address, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Address.belongsTo(User);

User.hasMany(Cart, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Cart.belongsTo(User);

Cart.hasMany(CartItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CartItem.belongsTo(Cart);

Product.hasMany(CartItem, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
CartItem.belongsTo(Product);

Category.hasMany(Product, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Product.belongsTo(Category);

User.hasMany(Order, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Order.belongsTo(User);

Address.hasMany(Order, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Order.belongsTo(Address);

Order.hasMany(OrderItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product);

User.hasMany(Review, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Review.belongsTo(User);

Product.hasMany(Review, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Review.belongsTo(Product);

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
