const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  storage: "database.sqlite",
});

module.exports = sequelize;
