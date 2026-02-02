const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const sequelize = require("../config/database");
const {Op} = require("sequelize");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const {parse} = require('csv-parse/sync');
const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  handleSequelizeError,
  asyncHandler,
  checkValidation
} = require("../middlewares/response.middleware");

// function excelDateToJSDate(excelDate) {
//     if (! excelDate)
//         return null;


//     if (typeof excelDate === "string") {
//         const date = new Date(excelDate);
//         return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
//     }

//     if (typeof excelDate === "number") {
//         const excelEpoch = new Date(1899, 11, 30);
//         const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
//         return jsDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
//     }

//     return null;
// }
class StudentController {
    // Get all students
    getAllStudents = asyncHandler(async (req, res) => {
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
                },
                {
                    student_name_eng: {
                        [Op.like]: `%${search}%`
                    }
                }
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

        return sendSuccess(res, rows, "Students fetched successfully", 200, {
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    });
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
    getStudentDetail = asyncHandler(async (req, res) => {
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

        if (!student) {
            return sendNotFound(res, "Student");
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
            ...student.toJSON(),
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

        return sendSuccess(res, studentDetail, "Student details fetched successfully");
    });
    // Create student
    createStudent = asyncHandler(async (req, res) => {
        // Check express-validator errors
        if (!checkValidation(req, res)) {
            return;
        }

        // Check if class exists
        const classExists = await Class.findByPk(req.body.class_id);
        if (!classExists) {
            return sendNotFound(res, "Class");
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

        return sendSuccess(res, studentWithClass, "Student created successfully", 201);
    });
    uploadExcelAndInsert = asyncHandler(async (req, res) => {
        // Check if file exists
        if (!req.file) {
            return sendError(res, "No file uploaded", 400);
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
                    codepage: 65001
                });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = xlsx.utils.sheet_to_json(worksheet, {defval: ''});

            } else {
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
                return sendError(res, "File is empty", 400);
            }
            // Normalize column names (trim and lowercase)
            const normalizedData = data.map((row) => {
                const normalized = {};
                for (let key in row) {
                    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
                    normalized[normalizedKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
                }
                return normalized;
            });
            // cating default class when student have Class Code is Empty
            let defaultClass = await Class.findOne({
                where: {
                    class_code: 'UNASSIGNED'
                }
            });
            // If class doesn't exist, create it
            if (! defaultClass) {
                defaultClass = await Class.create({class_code: 'UNASSIGNED', class_name: 'Unassigned Students'});
            }

            if (!defaultClass) {
                fs.unlinkSync(filePath);
                return sendError(res, "No classes found in database. Please create at least one class first.", 400);
            }

            // Insert data into database
            const results = {
                success: [],
                failed: [],
                duplicates: [],
                classesCreated: [],
                assignedToDefault: []
            };

            for (let row of normalizedData) {
                try { // Validate required student name fields
                    if (! row.student_name_kh && ! row.name_kh && ! row.namekh) {
                        throw new Error("student_name_kh is required");
                    }
                    if (! row.student_name_eng && ! row.name_eng && ! row.nameeng) {
                        throw new Error("student_name_eng is required");
                    }

                    const studentNameKh = (row.student_name_kh || row.name_kh || row.namekh);
                    const studentNameEng = (row.student_name_eng || row.name_eng || row.nameeng);
                    let classCode = row.class_code || row.classcode;

                    // Log to verify encoding
                    console.log('Processing student:', {
                        classCode: classCode,
                        nameKh: studentNameKh,
                        nameEng: studentNameEng
                    });

                    let classRecord = null;
                    let wasAssignedToDefault = false;

                    // Check if class_code is empty or not provided
                    if (! classCode || classCode === '') { // Use the first available class from database
                        classRecord = defaultClass;
                        classCode = defaultClass.class_code;
                        wasAssignedToDefault = true;

                        results.assignedToDefault.push({student_name_kh: studentNameKh, student_name_eng: studentNameEng, assigned_class_code: classCode, message: `Assigned to default class '${classCode}' (class_code was empty)`});

                        console.log(`Assigned student ${studentNameKh} to default class ${classCode}`);
                    } else { // Class code is provided, check if class exists by class_code
                        classRecord = await Class.findOne({
                            where: {
                                class_code: classCode
                            }
                        });

                        // If class doesn't exist, create it automatically
                        if (! classRecord) {
                            try {
                                classRecord = await Class.create({class_code: classCode});

                                results.classesCreated.push({class_code: classCode, class_id: classRecord.class_id, message: `Class '${classCode}' created automatically`});
                                console.log(`Auto-created class: ${classCode} with ID: ${
                                    classRecord.class_id
                                }`);
                            } catch (classCreateError) {
                                throw new Error(`Failed to create class '${classCode}': ${
                                    classCreateError.message
                                }`);
                            }
                        }
                    }

                    // Validate gender if provided
                    const gender = row.gender ? row.gender.toUpperCase() : null;
                    if (gender && !["M", "F", "O"].includes(gender)) {
                        throw new Error("Gender must be M, F, or O");
                    }

                    // Check for duplicate student (by Khmer name and class_id)
                    const existingStudent = await Student.findOne({
                        where: {
                            student_name_kh: studentNameKh,
                            class_id: classRecord.class_id
                        }
                    });

                    if (existingStudent) { // Student already exists - skip
                        results.duplicates.push({row: row, message: `Student '${studentNameKh}' already exists in class ${classCode}`, existing_student_id: existingStudent.student_id, was_assigned_to_default: wasAssignedToDefault});
                        continue;
                    }

                    // Create student with the class_id from the found/created class
                    const student = await Student.create({class_id: classRecord.class_id, student_name_kh: studentNameKh, student_name_eng: studentNameEng, gender: gender});

                    // Fetch student with class details
                    const studentWithClass = await Student.findByPk(student.student_id, {
                        include: [
                            {
                                model: Class,
                                as: "class"
                            }
                        ]
                    });

                    results.success.push({
                        row: row,
                        student_id: student.student_id,
                        student: studentWithClass,
                        was_assigned_to_default: wasAssignedToDefault,
                        assigned_class_code: wasAssignedToDefault ? classCode : null
                    });

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

            return sendSuccess(res, {
                summary: {
                    total: normalizedData.length,
                    success: results.success.length,
                    duplicates: results.duplicates.length,
                    failed: results.failed.length,
                    classesCreated: results.classesCreated.length,
                    assignedToDefault: results.assignedToDefault.length
                },
                defaultClassUsed: {
                    class_code: defaultClass.class_code,
                    class_id: defaultClass.class_id
                },
                results: results
            }, "File data processed successfully");
    });


    // Bulk Insert (Better Performance for Large Files)
    uploadExcelBulkInsert = asyncHandler(async (req, res) => {
        if (!req.file) {
            return sendError(res, "No file uploaded", 400);
        }

            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                fs.unlinkSync(filePath);
                return sendError(res, "Excel file is empty", 400);
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
                return sendError(res, "Invalid class IDs found", 400, { invalid_class_ids: invalidClassIds });
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

            return sendSuccess(res, studentsWithClass, "Students inserted successfully", 200, {
                count: result.length
            });
    });
    // Update student
    updateStudent = asyncHandler(async (req, res) => {
        const {id} = req.params;

        if (!checkValidation(req, res)) {
            return;
        }

        const student = await Student.findByPk(id);

        if (!student) {
            return sendNotFound(res, "Student");
        }

        // Check if class exists if class_id is being updated
        if (req.body.class_id) {
            const classExists = await Class.findByPk(req.body.class_id);
            if (!classExists) {
                return sendNotFound(res, "Class");
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

        return sendSuccess(res, updatedStudent, "Student updated successfully");
    });

    // Delete student
    deleteStudent = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const student = await Student.findByPk(id);

        if (!student) {
            return sendNotFound(res, "Student");
        }

        await student.destroy();

        return sendSuccess(res, null, "Student deleted successfully");
    });
}

module.exports = new StudentController();
