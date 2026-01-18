// ==================== CLASS ROUTES ====================
const express = require("express");
const router = express.Router();
const {
  SubjectController,
  ClassController,
} = require("../controllers/class.Controller");

const {
  teacherValidation,
  subjectValidation,
  classValidation,
  studentValidation,
  attendanceValidation,
  idValidation,
} = require("../middlewares/validation");
router.get("", ClassController.getAllClasses);
router.get("/:id", idValidation, ClassController.getClassById);
router.post("", classValidation.create, ClassController.createClass);
router.put(
  "/:id",
  idValidation,
  classValidation.update,
  ClassController.updateClass,
);
router.delete("/:id", idValidation, ClassController.deleteClass);
module.exports = router;
