require("dotenv").config();

const Sequelize = require("sequelize");
const PORT = process.env.PORT || 3001;
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  },
);

// TEST connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Sequelize connected..");
    console.log(`Server is Running on http://localhost:${PORT}`);
  })
  .catch((err) => console.log("DB Error: ", err));

module.exports = sequelize;
