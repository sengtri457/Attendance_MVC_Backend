const sequelize = require("../config/database");
const Sequelize = require("sequelize");
const Student = sequelize.define("Student", {
    student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: "classes",
            key: "class_id"
        }
    },
    student_name_kh: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Student name in Khmer",
        unique: true
    },
    student_name_eng: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Student name in English",
        unique: true
    },
    gender: {
        type: Sequelize.CHAR(1),
        allowNull: true,
        validate: {
            isIn: [
                ["M", "F", "O"]
            ]
        },
        comment: "M=Male, F=Female, O=Other"
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
    tableName: "students",
    timestamps: true,
    underscored: true
},);

module.exports = Student;
