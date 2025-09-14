module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PurchasingForm', {
    purFormID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    purDisposition: DataTypes.STRING,
    purAction: DataTypes.STRING,
    purOwnerID: DataTypes.INTEGER,
    purDate: DataTypes.DATEONLY,
  }, { tableName: 'PurchasingForm', timestamps: true });
};
