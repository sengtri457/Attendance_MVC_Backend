const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const Class = sequelize.define("Class", {
    class_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    class_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
    }
}, {
    tableName: "classes",
    timestamps: true,
    underscored: true
},);

module.exports = Class;
