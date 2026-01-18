const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

class SubjectController {
  async getAllSubjects(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = search
        ? {
            [Op.or]: [
              { subject_name: { [Op.like]: `%${search}%` } },
              { subject_code: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

      const { count, rows } = await Subject.findAndCountAll({
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
      console.error("Get all subjects error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching subjects",
        error: error.message,
      });
    }
  }

  async getSubjectById(req, res) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [
          {
            model: Class,
            as: "classes",
            include: [
              {
                model: Teacher,
                as: "teacher",
              },
            ],
          },
        ],
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      res.status(200).json({
        success: true,
        data: subject,
      });
    } catch (error) {
      console.error("Get subject by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching subject",
        error: error.message,
      });
    }
  }

  async createSubject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const subject = await Subject.create(req.body);

      res.status(201).json({
        success: true,
        message: "Subject created successfully",
        data: subject,
      });
    } catch (error) {
      console.error("Create subject error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating subject",
        error: error.message,
      });
    }
  }

  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      await subject.update(req.body);

      res.status(200).json({
        success: true,
        message: "Subject updated successfully",
        data: subject,
      });
    } catch (error) {
      console.error("Update subject error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating subject",
        error: error.message,
      });
    }
  }

  async deleteSubject(req, res) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      await subject.destroy();

      res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
      });
    } catch (error) {
      console.error("Delete subject error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting subject",
        error: error.message,
      });
    }
  }
}

class ClassController {
  async getAllClasses(req, res) {
    try {
      const { page = 1, limit = 10, teacher_id, class_year } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (class_year) whereClause.class_year = class_year;

      const { count, rows } = await Class.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Student,
            as: "students",
            attributes: ["student_id", "student_name_kh", "student_name_eng"],
          },
        ],

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
      console.error("Get all classes error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching classes",
        error: error.message,
      });
    }
  }

  async getClassById(req, res) {
    try {
      const { id } = req.params;

      const classData = await Class.findByPk(id, {
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Teacher,
            as: "teacher",
          },
          {
            model: Student,
            as: "student",
          },
        ],
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      res.status(200).json({
        success: true,
        data: classData,
      });
    } catch (error) {
      console.error("Get class by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching class",
        error: error.message,
      });
    }
  }

  async createClass(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Verify subject exists
      const subject = await Subject.findByPk(req.body.subject_id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      // Verify teacher exists
      const teacher = await Teacher.findByPk(req.body.teacher_id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      const classData = await Class.create(req.body);

      const classWithDetails = await Class.findByPk(classData.class_id, {
        include: [
          { model: Subject, as: "subject" },
          { model: Teacher, as: "teacher" },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Class created successfully",
        data: classWithDetails,
      });
    } catch (error) {
      console.error("Create class error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating class",
        error: error.message,
      });
    }
  }

  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const classData = await Class.findByPk(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Verify subject if being updated
      if (req.body.subject_id) {
        const subject = await Subject.findByPk(req.body.subject_id);
        if (!subject) {
          return res.status(404).json({
            success: false,
            message: "Subject not found",
          });
        }
      }

      // Verify teacher if being updated
      if (req.body.teacher_id) {
        const teacher = await Teacher.findByPk(req.body.teacher_id);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            message: "Teacher not found",
          });
        }
      }

      await classData.update(req.body);

      const updatedClass = await Class.findByPk(id, {
        include: [
          { model: Subject, as: "subject" },
          { model: Teacher, as: "teacher" },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Class updated successfully",
        data: updatedClass,
      });
    } catch (error) {
      console.error("Update class error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating class",
        error: error.message,
      });
    }
  }

  async deleteClass(req, res) {
    try {
      const { id } = req.params;

      const classData = await Class.findByPk(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      await classData.destroy();

      res.status(200).json({
        success: true,
        message: "Class deleted successfully",
      });
    } catch (error) {
      console.error("Delete class error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting class",
        error: error.message,
      });
    }
  }
}

module.exports = {
  SubjectController: new SubjectController(),
  ClassController: new ClassController(),
};
