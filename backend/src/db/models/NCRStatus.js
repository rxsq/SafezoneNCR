module.exports = (sequelize, DataTypes) => {
  return sequelize.define('NCRStatus', {
    ncrStatusID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ncrStatusName: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'NCRStatus', timestamps: false });
};
