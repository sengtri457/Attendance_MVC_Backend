"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Student", {
      student_id: {
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
      student_name_kh: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Student name in Khmer",
      },
      student_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Student name in English",
      },
      gender: {
        type: Sequelize.CHAR(1),
        allowNull: true,
        validate: {
          isIn: [["M", "F", "O"]],
        },
        comment: "M=Male, F=Female, O=Other",
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      address: {
        type: Sequelize.TEXT,
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Students");
  },
};
