const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const Attendance = sequelize.define(
  "Attendance",
  {
    attendance_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "students",
        key: "student_id",
      },
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
    subject_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "subjects",
        key: "subject_id",
      },
      comment: "Subject for which attendance is recorded",
    },
    attendance_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      comment: "Date of attendance",
    },
    session: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "morning",
      comment:
        "Session/Period: morning, afternoon, evening, or period_1, period_2, etc.",
    },
    status: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "P",
      validate: {
        isIn: [["P", "A", "L", "E"]],
      },
      comment: "P=Present, A=Absent, L=Late, E=Excused",
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
  },
  {
    tableName: "attendances",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        // One attendance record per student per date per subject per session
        unique: true,
        fields: ["student_id", "attendance_date", "subject_id", "session"],
        name: "unique_attendance_record",
      },
      {
        // Index for faster date queries
        fields: ["attendance_date"],
        name: "idx_attendance_date",
      },
      {
        // Index for faster student queries
        fields: ["student_id"],
        name: "idx_student_id",
      },
      {
        // Index for faster subject queries
        fields: ["subject_id"],
        name: "idx_subject_id",
      },
      {
        // Index for faster status queries
        fields: ["status"],
        name: "idx_status",
      },
      {
        // Composite index for date + subject queries
        fields: ["attendance_date", "subject_id"],
        name: "idx_date_subject",
      },
    ],
  },
);

module.exports = Attendance;
