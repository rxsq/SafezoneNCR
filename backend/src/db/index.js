const { Sequelize } = require('sequelize');
const { DB_STORAGE, NODE_ENV } = require('../config/env');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_STORAGE,
  logging: NODE_ENV === 'development' ? console.log : false,
});

const models = require('./models')(sequelize);

module.exports = { sequelize, models };
