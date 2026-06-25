module.exports = (sequelize, DataTypes) => {
  const PasswordResetChallenge = sequelize.define('PasswordResetChallenge', {
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
    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return PasswordResetChallenge;
};
