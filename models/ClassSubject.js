const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const ClassSubject = sequelize.define(
  "ClassSubject",
  {
    class_subject_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "classes",
        key: "class_id",
      },
    },
    subject_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "subjects",
        key: "subject_id",
      },
    },
    teacher_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "teachers",
        key: "teacher_id",
      },
    },
    day_of_week: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment:
        "0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday",
      validate: {
        min: 0,
        max: 6,
      },
    },
    start_time: {
      type: Sequelize.TIME,
      allowNull: true,
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: true,
    },
    room_number: {
      type: Sequelize.STRING(50),
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
    tableName: "class_subjects",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["class_id", "subject_id", "day_of_week"],
      },
    ],
  },
);

module.exports = ClassSubject;
