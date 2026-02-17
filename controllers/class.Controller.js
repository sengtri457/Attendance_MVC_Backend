const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const {Op} = require("sequelize");
const {validationResult} = require("express-validator");
const {
    sendSuccess,
    sendError,
    sendNotFound,
    sendValidationError,
    asyncHandler,
    checkValidation
} = require("../middlewares/response.middleware");

class SubjectController {
    getAllSubjects = asyncHandler(async (req, res) => {
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
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ["created_at", "DESC"]
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

    getSubjectById = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const subject = await Subject.findByPk(id, {
            include: [
                {
                    model: Class,
                    as: "classes",
                    include: [
                        {
                            model: Teacher,
                            as: "teacher"
                        },
                    ]
                },
            ]
        });

        if (! subject) {
            return sendNotFound(res, "Subject");
        }

        return sendSuccess(res, subject, "Subject fetched successfully");
    });

    createSubject = asyncHandler(async (req, res) => {
        if (!checkValidation(req, res)) {
            return;
        }

        const subject = await Subject.create(req.body);

        return sendSuccess(res, subject, "Subject created successfully", 201);
    });

    updateSubject = asyncHandler(async (req, res) => {
        const {id} = req.params;

        if (!checkValidation(req, res)) {
            return;
        }

        const subject = await Subject.findByPk(id);

        if (! subject) {
            return sendNotFound(res, "Subject");
        }

        await subject.update(req.body);

        return sendSuccess(res, subject, "Subject updated successfully");
    });

    deleteSubject = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const subject = await Subject.findByPk(id);

        if (! subject) {
            return sendNotFound(res, "Subject");
        }

        await subject.destroy();

        return sendSuccess(res, null, "Subject deleted successfully");
    });
}

class ClassController {
    getAllClasses = asyncHandler(async (req, res) => {
        const {
            page = 1,
            limit = 10,
            teacher_id,
            class_year
        } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (class_year) 
            whereClause.class_year = class_year;
        


        const {count, rows} = await Class.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Student,
                    as: "students",
                    attributes: ["student_id", "student_name_kh", "student_name_eng"]
                },
            ],

            order: [
                ["created_at", "DESC"]
            ]
        });

        return sendSuccess(res, rows, "Classes fetched successfully", 200, {
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    });

    getClassById = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const classData = await Class.findByPk(id, {
            include: [
                {
                    model: Subject,
                    as: "subject"
                }, {
                    model: Teacher,
                    as: "teacher"
                }, {
                    model: Student,
                    as: "student"
                },
            ]
        });

        if (! classData) {
            return sendNotFound(res, "Class");
        }

        return sendSuccess(res, classData, "Class fetched successfully");
    });

    async createClass(req, res) {
        try {
            const errors = validationResult(req);
            if (! errors.isEmpty()) {
                return res.status(400).json({success: false, errors: errors.array()});
            }

            const classData = await Class.create(req.body);

            const classWithDetails = await Class.findByPk(classData.class_id);

            res.status(201).json({success: true, message: "Class created successfully", data: classWithDetails});


        } catch (error) {
            console.error("Create class error:", error);
            res.status(500).json({success: false, message: "Error creating class", error: error.message});
        }
    }

    updateClass = asyncHandler(async (req, res) => {
        const {id} = req.params;

        if (!checkValidation(req, res)) {
            return;
        }

        const classData = await Class.findByPk(id);

        if (! classData) {
            return sendNotFound(res, "Class");
        }

        // Verify subject if being updated
        if (req.body.subject_id) {
            const subject = await Subject.findByPk(req.body.subject_id);
            if (! subject) {
                return sendNotFound(res, "Subject");
            }
        }

        // Verify teacher if being updated
        if (req.body.teacher_id) {
            const teacher = await Teacher.findByPk(req.body.teacher_id);
            if (! teacher) {
                return sendNotFound(res, "Teacher");
            }
        }

        await classData.update(req.body);

        const updatedClass = await Class.findByPk(id, {
            include: [
                {
                    model: Subject,
                    as: "subject"
                }, {
                    model: Teacher,
                    as: "teacher"
                },
            ]
        });

        return sendSuccess(res, updatedClass, "Class updated successfully");
    });

    deleteClass = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const classData = await Class.findByPk(id);

        if (! classData) {
            return sendNotFound(res, "Class");
        }

        await classData.destroy();

        return sendSuccess(res, null, "Class deleted successfully");
    });
}

module.exports = {
    SubjectController: new SubjectController(),
    ClassController: new ClassController()
};
