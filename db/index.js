const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./app.db",
  logging: false,
});

module.exports = { sequelize };
