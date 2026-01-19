const sequelize = require("../config/database");
const Sequelize = require("sequelize");
const Teacher = sequelize.define(
  "Teacher",
  {
    teacher_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teacher_name_eng: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: "Teacher name in English",
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
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
    tableName: "teachers",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Teacher;
