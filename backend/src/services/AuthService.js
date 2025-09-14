const jwt = require('jsonwebtoken');
const { models } = require('../db');
const { JWT_SECRET, JWT_EXPIRES_SEC } = require('../config/env');

class AuthService {
  async login({ usernameOrEmail, password }) {
    const where = usernameOrEmail.includes('@')
      ? { empEmail: usernameOrEmail }
      : { empUsername: usernameOrEmail };

    const user = await models.Employee.findOne({ where });
    if (!user) return null;

    const ok = await user.verifyPassword(password);
    if (!ok) return null;

    const token = jwt.sign({ empID: user.empID }, JWT_SECRET, { expiresIn: JWT_EXPIRES_SEC });
    const safeUser = user.toJSON();
    delete safeUser.empPassword;
    return { token, user: safeUser };
  }
}
module.exports = new AuthService();
