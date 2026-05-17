const Sequelize = require("sequelize");
require("dotenv").config();
const db = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
pool: {
  max: 100,
  min: 0,
  acquire: 300000, // Increase to 5 minutes
  idle: 30000, // Increase idle timeout
},
});

module.exports = db;

