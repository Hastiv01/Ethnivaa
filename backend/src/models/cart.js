module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ORDERED', 'ABANDONED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  });

  return Cart;
};
