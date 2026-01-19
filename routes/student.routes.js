// ==================== STUDENT ROUTES ====================
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.Controller");
const multer = require("multer");
const {
  teacherValidation,
  subjectValidation,
  classValidation,
  studentValidation,
  attendanceValidation,
  idValidation,
} = require("../middlewares/validation");
const { upload, handleMulterError } = require("../middlewares/uploard");
router.get("", studentController.getAllStudents);
router.get("/:id", idValidation, studentController.getStudentById);
router.get("/:id/detail", idValidation, studentController.getStudentDetail);
router.post("", studentValidation.create, studentController.createStudent);
router.put(
  "/:id",
  idValidation,
  studentValidation.update,
  studentController.updateStudent,
);
router.delete("/:id", idValidation, studentController.deleteStudent);

// Excel upload routes with multiple middleware layers
router.post(
  "/upload-excel",
  upload.single("file"), // File upload handling
  handleMulterError, // Multer error handling
  studentController.uploadExcelAndInsert,
);

router.post(
  "/upload-excel-bulk",
  upload.single("file"),
  handleMulterError,
  studentController.uploadExcelBulkInsert,
);
module.exports = router;
