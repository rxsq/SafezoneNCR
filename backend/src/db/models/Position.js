module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Position', {
    posID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    posDescription: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'Position', timestamps: false });
};
