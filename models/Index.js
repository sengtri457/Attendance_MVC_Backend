const sequelize = require("../config/database");
const Teacher = require("./Teacher");
const Subject = require("./Subject");
const Class = require("./Class");
const Student = require("./Student");
const Attendance = require("./Attendance");
const ClassSubject = require("./ClassSubject");
// Class - Student
Class.hasMany(Student, {
    foreignKey: "class_id",
    as: "students"
});

Student.belongsTo(Class, {
    foreignKey: "class_id",
    as: "class"
});

// Student - Attendance
Student.hasMany(Attendance, {
    foreignKey: "student_id",
    as: "attendances"
});

Attendance.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
});

// Teacher - Attendance
Teacher.hasMany(Attendance, {
    foreignKey: "teacher_id",
    as: "attendances"
});

Attendance.belongsTo(Teacher, {
    foreignKey: "teacher_id",
    as: "teacher"
});

// Subject - Attendance
Subject.hasMany(Attendance, {
    foreignKey: "subject_id",
    as: "attendances"
});

Attendance.belongsTo(Subject, {
    foreignKey: "subject_id",
    as: "subject"
});
Subject.hasMany(ClassSubject, {
    foreignKey: "subject_id",
    as: "classSubjects"
});
ClassSubject.belongsTo(Subject, {
    foreignKey: "subject_id",
    as: "subject"
});

// Class - ClassSubject
Class.hasMany(ClassSubject, {
    foreignKey: "class_id",
    as: "classSubjects"
});
ClassSubject.belongsTo(Class, {
    foreignKey: "class_id",
    as: "class"
});

// Sync all models
const User = require("./User");

// Sync all models
const syncDatabase = async () => {
    try {
        await sequelize.sync({alter: true});
        console.log("✅ All models synchronized successfully.");
    } catch (error) {
        console.error("❌ Error synchronizing models:", error);
        throw error;
    }
};

module.exports = {
    sequelize,
    Teacher,
    Subject,
    Class,
    Student,
    Attendance,
    User,
    syncDatabase
};
