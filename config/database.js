require("dotenv").config();

const Sequelize = require("sequelize");
const PORT = process.env.PORT || 24491;
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 24491, // Add this line
    dialect: "mysql",
    logging: console.log, // Enable logging to see connection details
    dialectOptions: {
        charset: 'utf8mb4',
        connectTimeout: 60000 // Increase timeout to 60 seconds
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    },
    pool: { // Add connection pooling
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});


// TEST connection
sequelize.authenticate().then(() => {
    console.log("Sequelize connected..");
    console.log(`Server is Running on http://localhost:${PORT}`);
}).catch((err) => console.log("DB Error: ", err));

module.exports = sequelize;
