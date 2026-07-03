module.exports = (sequelize, DataTypes) => {
  const SignupChallenge = sequelize.define('SignupChallenge', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    otpAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  return SignupChallenge;
};