module.exports = (sequelize, DataTypes) => {
  return sequelize.define('NCREmployee', {
    ncrEmpID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empID: DataTypes.INTEGER,
    ncrFormID: DataTypes.INTEGER,
  }, { tableName: 'NCR_Employee', timestamps: false });
};
