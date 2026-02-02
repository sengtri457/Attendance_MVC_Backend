const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const {
  sendSuccess,
  sendError,
  sendNotFound,
  asyncHandler,
  checkValidation
} = require("../middlewares/response.middleware");

class TeacherController {
    // Get all teachers
    getAllTeachers = asyncHandler(async (req, res) => {
            const {
                page = 1,
                limit = 10,
                search
            } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = search ? {
                [require("sequelize").Op.or]: [
                    {
                        teacher_name_eng: {
                            [require("sequelize").Op.like]: `%${search}%`
                        }
                    },
                ]
            } : {};

            const {count, rows} = await Teacher.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [
                    ["created_at", "DESC"]
                ]
            });

            return sendSuccess(res, rows, "Teachers fetched successfully", 200, {
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
    });

    // Get teacher by ID
    getTeacherById = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const teacher = await Teacher.findByPk(id, {
            include: [
                {
                    model: Class,
                    as: "classes",
                    include: [
                        {
                            model: Subject,
                            as: "subject"
                        },
                    ]
                },
            ]
        });

        if (!teacher) {
            return sendNotFound(res, "Teacher");
        }

        return sendSuccess(res, teacher, "Teacher fetched successfully");
    });

    // Create teacher
    createTeacher = asyncHandler(async (req, res) => {
        if (!checkValidation(req, res)) {
            return;
        }

        const teacher = await Teacher.create(req.body);

        return sendSuccess(res, teacher, "Teacher created successfully", 201);
    });

    // Update teacher
    updateTeacher = asyncHandler(async (req, res) => {
        const {id} = req.params;

        if (!checkValidation(req, res)) {
            return;
        }

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return sendNotFound(res, "Teacher");
        }

        await teacher.update(req.body);

        return sendSuccess(res, teacher, "Teacher updated successfully");
    });

    // Delete teacher
    deleteTeacher = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return sendNotFound(res, "Teacher");
        }

        await teacher.destroy();

        return sendSuccess(res, null, "Teacher deleted successfully");
    });
}

module.exports = new TeacherController();
