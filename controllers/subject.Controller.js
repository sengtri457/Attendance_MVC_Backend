const Subject = require("../models/Subject");
const ClassSubject = require("../models/ClassSubject "); // You'll need this model
const {Op} = require("sequelize");

class SubjectController { /**
   * Get all subjects
   * GET /subject
   */
    async getAllSubjects(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search
            } = req.query;
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

            return res.status(200).json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error("Error fetching subjects:", error);
            return res.status(500).json({success: false, message: "Failed to fetch subjects", error: error.message});
        }
    }

    /**
   * Get subjects for a specific class
   * GET /subject/class/:classId
   */
    async getSubjectsByClass(req, res) {
        try {
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

            return res.status(200).json({success: true, data: subjects});
        } catch (error) {
            console.error("Error fetching subjects by class:", error);
            return res.status(500).json({success: false, message: "Failed to fetch subjects for class", error: error.message});
        }
    }

    /**
   * Get class schedule (subjects organized by day of week)
   * GET /subject/schedule/:classId
   */
    async getClassSchedule(req, res) {
        try {
            const {classId} = req.params;

            // Fetch class info
            const Class = require("../models/Class");
            const classInfo = await Class.findByPk(classId);

            if (! classInfo) {
                return res.status(404).json({success: false, message: "Class not found"});
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

            return res.status(200).json({
                success: true,
                data: {
                    class_id: classInfo.class_id,
                    class_name: classInfo.class_name,
                    schedule: schedule
                }
            });
        } catch (error) {
            console.error("Error fetching class schedule:", error);
            return res.status(500).json({success: false, message: "Failed to fetch class schedule", error: error.message});
        }
    }

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

            const subjects = await Subject.findAll({
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
    async createSubject(req, res) {
        try {
            const {subject_name, subject_code, description} = req.body;

            if (!subject_name || !subject_code) {
                return res.status(400).json({success: false, message: "Subject name and code are required"});
            }

            const subject = await Subject.create({subject_name, subject_code, description});

            return res.status(201).json({success: true, data: subject, message: "Subject created successfully"});
        } catch (error) {
            console.error("Error creating subject:", error);

            if (error.name === "SequelizeUniqueConstraintError") {
                return res.status(409).json({success: false, message: "Subject code already exists"});
            }

            return res.status(500).json({success: false, message: "Failed to create subject", error: error.message});
        }
    }

    /**
   * Update a subject
   * PUT /subject/:id
   */
    async updateSubject(req, res) {
        try {
            const {id} = req.params;
            const {subject_name, subject_code, description} = req.body;

            const subject = await Subject.findByPk(id);

            if (! subject) {
                return res.status(404).json({success: false, message: "Subject not found"});
            }

            await subject.update({
                subject_name: subject_name || subject.subject_name,
                subject_code: subject_code || subject.subject_code,
                description: description !== undefined ? description : subject.description
            });

            return res.status(200).json({success: true, data: subject, message: "Subject updated successfully"});
        } catch (error) {
            console.error("Error updating subject:", error);

            if (error.name === "SequelizeUniqueConstraintError") {
                return res.status(409).json({success: false, message: "Subject code already exists"});
            }

            return res.status(500).json({success: false, message: "Failed to update subject", error: error.message});
        }
    }

    /**
   * Delete a subject
   * DELETE /subject/:id
   */
    async deleteSubject(req, res) {
        try {
            const {id} = req.params;

            const subject = await Subject.findByPk(id);

            if (! subject) {
                return res.status(404).json({success: false, message: "Subject not found"});
            }

            await subject.destroy();

            return res.status(200).json({success: true, message: "Subject deleted successfully"});
        } catch (error) {
            console.error("Error deleting subject:", error);
            return res.status(500).json({success: false, message: "Failed to delete subject", error: error.message});
        }
    }
}

module.exports = new SubjectController();
