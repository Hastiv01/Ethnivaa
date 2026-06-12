module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authProvider: {
      type: DataTypes.ENUM('EMAIL', 'GOOGLE'),
      allowNull: false,
      defaultValue: 'EMAIL',
    },
    googleSub: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'CUSTOMER'),
      allowNull: false,
      defaultValue: 'CUSTOMER',
    },
  });

  return User;
};
