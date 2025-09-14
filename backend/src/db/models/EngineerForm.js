module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EngineerForm', {
    engFormID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    engRootCause: DataTypes.STRING,
    engDisposition: DataTypes.STRING,
    engOwnerID: DataTypes.INTEGER,
    engDate: DataTypes.DATEONLY,
  }, { tableName: 'EngineerForm', timestamps: true });
};
