const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const Class = sequelize.define(
  "Class",
  {
    class_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    class_code: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
    class_year: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: "e.g., 2024-2025",
    },
    schedule: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Class schedule information",
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "classes",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Class;
