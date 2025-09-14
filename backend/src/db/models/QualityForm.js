module.exports = (sequelize, DataTypes) => {
  return sequelize.define('QualityForm', {
    qualFormID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    qualItemDesc: DataTypes.STRING,
    qualIssueDesc: DataTypes.STRING,
    qualItemID: DataTypes.INTEGER,
    qualSalesOrderNo: DataTypes.INTEGER,
    qualQtyReceived: DataTypes.INTEGER,
    qualQtyDefective: DataTypes.INTEGER,
    qualItemNonConforming: DataTypes.INTEGER,
    qualRepID: DataTypes.INTEGER,
    qualDate: DataTypes.DATEONLY,
  }, { tableName: 'QualityForm', timestamps: true });
};
