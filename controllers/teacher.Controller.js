const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const { validationResult } = require("express-validator");

class TeacherController {
  // Get all teachers
  async getAllTeachers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = search
        ? {
            [require("sequelize").Op.or]: [
              {
                teacher_name_kh: {
                  [require("sequelize").Op.like]: `%${search}%`,
                },
              },
              {
                teacher_name_eng: {
                  [require("sequelize").Op.like]: `%${search}%`,
                },
              },
            ],
          }
        : {};

      const { count, rows } = await Teacher.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Get all teachers error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching teachers",
        error: error.message,
      });
    }
  }

  // Get teacher by ID
  async getTeacherById(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: Class,
            as: "classes",
            include: [
              {
                model: Subject,
                as: "subject",
              },
            ],
          },
        ],
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.status(200).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      console.error("Get teacher by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching teacher",
        error: error.message,
      });
    }
  }

  // Create teacher
  async createTeacher(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const teacher = await Teacher.create(req.body);

      res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: teacher,
      });
    } catch (error) {
      console.error("Create teacher error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating teacher",
        error: error.message,
      });
    }
  }

  // Update teacher
  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const teacher = await Teacher.findByPk(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      await teacher.update(req.body);

      res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: teacher,
      });
    } catch (error) {
      console.error("Update teacher error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating teacher",
        error: error.message,
      });
    }
  }

  // Delete teacher
  async deleteTeacher(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      await teacher.destroy();

      res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error("Delete teacher error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting teacher",
        error: error.message,
      });
    }
  }
}

module.exports = new TeacherController();
