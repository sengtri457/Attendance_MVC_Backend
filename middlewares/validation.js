const { body, param, query } = require("express-validator");

// Teacher Validation
const teacherValidation = {
  create: [
    body("teacher_name_kh")
      .notEmpty()
      .withMessage("Teacher name in Khmer is required")
      .isLength({ max: 100 })
      .withMessage("Teacher name in Khmer must be less than 100 characters"),
    body("teacher_name_eng")
      .notEmpty()
      .withMessage("Teacher name in English is required")
      .isLength({ max: 100 })
      .withMessage("Teacher name in English must be less than 100 characters"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phone")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Phone number must be less than 20 characters"),
  ],
  update: [
    body("teacher_name_kh")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Teacher name in Khmer must be less than 100 characters"),
    body("teacher_name_eng")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Teacher name in English must be less than 100 characters"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phone")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Phone number must be less than 20 characters"),
  ],
};

// Subject Validation
const subjectValidation = {
  create: [
    body("subject_name")
      .notEmpty()
      .withMessage("Subject name is required")
      .isLength({ max: 100 })
      .withMessage("Subject name must be less than 100 characters"),
    body("subject_code")
      .notEmpty()
      .withMessage("Subject code is required")
      .isLength({ max: 20 })
      .withMessage("Subject code must be less than 20 characters"),
    body("description").optional(),
  ],
  update: [
    body("subject_name")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Subject name must be less than 100 characters"),
    body("subject_code")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Subject code must be less than 20 characters"),
    body("description").optional(),
  ],
};

// Class Validation
const classValidation = {
  create: [
    body("class_code")
      .notEmpty()
      .withMessage("Class code is required")
      .isLength({ max: 20 })
      .withMessage("Class code must be less than 20 characters"),
    body("class_year")
      .notEmpty()
      .withMessage("Class year is required")
      .isLength({ max: 50 })
      .withMessage("Class year must be less than 50 characters"),
    body("subject_id")
      .notEmpty()
      .withMessage("Subject ID is required")
      .isInt()
      .withMessage("Subject ID must be an integer"),
    body("teacher_id")
      .notEmpty()
      .withMessage("Teacher ID is required")
      .isInt()
      .withMessage("Teacher ID must be an integer"),
    body("schedule")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Schedule must be less than 100 characters"),
    body("room_number")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Room number must be less than 20 characters"),
  ],
  update: [
    body("class_code")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Class code must be less than 20 characters"),
    body("class_year")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Class year must be less than 50 characters"),
    body("subject_id")
      .optional()
      .isInt()
      .withMessage("Subject ID must be an integer"),
    body("teacher_id")
      .optional()
      .isInt()
      .withMessage("Teacher ID must be an integer"),
    body("schedule")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Schedule must be less than 100 characters"),
    body("room_number")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Room number must be less than 20 characters"),
  ],
};

// Student Validation
const studentValidation = {
  create: [
    body("class_id")
      .notEmpty()
      .withMessage("Class ID is required")
      .isInt()
      .withMessage("Class ID must be an integer"),
    body("student_name_kh")
      .notEmpty()
      .withMessage("Student name in Khmer is required")
      .isLength({ max: 100 })
      .withMessage("Student name in Khmer must be less than 100 characters"),
    body("student_name_eng")
      .notEmpty()
      .withMessage("Student name in English is required")
      .isLength({ max: 100 })
      .withMessage("Student name in English must be less than 100 characters"),
    body("gender")
      .optional()
      .isIn(["M", "F", "O"])
      .withMessage("Gender must be M, F, or O"),
    body("date_of_birth")
      .optional()
      .isDate()
      .withMessage("Invalid date format"),
    body("phone")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Phone number must be less than 20 characters"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
  ],
  update: [
    body("class_id")
      .optional()
      .isInt()
      .withMessage("Class ID must be an integer"),
    body("student_name_kh")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Student name in Khmer must be less than 100 characters"),
    body("student_name_eng")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Student name in English must be less than 100 characters"),
    body("gender")
      .optional()
      .isIn(["M", "F", "O"])
      .withMessage("Gender must be M, F, or O"),
    body("date_of_birth")
      .optional()
      .isDate()
      .withMessage("Invalid date format"),
    body("phone")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Phone number must be less than 20 characters"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
  ],
};

// Attendance Validation
const validateAttendance = [
  body("student_id")
    .isInt({ min: 1 })
    .withMessage("Valid student_id is required"),
  body("teacher_id")
    .isInt({ min: 1 })
    .withMessage("Valid teacher_id is required"),
  body("subject_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid subject_id is required"),
  body("attendance_date")
    .isDate()
    .withMessage("Valid attendance_date (YYYY-MM-DD) is required"),
  body("status")
    .isIn(["P", "A", "L", "E"])
    .withMessage("Status must be P, A, L, or E"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];

const validateBulkAttendance = [
  body("teacher_id")
    .isInt({ min: 1 })
    .withMessage("Valid teacher_id is required"),
  body("subject_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid subject_id is required"),
  body("attendance_date")
    .isDate()
    .withMessage("Valid attendance_date (YYYY-MM-DD) is required"),
  body("records")
    .isArray({ min: 1 })
    .withMessage("Records array is required with at least one record"),
  body("records.*.student_id")
    .isInt({ min: 1 })
    .withMessage("Each record must have a valid student_id"),
  body("records.*.status")
    .optional()
    .isIn(["P", "A", "L", "E"])
    .withMessage("Status must be P, A, L, or E"),
];

// ID Parameter Validation
const idValidation = [param("id").isInt().withMessage("ID must be an integer")];

module.exports = {
  teacherValidation,
  subjectValidation,
  classValidation,
  studentValidation,
  validateAttendance,
  validateBulkAttendance,
  idValidation,
};
