module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    prodID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prodName: DataTypes.STRING,
    prodCategory: DataTypes.STRING,
    supID: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'Product', timestamps: true });
};
