"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Attendances", {
      attendance_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "student",
          key: "student_id",
        },
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "classes",
          key: "class_id",
        },
        comment: "Which class this attendance is for",
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "teachers",
          key: "teacher_id",
        },
        comment: "Teacher who recorded the attendance",
      },
      attendance_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "Date of attendance",
      },
      session: {
        type: Sequelize.ENUM("morning", "afternoon", "full_day"),
        allowNull: false,
        defaultValue: "full_day",
        comment: "Morning session, afternoon session, or full day",
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "P",
        validate: {
          isIn: [["P", "A", "L", "E", "S"]],
        },
        comment: "P=Present, A=Absent, L=Late, E=Excused, S=Sick",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional notes or reasons",
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Attendances");
  },
};
