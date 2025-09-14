const bcrypt = require('bcrypt');
const ROUNDS = 10;
const isBcrypt = (v) => typeof v === 'string' && v.startsWith('$2');

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    empID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empFirst: DataTypes.STRING,
    empLast: DataTypes.STRING,
    empEmail: { type: DataTypes.STRING, unique: true },
    empPhone: DataTypes.STRING,
    empUsername: { type: DataTypes.STRING, unique: true },
    empPassword: DataTypes.STRING, // bcrypt hash
    posID: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'Employee', timestamps: true });

  async function ensureHash(emp) {
    if (emp.empPassword && !isBcrypt(emp.empPassword)) {
      emp.empPassword = await bcrypt.hash(emp.empPassword, ROUNDS);
    }
  }
  Employee.beforeCreate(ensureHash);
  Employee.beforeUpdate(async (emp) => {
    if (emp.changed('empPassword')) await ensureHash(emp);
  });

  Employee.prototype.verifyPassword = function (plain) {
    return bcrypt.compare(plain, this.empPassword);
  };

  return Employee;
};
