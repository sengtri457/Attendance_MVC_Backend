const Subject = require("../models/Subject");
const ClassSubject = require("../models/ClassSubject");
const {Op} = require("sequelize");
const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendConflict,
  asyncHandler,
  checkValidation
} = require("../middlewares/response.middleware");

class SubjectController {
    /**
     * Get all subjects
     * GET /subject
     */
    getAllSubjects = asyncHandler(async (req, res) => {
        const {page = 1, limit = 10, search} = req.query;
        const offset = (page - 1) * limit;

        const whereClause = search ? {
            [Op.or]: [
                {
                    subject_name: {
                        [Op.like]: `%${search}%`
                    }
                }, {
                    subject_code: {
                        [Op.like]: `%${search}%`
                    }
                },
            ]
        } : {};

        const {count, rows} = await Subject.findAndCountAll({
            where: whereClause,
            attributes: [
                "subject_id", "subject_name", "subject_code", "description",
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["subject_name", "ASC"]
            ]
        });

        return sendSuccess(res, rows, "Subjects fetched successfully", 200, {
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    });

    /**
     * Get subjects for a specific class
     * GET /subject/class/:classId
     */
    getSubjectsByClass = asyncHandler(async (req, res) => {
        const {classId} = req.params;

        const subjects = await Subject.findAll({
            include: [
                {
                    model: ClassSubject,
                    as: "classSubjects",
                    where: {
                        class_id: classId
                    },
                    attributes: []
                },
            ],
            attributes: ["subject_id", "subject_name", "subject_code"]
        });

        return sendSuccess(res, subjects, "Subjects fetched successfully");
    });

    /**
   * Get class schedule (subjects organized by day of week)
   * GET /subject/schedule/:classId
   */
    getClassSchedule = asyncHandler(async (req, res) => {
        const {classId} = req.params;

        // Fetch class info
        const Class = require("../models/Class");
        const classInfo = await Class.findByPk(classId);

        if (!classInfo) {
            return sendNotFound(res, "Class");
        }

            // Fetch all subjects for this class with day_of_week
            const classSubjects = await ClassSubject.findAll({
                where: {
                    class_id: classId
                },
                include: [
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_id", "subject_name", "subject_code"]
                    },
                ],
                attributes: ["day_of_week"],
                order: [
                    ["day_of_week", "ASC"]
                ]
            });

            // Day names mapping
            const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];

            // Group subjects by day
            const scheduleMap = new Map();

            classSubjects.forEach((cs) => {
                const dayOfWeek = cs.day_of_week;
                if (! scheduleMap.has(dayOfWeek)) {
                    scheduleMap.set(dayOfWeek, []);
                }
                scheduleMap.get(dayOfWeek).push({subject_id: cs.subject.subject_id, subject_name: cs.subject.subject_name, subject_code: cs.subject.subject_code});
            });

            // Build schedule array
            const schedule = Array.from(scheduleMap.entries()).map(([dayOfWeek, subjects]) => ({day_of_week: dayOfWeek, day_name: dayNames[dayOfWeek], subjects: subjects}),);

            return sendSuccess(res, {
                class_id: classInfo.class_id,
                class_name: classInfo.class_name,
                schedule: schedule
            }, "Class schedule fetched successfully");
    });

    /**
   * Get subjects for a specific class and day of week
   * GET /subject/class/:classId/day/:dayOfWeek
   */
    async getSubjectsByClassAndDay(req, res) {
        try {
            const {classId, dayOfWeek} = req.params;
            const dayNumber = parseInt(dayOfWeek);

            if (dayNumber < 0 || dayNumber > 6) {
                return res.status(400).json({success: false, message: "Invalid day of week. Must be between 0 (Sunday) and 6 (Saturday)"});
            }

            const subjects = await Subject.findAll({
                include: [
                    {
                        model: ClassSubject,
                        as: "classSubjects",
                        where: {
                            class_id: classId,
                            day_of_week: dayNumber
                        },
                        attributes: []
                    },
                ],
                attributes: ["subject_id", "subject_name", "subject_code"]
            });

            return res.status(200).json({success: true, data: subjects});
        } catch (error) {
            console.error("Error fetching subjects by class and day:", error);
            return res.status(500).json({success: false, message: "Failed to fetch subjects for class and day", error: error.message});
        }
    }

    /**
   * Get subjects for a specific date
   * GET /subject/class/:classId/date/:date
   */
    async getSubjectsByDate(req, res) {
        try {
            const {classId, date} = req.params;

            // Parse the date and get day of week
            const targetDate = new Date(date);
            if (isNaN(targetDate.getTime())) {
                return res.status(400).json({success: false, message: "Invalid date format. Use YYYY-MM-DD"});
            }

            const dayOfWeek = targetDate.getDay(); // 0-6

            let subjects = await Subject.findAll({
                include: [
                    {
                        model: ClassSubject,
                        as: "classSubjects",
                        where: {
                            class_id: classId,
                            day_of_week: dayOfWeek
                        },
                        attributes: []
                    },
                ],
                attributes: ["subject_id", "subject_name", "subject_code"]
            });

            // Fallback: If no scheduled subjects, check if the Class has a main subject
            // Removed because Class model does not have a direct subject association
            // if (subjects.length === 0) { ... }

            return res.status(200).json({
                success: true,
                data: subjects,
                meta: {
                    date: date,
                    day_of_week: dayOfWeek
                }
            });
        } catch (error) {
            console.error("Error fetching subjects by date:", error);
            return res.status(500).json({success: false, message: "Failed to fetch subjects for date", error: error.message});
        }
    }

    /**
     * Create a new subject
     * POST /subject
     */
    createSubject = asyncHandler(async (req, res) => {
        const {subject_name, subject_code, description} = req.body;

        if (!subject_name || !subject_code) {
            return sendError(res, "Subject name and code are required", 400);
        }

        const subject = await Subject.create({subject_name, subject_code, description});

        return sendSuccess(res, subject, "Subject created successfully", 201);
    });

    /**
     * Update a subject
     * PUT /subject/:id
     */
    updateSubject = asyncHandler(async (req, res) => {
        const {id} = req.params;
        const {subject_name, subject_code, description} = req.body;

        const subject = await Subject.findByPk(id);

        if (!subject) {
            return sendNotFound(res, "Subject");
        }

        await subject.update({
            subject_name: subject_name || subject.subject_name,
            subject_code: subject_code || subject.subject_code,
            description: description !== undefined ? description : subject.description
        });

        return sendSuccess(res, subject, "Subject updated successfully");
    });

    /**
     * Delete a subject
     * DELETE /subject/:id
     */
    deleteSubject = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const subject = await Subject.findByPk(id);

        if (!subject) {
            return sendNotFound(res, "Subject");
        }

        await subject.destroy();

        return sendSuccess(res, null, "Subject deleted successfully");
    });

    /**
     * Assign a subject to a class for a specific day and time
     * POST /subject/assign
     */
    async assignSubjectToClass(req, res) {
        try {
            const {
                class_id,
                subject_id,
                day_of_week,
                start_time,
                end_time,
                room_number,
                teacher_id
            } = req.body;

            // Basic validation
            if (!class_id || !subject_id || day_of_week === undefined) {
                return res.status(400).json({success: false, message: "Class, Subject, and Day of Week are required"});
            }

            // Check if assignment already exists
            const existingAssignment = await ClassSubject.findOne({
                where: {
                    class_id,
                    subject_id,
                    day_of_week
                }
            });

            if (existingAssignment) { // Update if exists
                await existingAssignment.update({
                    start_time,
                    end_time,
                    room_number,
                    teacher_id: teacher_id || existingAssignment.teacher_id
                });
                return res.status(200).json({success: true, message: "Schedule updated successfully", data: existingAssignment});
            }

            const newAssignment = await ClassSubject.create({
                class_id,
                subject_id,
                day_of_week,
                start_time,
                end_time,
                room_number,
                teacher_id
            });

            return res.status(201).json({success: true, message: "Subject assigned successfully", data: newAssignment});
        } catch (error) {
            console.error("Error assigning subject:", error);
            return res.status(500).json({success: false, message: "Failed to assign subject", error: error.message});
        }
    }

    /**
     * Remove a subject from a class schedule
     * DELETE /subject/assign/:classId/:subjectId/:dayOfWeek
     */
    async removeSubjectFromClass(req, res) {
        try {
            const {classId, subjectId, dayOfWeek} = req.params;

            const deleted = await ClassSubject.destroy({
                where: {
                    class_id: classId,
                    subject_id: subjectId,
                    day_of_week: dayOfWeek
                }
            });

            if (deleted) {
                return res.status(200).json({success: true, message: "Subject removed from schedule"});
            } else {
                return res.status(404).json({success: false, message: "Schedule entry not found"});
            }
        } catch (error) {
            console.error("Error removing subject assignment:", error);
            return res.status(500).json({success: false, message: "Failed to remove subject assignment", error: error.message});
        }
    }
}

module.exports = new SubjectController();
