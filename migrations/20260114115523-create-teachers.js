"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Teachers", {
      teacher_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      teacher_name_kh: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in Khmer",
      },
      teacher_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in English",
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      teacher_name_kh: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in Khmer",
      },
      teacher_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in English",
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      teacher_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in English",
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      teacher_name_kh: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in Khmer",
      },
      teacher_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Teacher name in English",
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Teachers");
  },
};
