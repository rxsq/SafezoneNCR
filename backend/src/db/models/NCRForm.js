module.exports = (sequelize, DataTypes) => {
  return sequelize.define('NCRForm', {
    ncrFormID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ncrFormNo: DataTypes.STRING,
    ncrIssueDate: DataTypes.DATEONLY,
    prodID: DataTypes.INTEGER,
    qualFormID: DataTypes.INTEGER,
    engFormID: DataTypes.INTEGER,
    purFormID: DataTypes.INTEGER,
    ncrStage: DataTypes.STRING, // 'QUA','ENG','PUR','ARC'
    ncrStatusID: DataTypes.INTEGER, // 1=open, 2=closed
  }, { tableName: 'NCRForm', timestamps: true });
};
