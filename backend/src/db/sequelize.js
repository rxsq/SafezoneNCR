const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './data.sqlite',
  logging: false,
});

module.exports = sequelize;
