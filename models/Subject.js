const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");
const Sequelize = require("sequelize");
const Subject = sequelize.define("Subject", {
    subject_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject_name: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    subject_code: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: "subjects",
    timestamps: true,
    underscored: true
},);

module.exports = Subject;
