// db/models.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

// Primitive helper to keep your numeric PKs
const pkInt = (name) => ({
  [name]: { type: DataTypes.INTEGER, primaryKey: true },
});

// ---- Core ----
const Employee = sequelize.define(
  "Employee",
  {
    ...pkInt("empID"),
    empFirst: DataTypes.STRING,
    empLast: DataTypes.STRING,
    empEmail: DataTypes.STRING,
    empPhone: DataTypes.STRING,
    empUsername: DataTypes.STRING,
    empPassword: DataTypes.STRING,
    posID: DataTypes.INTEGER,
  },
  { tableName: "Employee", timestamps: false }
);

const EmployeePosition = sequelize.define(
  "EmployeePosition",
  {
    ...pkInt("posID"),
    posDescription: DataTypes.STRING,
  },
  { tableName: "EmployeePosition", timestamps: false }
);

const Supplier = sequelize.define(
  "Supplier",
  {
    ...pkInt("supID"),
    supContactName: DataTypes.STRING,
    supContactEmail: DataTypes.STRING,
    supContactPhone: DataTypes.STRING,
    supName: DataTypes.STRING,
    supAddress: DataTypes.STRING,
    supCity: DataTypes.STRING,
    supCountry: DataTypes.STRING,
  },
  { tableName: "Supplier", timestamps: false }
);

const Product = sequelize.define(
  "Product",
  {
    ...pkInt("prodID"),
    prodName: DataTypes.STRING,
    prodCategory: DataTypes.STRING,
    supID: DataTypes.INTEGER,
  },
  { tableName: "Product", timestamps: false }
);

const NcrStatus = sequelize.define(
  "NCR_Status",
  {
    ...pkInt("ncrStatusID"),
    ncrStatus: DataTypes.STRING,
  },
  { tableName: "NCR_Status", timestamps: false }
);

// ---- Forms ----
const NcrQualityForm = sequelize.define(
  "NCR_Quality_Form",
  {
    ...pkInt("qualFormID"),
    NCR_Quality_Formcol: DataTypes.STRING, // keep exactly as in schema (odd name but present)
    qualIssueDesc: DataTypes.STRING,
    qualItemID: DataTypes.INTEGER,
    qualImageFileName: DataTypes.STRING,
    qualSalesOrderNo: DataTypes.INTEGER,
    qualQtyReceived: DataTypes.INTEGER,
    qualQtyDefective: DataTypes.INTEGER,
    qualItemNonConforming: DataTypes.INTEGER,
    qualRepID: DataTypes.INTEGER,
    qualDate: DataTypes.STRING,
    qualFormSupplierProcess: DataTypes.STRING,
    qualFormProductionProcess: DataTypes.STRING,
    qualItemDesc: DataTypes.STRING,
  },
  { tableName: "NCR_Quality_Form", timestamps: false }
);

const NcrEngineerForm = sequelize.define(
  "NCR_Engineer_Form",
  {
    ...pkInt("engFormID"),
    engReview: DataTypes.STRING,
    engCustNotification: DataTypes.STRING,
    engDispositionDesc: DataTypes.STRING,
    engDrawingUpdate: DataTypes.STRING,
    engRevisionNo: DataTypes.STRING,
    engUpdatedRevisionNo: DataTypes.STRING,
    engID: DataTypes.INTEGER,
    engDate: DataTypes.STRING,
    engUpdatedRevisionDate: DataTypes.STRING,
  },
  { tableName: "NCR_Engineer_Form", timestamps: false }
);

const NcrPurchasingForm = sequelize.define(
  "NCR_Purchasing_Form",
  {
    ...pkInt("purFormID"),
    purDescription: DataTypes.STRING,
    purCarRaised: DataTypes.STRING,
    purCarNo: DataTypes.STRING,
    purFollowUpReq: DataTypes.STRING,
    purFollowUpType: DataTypes.STRING,
    purFollowUpDate: DataTypes.STRING,
    purInspectorID: DataTypes.INTEGER,
    purNCRClosingDate: DataTypes.STRING,
  },
  { tableName: "NCR_Purchasing_Form", timestamps: false }
);

const NcrForm = sequelize.define(
  "NCR_Form",
  {
    ...pkInt("ncrFormID"),
    ncrFormNo: DataTypes.STRING,
    qualFormID: DataTypes.INTEGER,
    engFormID: DataTypes.INTEGER,
    purFormID: DataTypes.INTEGER,
    prodID: DataTypes.INTEGER,
    ncrStatusID: DataTypes.INTEGER,
    ncrIssueDate: DataTypes.STRING,
    ncrStage: DataTypes.STRING,
  },
  { tableName: "NCR_Form", timestamps: false }
);

// Junction: who’s attached to a form
const NcrEmployee = sequelize.define(
  "NCR_Employee",
  {
    ...pkInt("ncrEmpID"),
    empID: DataTypes.INTEGER,
    ncrFormID: DataTypes.INTEGER,
  },
  { tableName: "NCR_Employee", timestamps: false }
);

// Notifications
const Notification = sequelize.define(
  "Notifications",
  {
    ...pkInt("id"),
    ncrFormID: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    message: DataTypes.STRING,
    status: DataTypes.STRING, // 'unread' | 'read'
    created_at: DataTypes.STRING,
  },
  { tableName: "Notifications", timestamps: false }
);

// ---- Associations (based on your FKs) ----
// Employee → Position
Employee.belongsTo(EmployeePosition, {
  foreignKey: "posID",
  targetKey: "posID",
});

// Product → Supplier
Product.belongsTo(Supplier, { foreignKey: "supID", targetKey: "supID" });

// NCR_Form → Product / Status / Quality / Engineer / Purchasing
NcrForm.belongsTo(Product, { foreignKey: "prodID", targetKey: "prodID" });
NcrForm.belongsTo(NcrStatus, {
  foreignKey: "ncrStatusID",
  targetKey: "ncrStatusID",
});
NcrForm.belongsTo(NcrQualityForm, {
  foreignKey: "qualFormID",
  targetKey: "qualFormID",
});
NcrForm.belongsTo(NcrEngineerForm, {
  foreignKey: "engFormID",
  targetKey: "engFormID",
});
NcrForm.belongsTo(NcrPurchasingForm, {
  foreignKey: "purFormID",
  targetKey: "purFormID",
});

// NCR_Employee → Employee / NCR_Form
NcrEmployee.belongsTo(Employee, { foreignKey: "empID", targetKey: "empID" });
NcrEmployee.belongsTo(NcrForm, {
  foreignKey: "ncrFormID",
  targetKey: "ncrFormID",
});

// Notifications → NCR_Form (and optionally Employee via user_id if you want)
Notification.belongsTo(NcrForm, {
  foreignKey: "ncrFormID",
  targetKey: "ncrFormID",
});

module.exports = {
  sequelize,
  Employee,
  EmployeePosition,
  Supplier,
  Product,
  NcrStatus,
  NcrQualityForm,
  NcrEngineerForm,
  NcrPurchasingForm,
  NcrForm,
  NcrEmployee,
  Notification,
};
