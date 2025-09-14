const Employee = require('./Employee');
const Position = require('./Position');
const Supplier = require('./Supplier');
const Product = require('./Product');
const NCRStatus = require('./NCRStatus');
const NCRForm = require('./NCRForm');
const QualityForm = require('./QualityForm');
const EngineerForm = require('./EngineerForm');
const PurchasingForm = require('./PurchasingForm');
const NCREmployee = require('./NCREmployee');

module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const PositionModel = Position(sequelize, DataTypes);
  const EmployeeModel = Employee(sequelize, DataTypes);
  const SupplierModel = Supplier(sequelize, DataTypes);
  const ProductModel = Product(sequelize, DataTypes);
  const NCRStatusModel = NCRStatus(sequelize, DataTypes);
  const QualityFormModel = QualityForm(sequelize, DataTypes);
  const EngineerFormModel = EngineerForm(sequelize, DataTypes);
  const PurchasingFormModel = PurchasingForm(sequelize, DataTypes);
  const NCRFormModel = NCRForm(sequelize, DataTypes);
  const NCREmployeeModel = NCREmployee(sequelize, DataTypes);

  // Associations
  PositionModel.hasMany(EmployeeModel, { foreignKey: 'posID' });
  EmployeeModel.belongsTo(PositionModel, { foreignKey: 'posID' });

  SupplierModel.hasMany(ProductModel, { foreignKey: 'supID' });
  ProductModel.belongsTo(SupplierModel, { foreignKey: 'supID' });

  NCRStatusModel.hasMany(NCRFormModel, { foreignKey: 'ncrStatusID' });
  NCRFormModel.belongsTo(NCRStatusModel, { foreignKey: 'ncrStatusID' });

  ProductModel.hasMany(NCRFormModel, { foreignKey: 'prodID' });
  NCRFormModel.belongsTo(ProductModel, { foreignKey: 'prodID' });

  QualityFormModel.hasOne(NCRFormModel, { foreignKey: 'qualFormID', sourceKey: 'qualFormID' });
  NCRFormModel.belongsTo(QualityFormModel, { foreignKey: 'qualFormID', targetKey: 'qualFormID' });

  EngineerFormModel.hasOne(NCRFormModel, { foreignKey: 'engFormID', sourceKey: 'engFormID' });
  NCRFormModel.belongsTo(EngineerFormModel, { foreignKey: 'engFormID', targetKey: 'engFormID' });

  PurchasingFormModel.hasOne(NCRFormModel, { foreignKey: 'purFormID', sourceKey: 'purFormID' });
  NCRFormModel.belongsTo(PurchasingFormModel, { foreignKey: 'purFormID', targetKey: 'purFormID' });

  NCRFormModel.belongsToMany(EmployeeModel, { through: NCREmployeeModel, foreignKey: 'ncrFormID', otherKey: 'empID' });
  EmployeeModel.belongsToMany(NCRFormModel, { through: NCREmployeeModel, foreignKey: 'empID', otherKey: 'ncrFormID' });

  return {
    Position: PositionModel,
    Employee: EmployeeModel,
    Supplier: SupplierModel,
    Product: ProductModel,
    NCRStatus: NCRStatusModel,
    QualityForm: QualityFormModel,
    EngineerForm: EngineerFormModel,
    PurchasingForm: PurchasingFormModel,
    NCRForm: NCRFormModel,
    NCREmployee: NCREmployeeModel,
  };
};
