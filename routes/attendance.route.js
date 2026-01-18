const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.Controller");
const {
  validateAttendance,
  validateBulkAttendance,
} = require("../middlewares/validation");

// ==================== CRUD ROUTES ====================

// Get all attendance records with pagination and filters
router.get("/", attendanceController.getAllAttendance);

// Get attendance by ID
router.get("/:id", attendanceController.getAttendanceById);

// Create single attendance record
router.post("/", validateAttendance, attendanceController.createAttendance);

// Bulk create attendance
router.post(
  "/bulk",
  validateBulkAttendance,
  attendanceController.bulkCreateAttendance,
);

// Update attendance
router.put("/:id", validateAttendance, attendanceController.updateAttendance);

// Delete attendance
router.delete("/:id", attendanceController.deleteAttendance);

// ==================== REPORTING ROUTES ====================

// Get daily attendance report
// GET /attendance/reports/daily?date=2024-01-15&class_id=1
router.get("/reports/daily", attendanceController.getDailyReport);

// Get weekly attendance report
// GET /attendance/reports/weekly?start_date=2024-01-15&end_date=2024-01-21&class_id=1
router.get("/reports/weekly", attendanceController.getWeeklyReport);

// Get student attendance summary
// GET /attendance/reports/student?student_id=1&start_date=2024-01-01&end_date=2024-01-31
router.get("/reports/student", attendanceController.getStudentSummary);

// Get class attendance summary
// GET /attendance/reports/class?class_id=1&date=2024-01-15
router.get("/reports/class", attendanceController.getClassSummary);
// Get monthly calendar view
// GET /attendance/reports/monthly?year=2024&month=1&class_id=1
router.get("/reports/monthly", attendanceController.getMonthlyCalendar);

// ==================== EXPORT ROUTES ====================

// Export weekly grid to CSV
// GET /attendance/export/weekly-csv?start_date=2024-01-15&end_date=2024-01-19&class_id=1
//
router.get("/export/weekly-csv", attendanceController.exportWeeklyGridCSV);
router.get(
  "/reports/weekly-grid",
  attendanceController.getWeeklyGridMultiSubject,
);
router.get("/reports/dashboard", attendanceController.getDashboardSummary);
module.exports = router;
