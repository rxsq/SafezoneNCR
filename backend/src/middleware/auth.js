const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_COOKIE_NAME } = require('../config/env');
const { models } = require('../db');

module.exports = async (req, res, next) => {
  try {
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/,'');
    const token = req.cookies[JWT_COOKIE_NAME] || bearer;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await models.Employee.findByPk(payload.empID, {
      attributes: { exclude: ['empPassword'] },
      include: [{ model: models.Position, attributes: ['posDescription'] }],
    });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
