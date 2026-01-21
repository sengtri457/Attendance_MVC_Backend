const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const {validationResult} = require("express-validator");
const sequelize = require("../config/database");
const {Op} = require("sequelize");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const {parse} = require('csv-parse/sync');

function excelDateToJSDate(excelDate) {
    if (! excelDate) 
        return null;
    


    if (typeof excelDate === "string") {
        const date = new Date(excelDate);
        return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
    }

    if (typeof excelDate === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
        return jsDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    }

    return null;
}
class StudentController { // Get all students
    async getAllStudents(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                class_id,
                gender
            } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};

            if (search) {
                whereClause[Op.or] = [
                    {
                        student_name_kh: {
                            [Op.like]: `%${search}%`
                        }
                    }, {
                        student_name_eng: {
                            [Op.like]: `%${search}%`
                        }
                    },
                ];
            }

            if (class_id) {
                whereClause.class_id = class_id;
            }

            if (gender) {
                whereClause.gender = gender;
            }

            const {count, rows} = await Student.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: Class,
                        as: "class"
                    },
                ],
                order: [
                    ["created_at", "DESC"]
                ]
            });

            res.status(200).json({
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
            console.error("Get all students error:", error);
            res.status(500).json({success: false, message: "Error fetching students", error: error.message});
        }
    }
    // Get student by ID (simple - no nested includes)
    async getStudentById(req, res) {
        try {
            const {id} = req.params;

            const student = await Student.findByPk(id, {
                include: [
                    {
                        model: Class,
                        as: "class",
                        attributes: ["class_id"]
                    },
                ]
            });

            if (! student) {
                return res.status(404).json({success: false, message: "Student not found"});
            }

            res.status(200).json({success: true, data: student});
        } catch (error) {
            console.error("Get student by ID error:", error);
            res.status(500).json({success: false, message: "Error fetching student", error: error.message});
        }
    }

    // Get student detail with attendance summary
    async getStudentDetail(req, res) {
        try {
            const {id} = req.params;
            const {start_date, end_date} = req.query;

            // Get student with class info
            const student = await Student.findByPk(id, {
                include: [
                    {
                        model: Class,
                        as: "class",
                        attributes: ["class_id", "class_code"]
                    },
                ]
            });

            if (! student) {
                return res.status(404).json({success: false, message: "Student not found"});
            }

            // Calculate date range (default: last 30 days)
            const endDate = end_date || new Date().toISOString().split("T")[0];
            const startDate = start_date || (() => {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                return date.toISOString().split("T")[0];
            })();

            // Get attendance summary
            const attendanceStats = await Attendance.findAll({
                where: {
                    student_id: id,
                    attendance_date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: [
                    "status",
                    [
                        sequelize.fn("COUNT", sequelize.col("status")),
                        "count"
                    ],
                ],
                group: ["status"],
                raw: true
            });

            const statusCounts = {
                P: 0,
                A: 0,
                L: 0,
                E: 0
            };

            attendanceStats.forEach((stat) => {
                statusCounts[stat.status] = parseInt(stat.count);
            });

            const totalDays = Object.values(statusCounts).reduce((a, b) => a + b, 0);
            const attendanceRate = totalDays > 0 ? ((statusCounts.P / totalDays) * 100).toFixed(1) + "%" : "0%";

            // Get recent attendance records
            const recentAttendance = await Attendance.findAll({
                where: {
                    student_id: id,
                    attendance_date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_id", "subject_name"]
                    },
                ],
                order: [
                    ["attendance_date", "DESC"]
                ],
                limit: 10
            });

            // Build response
            const studentDetail = {
                ... student.toJSON(),
                attendance_summary: {
                    total_days: totalDays,
                    present: statusCounts.P,
                    absent: statusCounts.A,
                    late: statusCounts.L,
                    excused: statusCounts.E,
                    attendance_rate: attendanceRate
                },
                recent_attendance: recentAttendance
            };

            res.status(200).json({success: true, data: studentDetail});
        } catch (error) {
            console.error("Get student detail error:", error);
            res.status(500).json({success: false, message: "Error fetching student details", error: error.message});
        }
    }
    // Create student
    async createStudent(req, res) {
        try { // Check express-validator errors
            const errors = validationResult(req);
            if (! errors.isEmpty()) {
                return res.status(400).json({success: false, message: "Validation failed", errors: errors.array()});
            }

            // Check if class exists
            const classExists = await Class.findByPk(req.body.class_id);
            if (! classExists) {
                return res.status(404).json({success: false, message: "Class not found"});
            }

            // Create student
            const student = await Student.create(req.body);

            // Fetch student with class details
            const studentWithClass = await Student.findByPk(student.student_id, {
                include: [
                    {
                        model: Class,
                        as: "class"
                    },
                ]
            });

            res.status(201).json({success: true, message: "Student created successfully", data: studentWithClass});
        } catch (error) {
            console.error("Create student error:", error);

            // Handle Sequelize validation errors
            if (error.name === "SequelizeValidationError") {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: error.errors.map((e) => ({field: e.path, message: e.message, value: e.value, type: e.type}))
                });
            }

            // Handle Sequelize unique constraint errors
            if (error.name === "SequelizeUniqueConstraintError") {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate entry",
                    errors: error.errors.map((e) => ({field: e.path, message: e.message, value: e.value}))
                });
            }

            // Handle Sequelize database errors
            if (error.name === "SequelizeDatabaseError") {
                return res.status(400).json({
                    success: false,
                    message: "Database error",
                    error: error.message,
                    details: error.parent ? error.parent.sqlMessage : undefined
                });
            }

            // Handle foreign key constraint errors
            if (error.name === "SequelizeForeignKeyConstraintError") {
                return res.status(400).json({success: false, message: "Foreign key constraint error", error: "Referenced record does not exist", field: error.fields});
            }

            // Generic error handler
            res.status(500).json({
                success: false, message: "Error creating student", error: error.message,
                // Only in development
                debug: process.env.NODE_ENV === "development" ? {
                    name: error.name,
                    stack: error.stack
                } : undefined
            });
        }
    }
    async uploadExcelAndInsert(req, res) {
        try { // Check if file exists
            if (!req.file) {
                return res.status(400).json({success: false, message: "No file uploaded"});
            }

            const filePath = req.file.path;
            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            let data = [];

            // Read file based on type
            if (fileExtension === '.csv') { // Read CSV file with UTF-8 encoding for Khmer characters
                const fileBuffer = fs.readFileSync(filePath);

                // Try to detect and handle BOM (Byte Order Mark)
                let fileContent;
                if (fileBuffer[0] === 0xEF && fileBuffer[1] === 0xBB && fileBuffer[2] === 0xBF) { // UTF-8 with BOM
                    fileContent = fileBuffer.toString('utf8').substring(1);
                } else {
                    fileContent = fileBuffer.toString('utf8');
                }

                // Parse CSV with proper encoding
                const workbook = xlsx.read(fileContent, {
                    type: 'string',
                    raw: false,
                    codepage: 65001 // UTF-8 codepage
                });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = xlsx.utils.sheet_to_json(worksheet, {defval: ''});

            } else { // Read Excel file (.xlsx, .xls)
                const workbook = xlsx.readFile(filePath, {
                    cellText: false,
                    cellDates: true
                });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = xlsx.utils.sheet_to_json(worksheet, {defval: ''});
            }

            // Validate data
            if (data.length === 0) {
                fs.unlinkSync(filePath);
                return res.status(400).json({success: false, message: "File is empty"});
            }

            // Normalize column names (trim and lowercase)
            const normalizedData = data.map((row) => {
                const normalized = {};
                for (let key in row) {
                    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
                    // Ensure values are properly encoded
                    normalized[normalizedKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
                }
                return normalized;
            });

            // Insert data into database// Validate required fields
            const results = {
                success: [],
                failed: [],
                duplicates: []
            };
            // Validate required fields

            for (let row of normalizedData) {
                try {
                    if (! row.class_id && ! row.classid) {
                        throw new Error("class_id is required");
                    }
                    if (! row.student_name_kh && ! row.name_kh && ! row.namekh) {
                        throw new Error("student_name_kh is required");
                    }
                    if (! row.student_name_eng && ! row.name_eng && ! row.nameeng) {
                        throw new Error("student_name_eng is required");
                    }

                    const classId = row.class_id || row.classid;
                    const studentNameKh = (row.student_name_kh || row.name_kh || row.namekh);
                    const studentNameEng = (row.student_name_eng || row.name_eng || row.nameeng);

                    // Log to verify encoding (remove after testing)
                    console.log('Processing student:', {
                        nameKh: studentNameKh,
                        nameEng: studentNameEng,
                        buffer: Buffer.from(studentNameKh, 'utf8')
                    });

                    // Check if class exists
                    const classExists = await Class.findByPk(classId);
                    if (! classExists) {
                        throw new Error(`Class ID ${classId} not found`);
                    }

                    // Validate gender if provided
                    const gender = row.gender ? row.gender.toUpperCase() : null;
                    if (gender && !["M", "F", "O"].includes(gender)) {
                        throw new Error("Gender must be M, F, or O");
                    }

                    // Check for duplicate student (by Khmer name and class)
                    const existingStudent = await Student.findOne({
                        where: {
                            student_name_kh: studentNameKh,
                            class_id: classId
                        }
                    });

                    if (existingStudent) { // Student already exists - skip
                        results.duplicates.push({row: row, message: `Student '${studentNameKh}' already exists in class ${classId}`, existing_student_id: existingStudent.student_id});
                        continue;
                    }

                    // Create student
                    const student = await Student.create({class_id: classId, student_name_kh: studentNameKh, student_name_eng: studentNameEng, gender: gender});

                    // Fetch student with class details
                    const studentWithClass = await Student.findByPk(student.student_id, {
                        include: [
                            {
                                model: Class,
                                as: "class"
                            }
                        ]
                    });

                    results.success.push({row: row, student_id: student.student_id, student: studentWithClass});

                } catch (err) {
                    console.error("Row error:", err);

                    results.failed.push({
                        row: row,
                        error: err.message,
                        validationErrors: err.errors ? err.errors.map((e) => ({field: e.path, message: e.message, value: e.value})) : undefined
                    });
                }
            }

            // Delete the uploaded file after processing
            fs.unlinkSync(filePath);

            res.status(200).json({
                success: true,
                message: "File data processed",
                summary: {
                    total: normalizedData.length,
                    success: results.success.length,
                    duplicates: results.duplicates.length,
                    failed: results.failed.length
                },
                results: results
            });

        } catch (err) { // Clean up file if error occurs
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error("Upload file error:", err);

            res.status(500).json({
                success: false,
                message: "Server error",
                error: err.message,
                validationErrors: err.errors ? err.errors.map((e) => ({field: e.path, message: e.message, value: e.value, type: e.type})) : undefined,
                debug: process.env.NODE_ENV === "development" ? err.stack : undefined
            });
        }
    }


    // Bulk Insert (Better Performance for Large Files)
    async uploadExcelBulkInsert(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({success: false, message: "No file uploaded"});
            }

            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                fs.unlinkSync(filePath);
                return res.status(400).json({success: false, message: "Excel file is empty"});
            }

            // Normalize column names
            const normalizedData = data.map((row) => {
                const normalized = {};
                for (let key in row) {
                    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
                    normalized[normalizedKey] = row[key];
                }
                return normalized;
            });

            // Validate all class IDs exist first
            const classIds = [
                ...new Set(normalizedData.map((row) => row.class_id || row.classid)),
            ];
            const existingClasses = await Class.findAll({
                where: {
                    class_id: classIds
                },
                attributes: ["class_id"]
            });
            const existingClassIds = existingClasses.map((c) => c.class_id);
            const invalidClassIds = classIds.filter((id) => ! existingClassIds.includes(id),);

            if (invalidClassIds.length > 0) {
                fs.unlinkSync(filePath);
                return res.status(400).json({success: false, message: "Invalid class IDs found", invalid_class_ids: invalidClassIds});
            }

            // Map data to match model structure
            const students = normalizedData.map((row) => {
                const gender = row.gender ? row.gender.toUpperCase() : null;

                return {
                    class_id: row.class_id || row.classid,
                    student_name_kh: row.student_name_kh || row.name_kh || row.namekh,
                    student_name_eng: row.student_name_eng || row.name_eng || row.nameeng,
                    gender: gender && ["M", "F", "O"].includes(gender) ? gender : null
                };
            });

            // Bulk insert with validation
            const result = await Student.bulkCreate(students, {
                validate: true,
                returning: true
            });

            const studentIds = result.map((s) => s.student_id);
            const studentsWithClass = await Student.findAll({
                where: {
                    student_id: studentIds
                },
                include: [
                    {
                        model: Class,
                        as: "class",
                        include: [
                            {
                                model: Subject,
                                as: "subject"
                            }, {
                                model: Teacher,
                                as: "teachers"
                            },
                        ]
                    },
                ]
            });

            // Delete uploaded file
            fs.unlinkSync(filePath);

            res.status(200).json({success: true, message: "Students inserted successfully", count: result.length, data: studentsWithClass});
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error("Bulk upload error:", err);

            // Enhanced error response
            res.status(500).json({
                success: false,
                message: "Server error",
                error: err.message,
                validationErrors: err.errors ? err.errors.map((e) => ({field: e.path, message: e.message, value: e.value, type: e.type})) : undefined,
                failedRow: err.instance ? err.instance.dataValues : undefined,
                debug: process.env.NODE_ENV === "development" ? err.stack : undefined
            });
        }
    }
    // Update student
    async updateStudent(req, res) {
        try {
            const {id} = req.params;
            const errors = validationResult(req);

            if (! errors.isEmpty()) {
                return res.status(400).json({success: false, errors: errors.array()});
            }

            const student = await Student.findByPk(id);

            if (! student) {
                return res.status(404).json({success: false, message: "Student not found"});
            }

            // Check if class exists if class_id is being updated
            if (req.body.class_id) {
                const classExists = await Class.findByPk(req.body.class_id);
                if (! classExists) {
                    return res.status(404).json({success: false, message: "Class not found"});
                }
            }

            await student.update(req.body);

            const updatedStudent = await Student.findByPk(id, {
                include: [
                    {
                        model: Class,
                        as: "class"
                    },
                ]
            });

            res.status(200).json({success: true, message: "Student updated successfully", data: updatedStudent});
        } catch (error) {
            console.error("Update student error:", error);
            res.status(500).json({success: false, message: "Error updating student", error: error.message});
        }
    }

    // Delete student
    async deleteStudent(req, res) {
        try {
            const {id} = req.params;

            const student = await Student.findByPk(id);

            if (! student) {
                return res.status(404).json({success: false, message: "Student not found"});
            }

            await student.destroy();

            res.status(200).json({success: true, message: "Student deleted successfully"});
        } catch (error) {
            console.error("Delete student error:", error);
            res.status(500).json({success: false, message: "Error deleting student", error: error.message});
        }
    }
}

module.exports = new StudentController();
