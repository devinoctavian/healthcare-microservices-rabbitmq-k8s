const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3311,
    dialect: "mysql",
    logging: false,
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Patient = require("./Patient")(sequelize, DataTypes);

module.exports = db;
