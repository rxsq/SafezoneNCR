module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Supplier', {
    supID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    supName: DataTypes.STRING,
    supContactName: DataTypes.STRING,
    supContactEmail: DataTypes.STRING,
    supContactPhone: DataTypes.STRING,
    supAddress: DataTypes.STRING,
    supCity: DataTypes.STRING,
    supCountry: DataTypes.STRING,
  }, { tableName: 'Supplier', timestamps: true });
};
