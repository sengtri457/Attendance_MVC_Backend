const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.Controller");

router.get("/", subjectController.getAllSubjects);
router.get("/class/:classId", subjectController.getSubjectsByClass);
router.get("/schedule/:classId", subjectController.getClassSchedule);
router.get("/class/:classId/day/:dayOfWeek", subjectController.getSubjectsByClassAndDay,);
router.get("/class/:classId/date/:date", subjectController.getSubjectsByDate);
router.post("/assign", subjectController.assignSubjectToClass);
router.delete("/assign/:classId/:subjectId/:dayOfWeek", subjectController.removeSubjectFromClass,);
router.post("/", subjectController.createSubject);
router.put("/:id", subjectController.updateSubject);
router.delete("/:id", subjectController.deleteSubject);

module.exports = router;
