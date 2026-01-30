const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const User = sequelize.define("User", {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM('admin', 'teacher', 'student'),
        allowNull: false
    },
    // ID of the related Teacher or Student profile
    profile_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Links to student_id or teacher_id based on role"
    }
}, {
    tableName: "users",
    timestamps: true,
    underscored: true
});

module.exports = User;
