module.exports = (sequelize, DataTypes) => {
  const VisitorCount = sequelize.define('VisitorCount', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12480,
    },
  }, {
    tableName: 'visitor_counts',
    timestamps: true,
    paranoid: false,
    underscored: true,
  });

  return VisitorCount;
};
