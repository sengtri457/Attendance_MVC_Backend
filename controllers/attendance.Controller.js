require('dotenv').config();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const {Op} = require("sequelize");
const sequelize = require("../config/database");
const axios = require("axios");
const {
    sendSuccess,
    sendError,
    sendNotFound,
    sendValidationError,
    sendConflict,
    asyncHandler,
    checkValidation
} = require("../middlewares/response.middleware");

// ── Telegram
async function sendTelegramMessage(text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (! token || ! chatId) 
        return;
    


    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error('[Telegram] Failed to send notification:', err ?. response ?. data || err.message);
    }
}

class AttendanceController {
    getAllAttendance = asyncHandler(async (req, res) => {
        const {
            page = 1,
            limit = 20,
            student_id,
            class_id,
            date_from,
            date_to,
            status
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        if (student_id) 
            whereClause.student_id = student_id;
        


        if (status) 
            whereClause.status = status;
        


        if (date_from || date_to) {
            whereClause.attendance_date = {};
            if (date_from) 
                whereClause.attendance_date[Op.gte] = date_from;
            


            if (date_to) 
                whereClause.attendance_date[Op.lte] = date_to;
            


        }

        const {count, rows} = await Attendance.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Student,
                    as: "student",
                    attributes: [
                        "student_id", "student_name_kh", "student_name_eng", "class_id",
                    ],
                    ...(class_id && {
                        where: {
                            class_id: class_id
                        }
                    }),
                    include: [
                        {
                            model: Class,
                            as: "class",
                            attributes: ["class_id", "class_code"]
                        },
                    ]
                }, {
                    model: Teacher,
                    as: "teacher",
                    attributes: ["teacher_id", "teacher_name_eng"]
                },
            ],
            order: [
                [
                    "attendance_date", "DESC"
                ],
                [
                    "created_at", "DESC"
                ],
            ]
        });

        return sendSuccess(res, rows, "Attendance records fetched successfully", 200, {
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    });

    // Get attendance by ID
    getAttendanceById = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const attendance = await Attendance.findByPk(id, {
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: Class,
                            as: "class"
                        },
                    ]
                }, {
                    model: Subject,
                    as: "subject"
                }, {
                    model: Teacher,
                    as: "teacher"
                },
            ]
        });

        if (! attendance) {
            return sendNotFound(res, "Attendance record");
        }

        return sendSuccess(res, attendance, "Attendance record fetched successfully");
    });

    // Create single attendance record
    createAttendance = asyncHandler(async (req, res) => {
        if (!checkValidation(req, res)) {
            return;
        }

        // Verify student exists
        const student = await Student.findByPk(req.body.student_id);
        if (! student) {
            return sendNotFound(res, "Student");
        }

        // Verify teacher exists
        const teacher = await Teacher.findByPk(req.body.teacher_id);
        if (! teacher) {
            return sendNotFound(res, "Teacher");
        }

        // Verify subject exists (now required)
        const subject = await Subject.findByPk(req.body.subject_id);
        if (! subject) {
            return sendNotFound(res, "Subject");
        }

        const attendance = await Attendance.create(req.body);

        const attendanceWithDetails = await Attendance.findByPk(attendance.attendance_id, {
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: Class,
                            as: "class"
                        }
                    ]
                }, {
                    model: Subject,
                    as: "subject"
                }, {
                    model: Teacher,
                    as: "teacher"
                },
            ]
        });

        return sendSuccess(res, attendanceWithDetails, "Attendance recorded successfully", 201);
    });

    // Bulk create attendance for multiple students (for one subject/session)
    bulkCreateAttendance = asyncHandler(async (req, res) => {
        if (!checkValidation(req, res)) {
            return;
        }

        const {
            teacher_id,
            subject_id,
            attendance_date,
            session,
            records
        } = req.body;

        // Verify teacher exists
        const teacher = await Teacher.findByPk(teacher_id);
        if (! teacher) {
            return sendNotFound(res, "Teacher");
        }

        // Verify subject exists
        const subject = await Subject.findByPk(subject_id);
        if (! subject) {
            return sendNotFound(res, "Subject");
        }

        // Prepare attendance records
        const attendanceRecords = records.map((record) => ({
            student_id: record.student_id,
            teacher_id,
            subject_id,
            attendance_date,
            session: session || "morning",
            status: record.status || "P",
            notes: record.notes || null
        }));

        // Use transaction for bulk insert
        const results = await sequelize.transaction(async (t) => {
            return await Promise.allSettled(attendanceRecords.map((record) => Attendance.upsert(record, {
                conflictFields: [
                    "student_id", "attendance_date", "subject_id", "session",
                ],
                transaction: t
            }),),);
        });

        const successful = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return sendSuccess(res, {
            summary: {
                total: records.length,
                successful,
                failed
            }
        }, `Bulk attendance recorded: ${successful} successful, ${failed} failed`, 201);
    });
    submitBatch = asyncHandler(async (req, res) => {
        const {
            updates = [],
            class_name = 'Unknown Class'
        } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return sendError(res, 'updates array is required and must not be empty', 400);
        }

        // ── 1. Collect unique IDs so we can bulk-fetch names ─────────────────
        const studentIds = [...new Set(updates.map(u => u.student_id))];
        const subjectIds = [...new Set(updates.map(u => u.subject_id).filter(Boolean))];

        const [students, subjects] = await Promise.all([
            Student.findAll(
                {
                    where: {
                        student_id: studentIds
                    },
                    attributes: ['student_id', 'student_name_eng']
                }
            ),
            subjectIds.length ? Subject.findAll(
                {
                    where: {
                        subject_id: subjectIds
                    },
                    attributes: ['subject_id', 'subject_name']
                }
            ) : Promise.resolve([]),
        ]);

        const studentMap = Object.fromEntries(students.map(s => [s.student_id, s.student_name_eng]));
        const subjectMap = Object.fromEntries(subjects.map(s => [s.subject_id, s.subject_name]));

        // ── 2. Upsert all records inside a transaction ────────────────────────
        const results = await sequelize.transaction(async (t) => {
            return Promise.allSettled(updates.map((u) => Attendance.upsert({
                student_id: u.student_id,
                teacher_id: u.teacher_id,
                subject_id: u.subject_id || null,
                attendance_date: u.attendance_date,
                status: u.status,
                session: u.session || 'morning',
                notes: u.notes || null
            }, {
                conflictFields: [
                    'student_id', 'attendance_date', 'subject_id', 'session'
                ],
                transaction: t
            })));
        });

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // ── 3. Build Telegram message ─────────────────────────────────────────
        // Group: date → subject → status → [student names]
        const groups = {};
        updates.forEach((u) => {
            const date = u.attendance_date;
            const subjectName = subjectMap[u.subject_id] || 'General';
            const status = u.status;
            const studentName = studentMap[u.student_id] || `Student #${
                u.student_id
            }`;

            if (! groups[date]) 
                groups[date] = {};
            


            if (! groups[date][subjectName]) 
                groups[date][subjectName] = {};
            


            if (! groups[date][subjectName][status]) 
                groups[date][subjectName][status] = [];
            


            groups[date][subjectName][status].push(studentName);
        });

        const formatDate = (d) => {
            const obj = new Date(d);
            return obj.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        };

        const statusEmoji = {
            P: '✅',
            A: '❌',
            L: '⏰',
            E: '📝'
        };
        const statusLabel = {
            P: 'Present',
            A: 'Absent',
            L: 'Late',
            E: 'Excused'
        };

        let message = `📢 *Attendance Submitted*\n\n🏫 Class: *${class_name}*\n👥 Total Records: *${
            updates.length
        }*`;

        Object.entries(groups).forEach(([date, subjectObj]) => {
            message += `\n\n📅 *${
                formatDate(date)
            }*`;
            Object.entries(subjectObj).forEach(([subject, statusObj]) => {
                message += `\n\n📚 *${subject}*`;
                ['P', 'A', 'L', 'E'].forEach((s) => {
                    const names = statusObj[s];
                    if (names && names.length > 0) {
                        message += `\n${
                            statusEmoji[s]
                        } *${
                            statusLabel[s]
                        } (${
                            names.length
                        }):*\n`;
                        names.forEach((n) => (message += `  \\- ${n}\n`));
                    }
                });
            });
        });

        // ── 4. Fire Telegram (non-blocking — don't fail the HTTP response) ────
        sendTelegramMessage(message).catch(() => {});

        // ── 5. Respond ────────────────────────────────────────────────────────
        return sendSuccess(res, {
            summary: {
                total: updates.length,
                successful,
                failed
            }
        }, `Batch attendance submitted: ${successful} successful, ${failed} failed`, 201);
    });

    // Update attendance
    updateAttendance = asyncHandler(async (req, res) => {
        const {id} = req.params;

        if (!checkValidation(req, res)) {
            return;
        }

        const attendance = await Attendance.findByPk(id);

        if (! attendance) {
            return sendNotFound(res, "Attendance record");
        }

        await attendance.update(req.body);

        const updatedAttendance = await Attendance.findByPk(id, {
            include: [
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: Class,
                            as: "class"
                        }
                    ]
                }, {
                    model: Subject,
                    as: "subject"
                }, {
                    model: Teacher,
                    as: "teacher"
                },
            ]
        });

        return sendSuccess(res, updatedAttendance, "Attendance updated successfully");
    });

    // Delete attendance
    deleteAttendance = asyncHandler(async (req, res) => {
        const {id} = req.params;

        const attendance = await Attendance.findByPk(id);

        if (! attendance) {
            return sendNotFound(res, "Attendance record");
        }

        await attendance.destroy();

        return sendSuccess(res, null, "Attendance record deleted successfully");
    });

    // ==================== REPORTING METHODS ====================

    // Get daily attendance report
    getDailyReport = asyncHandler(async (req, res) => {
        const {date, class_id} = req.query;

        if (!date) {
            return sendError(res, "Date parameter is required", 400);
        }

        const whereClause = {
            attendance_date: date
        };

        const studentInclude = {
            model: Student,
            as: "student",
            attributes: [
                "student_id", "student_name_kh", "student_name_eng", "class_id",
            ],
            include: [
                {
                    model: Class,
                    as: "class",
                    attributes: ["class_id", "class_code"]
                },
            ]
        };

        if (class_id) {
            studentInclude.where = {
                class_id: class_id
            };
        }

        const attendanceRecords = await Attendance.findAll({
            where: whereClause,
            include: [
                studentInclude, {
                    model: Teacher,
                    as: "teacher",
                    attributes: ["teacher_id", "teacher_name_eng"]
                }, {
                    model: Subject,
                    as: "subject",
                    attributes: ["subject_id", "subject_name"]
                },
            ],
            order: [
                ["student", "student_name_eng", "ASC"]
            ]
        });

        const stats = await Attendance.findAll({
            where: whereClause,
            attributes: [
                "status",
                [
                    sequelize.fn("COUNT", sequelize.col("status")),
                    "count"
                ],
            ],
            ...(class_id && {
                include: [
                    {
                        model: Student,
                        as: "student",
                        attributes: [],
                        where: {
                            class_id: class_id
                        }
                    },
                ]
            }),
            group: ["status"],
            raw: true
        });

        const statusCounts = {
            P: 0,
            A: 0,
            L: 0,
            E: 0
        };

        stats.forEach((stat) => {
            statusCounts[stat.status] = parseInt(stat.count);
        });

        const totalRecords = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        return sendSuccess(res, {
            date,
            class_id: class_id || "all",
            records: attendanceRecords,
            statistics: {
                total: totalRecords,
                present: statusCounts.P,
                absent: statusCounts.A,
                late: statusCounts.L,
                excused: statusCounts.E,
                attendance_rate: totalRecords > 0 ? (
                    (statusCounts.P / totalRecords) * 100
                ).toFixed(2) + "%" : "0%"
            }
        }, "Daily report generated successfully");
    });

    // Get weekly attendance report
    async getWeeklyReport(req, res) {
        try {
            const {start_date, end_date, class_id} = req.query;

            if (!start_date || !end_date) {
                return res.status(400).json({success: false, message: "start_date and end_date parameters are required"});
            }

            const whereClause = {
                attendance_date: {
                    [Op.between]: [start_date, end_date]
                }
            };

            const studentInclude = {
                model: Student,
                as: "student",
                attributes: [
                    "student_id", "student_name_kh", "student_name_eng", "class_id",
                ],
                include: [
                    {
                        model: Class,
                        as: "class",
                        attributes: ["class_id", "class_code"]
                    },
                ]
            };

            if (class_id) {
                studentInclude.where = {
                    class_id: class_id
                };
            }

            const dailyStats = await Attendance.findAll({
                where: whereClause,
                attributes: [
                    "attendance_date",
                    "status",
                    [
                        sequelize.fn("COUNT", sequelize.col("status")),
                        "count"
                    ],
                ],
                ...(class_id && {
                    include: [
                        {
                            model: Student,
                            as: "student",
                            attributes: [],
                            where: {
                                class_id: class_id
                            }
                        },
                    ]
                }),
                group: [
                    "attendance_date", "status"
                ],
                order: [
                    ["attendance_date", "ASC"]
                ],
                raw: true
            });

            const overallStats = await Attendance.findAll({
                where: whereClause,
                attributes: [
                    "status",
                    [
                        sequelize.fn("COUNT", sequelize.col("status")),
                        "count"
                    ],
                ],
                ...(class_id && {
                    include: [
                        {
                            model: Student,
                            as: "student",
                            attributes: [],
                            where: {
                                class_id: class_id
                            }
                        },
                    ]
                }),
                group: ["status"],
                raw: true
            });

            const dailyBreakdown = {};
            dailyStats.forEach((stat) => {
                const date = stat.attendance_date;
                if (! dailyBreakdown[date]) {
                    dailyBreakdown[date] = {
                        P: 0,
                        A: 0,
                        L: 0,
                        E: 0
                    };
                }
                dailyBreakdown[date][stat.status] = parseInt(stat.count);
            });

            const statusCounts = {
                P: 0,
                A: 0,
                L: 0,
                E: 0
            };

            overallStats.forEach((stat) => {
                statusCounts[stat.status] = parseInt(stat.count);
            });

            const totalRecords = Object.values(statusCounts).reduce((a, b) => a + b, 0,);

            res.status(200).json({
                success: true,
                data: {
                    period: {
                        start_date,
                        end_date
                    },
                    class_id: class_id || "all",
                    daily_breakdown: dailyBreakdown,
                    overall_statistics: {
                        total: totalRecords,
                        present: statusCounts.P,
                        absent: statusCounts.A,
                        late: statusCounts.L,
                        excused: statusCounts.E,
                        attendance_rate: totalRecords > 0 ? (
                            (statusCounts.P / totalRecords) * 100
                        ).toFixed(2) + "%" : "0%"
                    }
                }
            });
        } catch (error) {
            console.error("Weekly report error:", error);
            res.status(500).json({success: false, message: "Error generating weekly report", error: error.message});
        }
    }

    // Get student attendance summary
    async getStudentSummary(req, res) {
        try {
            const {student_id, start_date, end_date} = req.query;

            if (!student_id) {
                return res.status(400).json({success: false, message: "student_id parameter is required"});
            }

            const whereClause = {
                student_id
            };

            if (start_date && end_date) {
                whereClause.attendance_date = {
                    [Op.between]: [start_date, end_date]
                };
            }

            const student = await Student.findByPk(student_id, {
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

            const stats = await Attendance.findAll({
                where: whereClause,
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

            stats.forEach((stat) => {
                statusCounts[stat.status] = parseInt(stat.count);
            });

            const totalRecords = Object.values(statusCounts).reduce((a, b) => a + b, 0,);

            const recentRecords = await Attendance.findAll({
                where: whereClause,
                include: [
                    {
                        model: Teacher,
                        as: "teacher",
                        attributes: ["teacher_id", "teacher_name_eng"]
                    }, {
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

            res.status(200).json({
                success: true,
                data: {
                    student: {
                        student_id: student.student_id,
                        student_name_kh: student.student_name_kh,
                        student_name_eng: student.student_name_eng,
                        class: student.class
                    },
                    period: start_date && end_date ? {
                        start_date,
                        end_date
                    } : "all_time",
                    statistics: {
                        total_days: totalRecords,
                        present: statusCounts.P,
                        absent: statusCounts.A,
                        late: statusCounts.L,
                        excused: statusCounts.E,
                        attendance_rate: totalRecords > 0 ? (
                            (statusCounts.P / totalRecords) * 100
                        ).toFixed(2) + "%" : "0%"
                    },
                    recent_records: recentRecords
                }
            });
        } catch (error) {
            console.error("Student summary error:", error);
            res.status(500).json({success: false, message: "Error generating student attendance summary", error: error.message});
        }
    }
    // ==================== HELPER METHODS ====================

    getDayStats = async (date, class_id) => {
        const whereClause = {
            attendance_date: date
        };

        const records = await Attendance.findAll({
            where: whereClause,
            attributes: [
                "student_id", "status"
            ],
            ...(class_id && {
                include: [
                    {
                        model: Student,
                        as: "student",
                        attributes: [],
                        where: {
                            class_id
                        }
                    },
                ]
            }),
            raw: true
        });

        // Group by student to aggregate daily status
        const studentMap = {};
        records.forEach(r => {
            if (! studentMap[r.student_id]) 
                studentMap[r.student_id] = [];
            


            studentMap[r.student_id].push(r.status);
        });

        const result = {
            date,
            P: 0,
            A: 0,
            L: 0,
            E: 0,
            total: 0
        };

        Object.values(studentMap).forEach(statuses => {
            let status = 'P';
            // Default if strictly present
            // Priority: Absent > Late > Excused > Present
            if (statuses.includes('A')) 
                status = 'A';
             else if (statuses.includes('L')) 
                status = 'L';
             else if (statuses.includes('E')) 
                status = 'E';
             else if (statuses.every(s => s === 'P')) 
                status = 'P';
            


            // If mixed without A/L/E (rare/impossible?), defaults to P or check logic.
            // Logic mirrors frontend: if any A -> A.

            if (result[status] !== undefined) {
                result[status]++;
                result.total ++;
            }
        });

        result.attendance_rate = result.total > 0 ? ((result.P / result.total) * 100).toFixed(1) + "%" : "0.0%";

        return result;
    };

    async getPeriodStats(start_date, end_date, class_id) {
        const whereClause = {
            attendance_date: {
                [Op.between]: [start_date, end_date]
            }
        };

        const records = await Attendance.findAll({
            where: whereClause,
            attributes: [
                "attendance_date", "student_id", "status"
            ],
            ...(class_id && {
                include: [
                    {
                        model: Student,
                        as: "student",
                        attributes: [],
                        where: {
                            class_id
                        }
                    },
                ]
            }),
            raw: true
        });

        // Group by date and student
        const dailyStudentStatus = {}; // key: "date_studentId" -> [statuses]
        records.forEach(r => {
            const key = `${
                r.attendance_date
            }_${
                r.student_id
            }`;
            if (! dailyStudentStatus[key]) 
                dailyStudentStatus[key] = [];
            


            dailyStudentStatus[key].push(r.status);
        });

        const result = {
            start_date,
            end_date,
            P: 0,
            A: 0,
            L: 0,
            E: 0,
            total: 0
        };

        Object.values(dailyStudentStatus).forEach(statuses => {
            let status = 'P';
            // Priority: Absent > Late > Excused > Present
            if (statuses.includes('A')) 
                status = 'A';
             else if (statuses.includes('L')) 
                status = 'L';
             else if (statuses.includes('E')) 
                status = 'E';
             else if (statuses.every(s => s === 'P')) 
                status = 'P';
            


            if (result[status] !== undefined) {
                result[status]++;
                result.total ++;
            }
        });

        result.attendance_rate = result.total > 0 ? ((result.P / result.total) * 100).toFixed(1) + "%" : "0.0%";

        return result;
    }

    async getStudentsAtRisk(class_id) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const students = await Student.findAll({
            ...(class_id && {
                where: {
                    class_id
                }
            }),
            include: [
                {
                    model: Attendance,
                    as: "attendances",
                    where: {
                        attendance_date: {
                            [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0]
                        }
                    },
                    required: false
                },
            ]
        });

        const atRisk = students.map((student) => {
            const attendances = student.attendances || [];
            const present = attendances.filter((a) => a.status === "P").length;
            const total = attendances.length;
            const rate = total > 0 ? (present / total) * 100 : 100;

            return {
                student_id: student.student_id,
                student_name_eng: student.student_name_eng,
                student_name_kh: student.student_name_kh,
                attendance_rate: rate.toFixed(1) + "%",
                days_present: present,
                total_days: total
            };
        }).filter((s) => parseFloat(s.attendance_rate) < 75).sort((a, b) => parseFloat(a.attendance_rate) - parseFloat(b.attendance_rate),);

        return atRisk;
    }
    // Get class attendance summary
    async getClassSummary(req, res) {
        try {
            const {class_id, date} = req.query;

            if (!class_id) {
                return res.status(400).json({success: false, message: "class_id parameter is required"});
            }

            const classInfo = await Class.findByPk(class_id);

            if (! classInfo) {
                return res.status(404).json({success: false, message: "Class not found"});
            }

            const whereClause = date ? {
                attendance_date: date
            } : {};

            const students = await Student.findAll({
                where: {
                    class_id
                },
                include: [
                    {
                        model: Attendance,
                        as: "attendances",
                        where: whereClause,
                        required: false,
                        include: [
                            {
                                model: Subject,
                                as: "subject",
                                attributes: ["subject_id", "subject_name"]
                            },
                        ]
                    },
                ],
                order: [
                    ["student_name_eng", "ASC"]
                ]
            });

            let presentCount = 0;
            let absentCount = 0;
            let lateCount = 0;
            let excusedCount = 0;
            let noRecordCount = 0;

            const studentSummary = students.map((student) => {
                const attendance = student.attendances && student.attendances.length > 0 ? student.attendances[0] : null;

                if (attendance) {
                    switch (attendance.status) {
                        case "P": presentCount++;
                            break;
                        case "A": absentCount++;
                            break;
                        case "L": lateCount++;
                            break;
                        case "E": excusedCount++;
                            break;
                    }
                } else {
                    noRecordCount++;
                }

                return {
                    student_id: student.student_id,
                    student_name_kh: student.student_name_kh,
                    student_name_eng: student.student_name_eng,
                    status: attendance ? attendance.status : "NO_RECORD",
                    notes: attendance ? attendance.notes : null,
                    subject: attendance && attendance.subject ? attendance.subject : null
                };
            });

            const totalStudents = students.length;

            res.status(200).json({
                success: true,
                data: {
                    class: {
                        class_id : classInfo.class_id,
                        class_name : classInfo.class_name
                    },
                    date: date || "all_time",
                    total_students: totalStudents,
                    statistics: {
                        present: presentCount,
                        absent: absentCount,
                        late: lateCount,
                        excused: excusedCount,
                        no_record: noRecordCount,
                        attendance_rate: totalStudents > 0 ? (
                            (presentCount / totalStudents) * 100
                        ).toFixed(2) + "%" : "0%"
                    },
                    students: studentSummary
                }
            });
        } catch (error) {
            console.error("Class summary error:", error);
            res.status(500).json({success: false, message: "Error generating class attendance summary", error: error.message});
        }
    }

    // ==================== WEEKLY GRID & DASHBOARD ====================

    async getWeeklyGridMultiSubject(req, res) {
        try {
            const {
                start_date,
                end_date,
                class_id,
                page = 1,
                limit = 50,
                search = ""
            } = req.query; // Default defaults

            if (!start_date || !end_date) {
                return res.status(400).json({success: false, message: "start_date and end_date parameters are required"});
            }

            if (!class_id) {
                return res.status(400).json({success: false, message: "class_id parameter is required"});
            }

            const classInfo = await Class.findByPk(class_id);
            if (! classInfo) {
                return res.status(404).json({success: false, message: "Class not found"});
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Build where clause for students
            const studentWhere = {
                class_id
            };
            if (search) {
                studentWhere[Op.or] = [
                    {
                        student_name_eng: {
                            [Op.like]: `%${search}%`
                        }
                    }, {
                        student_name_kh: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ];
                if (!isNaN(parseInt(search))) {
                    studentWhere[Op.or].push({student_id: parseInt(search)});
                }
            }

            // Get students with pagination
            const {count: totalStudents, rows: students} = await Student.findAndCountAll({
                where: studentWhere,
                attributes: [
                    "student_id", "student_name_kh", "student_name_eng", "gender",
                ],
                order: [
                    ["student_id", "ASC"]
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // Get all subjects that have attendance in this period
            const subjectsInPeriod = await Attendance.findAll({
                where: {
                    attendance_date: {
                        [Op.between]: [start_date, end_date]
                    }
                },
                include: [
                    {
                        model: Student,
                        as: "student",
                        where: {
                            class_id
                        },
                        attributes: []
                    }, {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_id", "subject_name"]
                    },
                ],
                attributes: [],
                group: [
                    "subject.subject_id", "subject.subject_name"
                ],
                raw: true
            });

            // Get unique subjects
            const subjects = subjectsInPeriod.map((s) => ({subject_id: s["subject.subject_id"], subject_name: s["subject.subject_name"]}));

            // Get attendance records for the date range AND the students on this page
            const studentIds = students.map(s => s.student_id);

            const attendanceRecords = await Attendance.findAll({
                where: {
                    attendance_date: {
                        [Op.between]: [start_date, end_date]
                    },
                    student_id: {
                        [Op. in]: studentIds
                    }
                },
                include: [
                    {
                        model: Student,
                        as: "student",
                        where: {
                            class_id
                        },
                        attributes: []
                    },
                ],
                attributes: [
                    "student_id",
                    "attendance_date",
                    "subject_id",
                    "session",
                    "status",
                    "notes",
                ],
                raw: true
            });

            // Generate date range array
            const dateRange = [];
            let currentDate = new Date(start_date);
            const endDateObj = new Date(end_date);

            while (currentDate <= endDateObj) {
                dateRange.push(currentDate.toISOString().split("T")[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Build attendance grid with multiple subjects per day
            const attendanceGrid = students.map((student, index) => {
                const studentAttendance = {};
                // Get all attendance records for this student on this date
                dateRange.forEach((date) => {
                    const dayRecords = attendanceRecords.filter((r) => r.student_id === student.student_id && r.attendance_date === date,);

                    // Group by subject
                    studentAttendance[date] = {
                        subjects: {},
                        summary: {
                            P: 0,
                            A: 0,
                            L: 0,
                            E: 0,
                            total: 0
                        }
                    };

                    dayRecords.forEach((record) => {
                        if (! studentAttendance[date].subjects[record.subject_id]) {
                            studentAttendance[date].subjects[record.subject_id] = [];
                        }
                        studentAttendance[date].subjects[record.subject_id].push({session: record.session, status: record.status, notes: record.notes});

                        // Update summary
                        studentAttendance[date].summary[record.status]++;
                        studentAttendance[date].summary.total ++;
                    });
                });

                // Calculate overall student statistics
                let totalP = 0,
                    totalA = 0,
                    totalL = 0,
                    totalE = 0,
                    totalRecords = 0;

                Object.values(studentAttendance).forEach((day) => {
                    totalP += day.summary.P;
                    totalA += day.summary.A;
                    totalL += day.summary.L;
                    totalE += day.summary.E;
                    totalRecords += day.summary.total;
                });

                return {
                    row_number: parseInt(offset) + index + 1,
                    student_id: student.student_id,
                    student_name_kh: student.student_name_kh,
                    student_name_eng: student.student_name_eng,
                    gender: student.gender,
                    attendance: studentAttendance,
                    statistics: {
                        present: totalP,
                        absent: totalA,
                        late: totalL,
                        excused: totalE,
                        total_records: totalRecords,
                        attendance_rate: totalRecords > 0 ? (
                            (totalP / totalRecords) * 100
                        ).toFixed(1) + "%" : "0%"
                    }
                };
            });

            // Calculate daily statistics by subject
            const dailyStatistics = {};
            dateRange.forEach((date) => {
                const dayRecords = attendanceRecords.filter((r) => r.attendance_date === date,);

                dailyStatistics[date] = {
                    by_subject: {},
                    total: {
                        present: dayRecords.filter((r) => r.status === "P").length,
                        absent: dayRecords.filter((r) => r.status === "A").length,
                        late: dayRecords.filter((r) => r.status === "L").length,
                        excused: dayRecords.filter((r) => r.status === "E").length,
                        total: dayRecords.length
                    }
                };

                // Group by subject
                subjects.forEach((subject) => {
                    const subjectRecords = dayRecords.filter((r) => r.subject_id === subject.subject_id,);
                    dailyStatistics[date].by_subject[subject.subject_id] = {
                        subject_name: subject.subject_name,
                        present: subjectRecords.filter((r) => r.status === "P").length,
                        absent: subjectRecords.filter((r) => r.status === "A").length,
                        late: subjectRecords.filter((r) => r.status === "L").length,
                        excused: subjectRecords.filter((r) => r.status === "E").length,
                        total: subjectRecords.length
                    };
                });
            });

            // Calculate overall statistics
            const overallStats = {
                total_students: students.length,
                total_days: dateRange.length,
                total_subjects: subjects.length,
                present: attendanceRecords.filter((r) => r.status === "P").length,
                absent: attendanceRecords.filter((r) => r.status === "A").length,
                late: attendanceRecords.filter((r) => r.status === "L").length,
                excused: attendanceRecords.filter((r) => r.status === "E").length
            };

            overallStats.total_records = attendanceRecords.length;
            overallStats.attendance_rate = overallStats.total_records > 0 ? ((overallStats.present / overallStats.total_records) * 100).toFixed(1,) + "%" : "0%";

            res.status(200).json({
                success: true,
                data: {
                    class: {
                        class_id : classInfo.class_id,
                        class_name : classInfo.class_name
                    },
                    period: {
                        start_date,
                        end_date,
                        dates: dateRange,
                        total_days: dateRange.length
                    },
                    subjects: subjects,
                    students: attendanceGrid,
                    daily_statistics: dailyStatistics,
                    overall_statistics: overallStats,
                    pagination: {
                        total: totalStudents,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(totalStudents / parseInt(limit))
                    }
                }
            });
        } catch (error) {
            console.error("Weekly grid multi-subject error:", error);
            res.status(500).json({success: false, message: "Error generating weekly attendance grid", error: error.message});
        }
    }
    async getWeeklyGridBySchedule(req, res) {
        try {
            const {start_date, end_date, class_id} = req.query;

            if (!start_date || !end_date || !class_id) {
                return res.status(400).json({success: false, message: "start_date, end_date, and class_id are required"});
            }


            const classInfo = await Class.findByPk(class_id);
            if (! classInfo) {
                return res.status(404).json({success: false, message: "Class not found"});
            }

            const students = await Student.findAll({
                where: {
                    class_id
                },
                order: [
                    ["student_id", "ASC"]
                ]
            });

            const attendanceRecords = await Attendance.findAll({
                where: {
                    attendance_date: {
                        [Op.between]: [start_date, end_date]
                    }
                },
                include: [
                    {
                        model: Student,
                        as: "student",
                        where: {
                            class_id
                        },
                        attributes: []
                    }, {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_id", "subject_name"]
                    },
                ],
                order: [
                    [
                        "attendance_date", "ASC"
                    ],
                    [
                        "subject_id", "ASC"
                    ],
                ]
            });

            // Build schedule structure: date -> subject -> students
            const dateRange = [];
            let currentDate = new Date(start_date);
            const endDateObj = new Date(end_date);

            while (currentDate <= endDateObj) {
                dateRange.push(currentDate.toISOString().split("T")[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Create schedule map
            const schedule = {};
            dateRange.forEach((date) => {
                const dayOfWeek = new Date(date).toLocaleDateString("en-US", {weekday: "long"});
                schedule[date] = {
                    day_of_week: dayOfWeek,
                    subjects: []
                };
            });

            // Populate schedule with actual subjects from attendance
            attendanceRecords.forEach((record) => {
                const date = record.attendance_date;
                const subjectId = record.subject.subject_id;
                const subjectName = record.subject.subject_name;

                if (! schedule[date].subjects.find((s) => s.subject_id === subjectId)) {
                    schedule[date].subjects.push({subject_id: subjectId, subject_name: subjectName, session: record.session});
                }
            });

            // Build student attendance grid
            const studentGrid = students.map((student, index) => {
                const attendance = {};

                dateRange.forEach((date) => {
                    attendance[date] = {
                        subjects: []
                    };

                    schedule[date].subjects.forEach((scheduleSubject) => {
                        const record = attendanceRecords.find((r) => r.student_id === student.student_id && r.attendance_date === date && r.subject.subject_id === scheduleSubject.subject_id,);

                        attendance[date].subjects.push({
                            subject_id: scheduleSubject.subject_id,
                            subject_name: scheduleSubject.subject_name,
                            session: scheduleSubject.session,
                            status: record ? record.status : null,
                            notes: record ? record.notes : null
                        });
                    });
                });

                return {
                    row_number: index + 1,
                    student_id: student.student_id,
                    student_name_kh: student.student_name_kh,
                    student_name_eng: student.student_name_eng,
                    gender: student.gender,
                    attendance: attendance
                };
            });

            res.status(200).json({
                success: true,
                data: {
                    class: {
                        class_id : classInfo.class_id,
                        class_name : classInfo.class_name
                    },
                    period: {
                        start_date,
                        end_date,
                        dates: dateRange
                    },
                    schedule: schedule,
                    students: studentGrid
                }
            });
        } catch (error) {
            console.error("Weekly grid by schedule error:", error);
            res.status(500).json({success: false, message: "Error generating schedule-based grid", error: error.message});
        }
    }

    // Get weekly chart data for line chart
    getWeeklyChartData = async (req, res) => {
        try {
            const {
                class_id,
                week_offset = 0
            } = req.query;
            const offset = parseInt(week_offset) || 0;

            // Helper: format Date as YYYY-MM-DD using LOCAL timezone (not UTC)
            const toLocalDate = (d) => {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };

            const dayNamesMap = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
            ];

            // Calculate the week's Monday and Sunday
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
            const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMonday + (offset * 7));
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const startDate = toLocalDate(monday);
            const endDate = toLocalDate(sunday);

            // Generate all 7 days
            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                days.push(toLocalDate(d));
            }

            // Build where clause for attendance
            const whereClause = {
                attendance_date: {
                    [Op.between]: [startDate, endDate]
                }
            };

            // Include student filter for class_id
            const includeClause = class_id ? [{
                    model: Student,
                    as: "student",
                    attributes: [],
                    where: {
                        class_id: parseInt(class_id)
                    }
                }] : [];

            // Get grouped stats
            const stats = await Attendance.findAll({
                where: whereClause,
                include: includeClause,
                attributes: [
                    "attendance_date",
                    "status",
                    [
                        sequelize.fn("COUNT", sequelize.col("Attendance.attendance_id")),
                        "count"
                    ]
                ],
                group: [
                    "attendance_date", "status"
                ],
                raw: true
            });

            // Build daily data
            const chartData = days.map((date, index) => {
                const dayStats = stats.filter(s => s.attendance_date === date);
                const P = dayStats.find(s => s.status === "P");
                const A = dayStats.find(s => s.status === "A");
                const L = dayStats.find(s => s.status === "L");
                const E = dayStats.find(s => s.status === "E");

                // Derive day name from actual date (not index)
                const dateObj = new Date(date + 'T00:00:00');
                const dayName = dayNamesMap[dateObj.getDay()];

                return {
                    date,
                    day: dayName,
                    present: P ? parseInt(P.count) : 0,
                    absent: A ? parseInt(A.count) : 0,
                    late: L ? parseInt(L.count) : 0,
                    excused: E ? parseInt(E.count) : 0,
                    total: (P ? parseInt(P.count) : 0) + (A ? parseInt(A.count) : 0) + (L ? parseInt(L.count) : 0) + (E ? parseInt(E.count) : 0)
                };
            });

            // Calculate week totals
            const weekTotals = chartData.reduce((acc, day) => ({
                present: acc.present + day.present,
                absent: acc.absent + day.absent,
                late: acc.late + day.late,
                excused: acc.excused + day.excused,
                total: acc.total + day.total
            }), {
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                total: 0
            });

            weekTotals.attendance_rate = weekTotals.total > 0 ? ((weekTotals.present / weekTotals.total) * 100).toFixed(1) + "%" : "0%";

            res.status(200).json({
                success: true,
                data: {
                    period: {
                        start_date: startDate,
                        end_date: endDate,
                        week_offset: offset
                    },
                    chart_data: chartData,
                    week_totals: weekTotals
                }
            });
        } catch (error) {
            console.error("Weekly chart data error:", error);
            res.status(500).json({success: false, message: "Error generating weekly chart data", error: error.message});
        }
    };

    // Helper for Dashboard to get overall most present / absent subjects
    getSubjectInsights = async (start_date, end_date, class_id) => {
        try {
            const {Op, fn, col} = require('sequelize');
            const Attendance = require('../models/Attendance');
            const Subject = require('../models/Subject');
            const Student = require('../models/Student');

            const where = {
                attendance_date: {
                    [Op.between]: [start_date, end_date]
                }
            };

            const records = await Attendance.findAll({
                attributes: [
                    'subject_id',
                    'status',
                    [
                        fn('COUNT', col('status')),
                        'count'
                    ]
                ],
                where,
                include: [
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_name", "subject_code"]
                    }, {
                        model: Student,
                        as: "student",
                        attributes: [],
                        ...(class_id && {
                            where: {
                                class_id
                            }
                        })
                    }
                ],
                group: [
                    'subject_id',
                    'status',
                    'subject.subject_id',
                    'subject.subject_name',
                    'subject.subject_code'
                ],
                raw: true,
                nest: true
            });

            const subjectMap = {};
            records.forEach(r => {
                const sId = r.subject_id;
                if (! subjectMap[sId]) {
                    subjectMap[sId] = {
                        subject_id: sId,
                        subject_name: r.subject.subject_name,
                        subject_code: r.subject.subject_code,
                        P: 0,
                        A: 0,
                        L: 0,
                        E: 0,
                        total: 0
                    };
                }
                const count = parseInt(r.count, 10) || 0;
                if (r.status === 'P') 
                    subjectMap[sId].P += count;
                 else if (r.status === 'A') 
                    subjectMap[sId].A += count;
                 else if (r.status === 'L') 
                    subjectMap[sId].L += count;
                 else if (r.status === 'E') 
                    subjectMap[sId].E += count;
                
                subjectMap[sId].total += count;
            });

            const subjectStats = Object.values(subjectMap).map(s => {
                s.attendance_rate = s.total > 0 ? ((s.P / s.total) * 100).toFixed(1) + "%" : "0.0%";
                return s;
            });

            let mostPresent = null;
            let mostAbsent = null;

            if (subjectStats.length > 0) {
                const validPresent = subjectStats.filter(s => s.P > 0);
                if (validPresent.length) {
                    mostPresent = validPresent.reduce((prev, current) => (prev.P > current.P) ? prev : current);
                }
                const validAbsent = subjectStats.filter(s => s.A > 0);
                if (validAbsent.length) {
                    mostAbsent = validAbsent.reduce((prev, current) => (prev.A > current.A) ? prev : current);
                }
            }

            return {
                stats: subjectStats, // We can limit this if needed
                most_present_subject: mostPresent,
                most_absent_subject: mostAbsent
            };
        } catch (error) {
            console.error("getSubjectInsights error:", error);
            return {stats: [], most_present_subject: null, most_absent_subject: null};
        }
    };

    // Get dashboard summary statistics
    getDashboardSummary = async (req, res) => {
        try {
            const {date, class_id} = req.query;
            const targetDate = date || new Date().toISOString().split("T")[0];

            // Get today's attendance stats
            const todayStats = await this.getDayStats(targetDate, class_id);

            // Get week stats (last 7 days)
            const weekStart = new Date(targetDate);
            weekStart.setDate(weekStart.getDate() - 6);
            const weekStats = await this.getPeriodStats(weekStart.toISOString().split("T")[0], targetDate, class_id,);

            // Get month stats (last 30 days)
            const monthStart = new Date(targetDate);
            monthStart.setDate(monthStart.getDate() - 29);
            const monthStartDateStr = monthStart.toISOString().split("T")[0];
            const monthStats = await this.getPeriodStats(monthStartDateStr, targetDate, class_id,);

            // Overall subject insights (for the month)
            const subjectInsights = await this.getSubjectInsights(monthStartDateStr, targetDate, class_id);

            // Get students with low attendance (< 75%)
            const studentsAtRisk = await this.getStudentsAtRisk(class_id);

            // Get recent absences
            const weekStartDate = new Date(targetDate);
            weekStartDate.setDate(weekStartDate.getDate() - 6);

            const recentAbsences = await Attendance.findAll({
                where: {
                    status: "A",
                    attendance_date: {
                        [Op.gte]: weekStartDate.toISOString().split("T")[0]
                    }
                },
                include: [
                    {
                        model: Student,
                        as: "student",
                        attributes: [
                            "student_id", "student_name_eng", "student_name_kh"
                        ],
                        ...(class_id && {
                            where: {
                                class_id
                            }
                        })
                    },
                ],
                order: [
                    ["attendance_date", "DESC"]
                ],
                limit: 10
            });

            res.status(200).json({
                success: true,
                data: {
                    today: todayStats,
                    this_week: weekStats,
                    this_month: monthStats,
                    students_at_risk: studentsAtRisk,
                    recent_absences: recentAbsences,
                    subject_insights: subjectInsights,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error("Dashboard summary error:", error);
            res.status(500).json({success: false, message: "Error generating dashboard summary", error: error.message});
        }
    };

    // Get monthly calendar view
    async getMonthlyCalendar(req, res) {
        try {
            const {year, month, class_id} = req.query;

            if (!year || !month) {
                return res.status(400).json({success: false, message: "year and month parameters are required"});
            }

            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);

            const start_date = firstDay.toISOString().split("T")[0];
            const end_date = lastDay.toISOString().split("T")[0];

            const dates = [];
            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d).toISOString().split("T")[0]);
            }

            const dailyStats = {};
            const whereClause = {
                attendance_date: {
                    [Op.between]: [start_date, end_date]
                }
            };

            const stats = await Attendance.findAll({
                where: whereClause,
                attributes: [
                    "attendance_date",
                    "status",
                    [
                        sequelize.fn("COUNT", sequelize.col("status")),
                        "count"
                    ],
                ],
                ...(class_id && {
                    include: [
                        {
                            model: Student,
                            as: "student",
                            attributes: [],
                            where: {
                                class_id
                            }
                        },
                    ]
                }),
                group: [
                    "attendance_date", "status"
                ],
                raw: true
            });

            dates.forEach((date) => {
                dailyStats[date] = {
                    date,
                    day_of_week: new Date(date).getDay(),
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    total: 0
                };
            });

            stats.forEach((stat) => {
                const date = stat.attendance_date;
                const count = parseInt(stat.count);
                dailyStats[date][stat.status === "P" ? "present" : stat.status === "A" ? "absent" : stat.status === "L" ? "late" : "excused"] = count;
                dailyStats[date].total += count;
            });

            res.status(200).json({
                success: true,
                data: {
                    year: parseInt(year),
                    month: parseInt(month),
                    month_name: new Date(year, month - 1).toLocaleString("default", {month: "long"}),
                    total_days: dates.length,
                    daily_statistics: dailyStats,
                    class_id: class_id || "all"
                }
            });
        } catch (error) {
            console.error("Monthly calendar error:", error);
            res.status(500).json({success: false, message: "Error generating monthly calendar", error: error.message});
        }
    }

    // Export weekly grid as Excel
    async exportWeeklyGridExcel(req, res) {
        try {
            const XLSX = require('xlsx');
            const {start_date, end_date, class_id} = req.query;

            if (!start_date || !end_date || !class_id) {
                return res.status(400).json({success: false, message: "start_date, end_date, and class_id are required"});
            }

            // Get the class info
            const classInfo = await Class.findByPk(class_id);
            const className = classInfo ? classInfo.class_name : "Unknown Class";

            // Get students
            const students = await Student.findAll({
                where: {
                    class_id
                },
                order: [
                    ["student_id", "ASC"]
                ]
            });

            // Get attendance records with Subjects
            const attendanceRecords = await Attendance.findAll({
                where: {
                    attendance_date: {
                        [Op.between]: [start_date, end_date]
                    }
                },
                include: [
                    {
                        model: Student,
                        as: "student",
                        where: {
                            class_id
                        },
                        attributes: []
                    }, {
                        model: Subject,
                        as: "subject",
                        attributes: ["subject_id", "subject_name", "subject_code"]
                    }
                ],
                // Or use nested property access with raw: true
                raw: true,
                nest: true
            });

            // Generate date range
            const dateRange = [];
            let currentDate = new Date(start_date);
            const endDateObj = new Date(end_date);
            while (currentDate <= endDateObj) {
                dateRange.push(currentDate.toISOString().split("T")[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Identify subjects for each date
            const schedule = {};
            dateRange.forEach(date => {
                schedule[date] = [];
            });

            attendanceRecords.forEach(record => {
                const date = record.attendance_date;
                const subj = record.subject;
                if (! schedule[date].find(s => s.subject_id === subj.subject_id)) {
                    schedule[date].push({subject_id: subj.subject_id, subject_name: subj.subject_name, subject_code: subj.subject_code});
                }
            });
            // Sort subjects by ID for consistency
            Object.keys(schedule).forEach(date => {
                schedule[date].sort((a, b) => a.subject_id - b.subject_id);
            });


            // Prepare Excel Data (Array of Arrays)
            const wsData = [];

            // 1. Title Row
            wsData.push([`Weekly Attendance Report - ${className}`]);
            wsData.push([`Period: ${start_date} to ${end_date}`]);
            wsData.push([]);

            // 2. Header Row (2 Levels)
            // Top Header: Date Groups
            const topHeader = ["No", "Name (Khmer)", "Name (English)", "Gender"];
            const subHeader = ["", "", "", ""]; // Fillers for student info cols

            dateRange.forEach(date => {
                const dateSubjects = schedule[date];
                const colSpan = dateSubjects.length > 0 ? dateSubjects.length : 1;

                // Add Date to Top Header
                topHeader.push(date);
                // Add fillers for colspan
                for (let i = 1; i < colSpan; i++) {
                    topHeader.push("");
                }

                // Add Subjects to Sub Header
                if (dateSubjects.length > 0) {
                    dateSubjects.forEach(s => {
                        subHeader.push(s.subject_name); // Or Code
                    });
                } else {
                    subHeader.push("-");
                }
            });

            // Add Stats Headers
            topHeader.push("Statistics", "", "", "", "");
            subHeader.push("P", "A", "L", "E", "Rate (%)");

            // Merge Handling is complex in basic array of arrays for xlsx without 'merges' property
            // We will construct the 'merges' array for the sheet manually

            wsData.push(topHeader);
            wsData.push(subHeader);


            // 3. Data Rows
            students.forEach((student, idx) => {
                const row = [
                    idx + 1,
                    student.student_name_kh,
                    student.student_name_eng,
                    student.gender
                ];

                let p = 0,
                    a = 0,
                    l = 0,
                    e = 0;

                dateRange.forEach(date => {
                    const dateSubjects = schedule[date];
                    if (dateSubjects.length > 0) {
                        dateSubjects.forEach(subj => {
                            const record = attendanceRecords.find(r => r.student_id === student.student_id && r.attendance_date === date && r.subject.subject_id === subj.subject_id);
                            const status = record ? record.status : "";
                            row.push(status);

                            if (status === "P") 
                                p++;
                             else if (status === "A") 
                                a++;
                             else if (status === "L") 
                                l++;
                             else if (status === "E") 
                                e++;
                            


                        });
                    } else {
                        row.push("");
                    }
                });
                // Stats
                const total = p + a + l + e;
                const rate = total > 0 ? ((p / total) * 100).toFixed(1) : "0.0";
                row.push(p, a, l, e, `${rate}%`);

                wsData.push(row);
            });
            // Create Workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            // Calculate Merges
            const merges = [
                // Merge Title?
                {
                    s: {
                        r: 0,
                        c: 0
                    },
                    e: {
                        r: 0,
                        c: 8
                    }
                },
                { // Title row span
                    s: {
                        r: 1,
                        c: 0
                    },
                    e: {
                        r: 1,
                        c: 8
                    }
                },
                {
                    s: {
                        r: 3,
                        c: 0
                    },
                    e: {
                        r: 4,
                        c: 0
                    }
                },
                { // No
                    s: {
                        r: 3,
                        c: 1
                    },
                    e: {
                        r: 4,
                        c: 1
                    }
                }, { // Name KH
                    s: {
                        r: 3,
                        c: 2
                    },
                    e: {
                        r: 4,
                        c: 2
                    }
                }, { // Name EN
                    s: {
                        r: 3,
                        c: 3
                    },
                    e: {
                        r: 4,
                        c: 3
                    }
                }, // Gender
            ];

            // Merge Date Columns
            let colIndex = 4;
            dateRange.forEach(date => {
                const dateSubjects = schedule[date];
                const span = dateSubjects.length > 0 ? dateSubjects.length : 1;
                if (span > 1) {
                    merges.push({
                        s: {
                            r: 3,
                            c: colIndex
                        },
                        e: {
                            r: 3,
                            c: colIndex + span - 1
                        }
                    });
                }
                colIndex += span;
            });

            // Merge Stats Header
            // The stats start at current colIndex
            merges.push({
                s: {
                    r: 3,
                    c: colIndex
                },
                e: {
                    r: 3,
                    c: colIndex + 4
                }
            });


            ws['!merges'] = merges;

            // Auto-width (basic approximation)
            /*
            const wscols = [
                {wch:5}, {wch:20}, {wch:20}, {wch:5} // Student info widths
            ];
            ws['!cols'] = wscols; 
            */


            // Append Worksheet
            XLSX.utils.book_append_sheet(wb, ws, "Attendance");

            // Generate Buffer
            const buffer = XLSX.write(wb, {
                type: "buffer",
                bookType: "xlsx"
            });

            // Send Response
            const fileName = `Attendance_${className}_${start_date}_to_${end_date}.xlsx`.replace(/ /g, "_");
            res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);

        } catch (error) {
            console.error("Export Excel error:", error);
            res.status(500).json({success: false, message: "Error exporting attendance to Excel", error: error.message});
        }
    }

    // ── Student Subject Stats ──────────────────────────────────────────────────
    /**
     * GET /api/v1/attendance/reports/student-subjects?student_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     *
     * Returns per-subject counts of P / A / L / E for a student,
     * sorted so the frontend can easily find "most present" and "most absent".
     */
    getStudentSubjectStats = asyncHandler(async (req, res) => {
        const {student_id, start_date, end_date} = req.query;

        if (!student_id) {
            return sendError(res, 'student_id parameter is required', 400);
        }

        // Verify student exists
        const student = await Student.findByPk(student_id, {
            attributes: ['student_id', 'student_name_eng', 'student_name_kh']
        });
        if (! student) {
            return sendNotFound(res, 'Student');
        }

        // Build where clause
        const whereClause = {
            student_id
        };
        if (start_date && end_date) {
            whereClause.attendance_date = {
                [Op.between]: [start_date, end_date]
            };
        } else if (start_date) {
            whereClause.attendance_date = {
                [Op.gte]: start_date
            };
        } else if (end_date) {
            whereClause.attendance_date = {
                [Op.lte]: end_date
            };
        }

        // Aggregate per subject + status
        const rawStats = await Attendance.findAll({
            where: whereClause,
            attributes: [
                'subject_id',
                'status',
                [
                    sequelize.fn('COUNT', sequelize.col('status')),
                    'count'
                ],
            ],
            include: [
                {
                    model: Subject,
                    as: 'subject',
                    attributes: ['subject_id', 'subject_name', 'subject_code']
                },
            ],
            group: [
                'subject_id', 'status', 'subject.subject_id'
            ],
            raw: true
        });

        // Build a map: subject_id -> { subject_name, subject_code, P, A, L, E, total }
        const subjectMap = {};

        rawStats.forEach((row) => {
            const sid = row['subject_id'];
            if (! subjectMap[sid]) {
                subjectMap[sid] = {
                    subject_id: sid,
                    subject_name: row['subject.subject_name'] || `Subject #${sid}`,
                    subject_code: row['subject.subject_code'] || '',
                    P: 0,
                    A: 0,
                    L: 0,
                    E: 0,
                    total: 0
                };
            }
            const count = parseInt(row['count'], 10) || 0;
            if (['P', 'A', 'L', 'E'].includes(row.status)) {
                subjectMap[sid][row.status] += count;
            }
            subjectMap[sid].total += count;
        });

        // Convert to sorted arrays
        const subjects = Object.values(subjectMap).map((s) => ({
            ...s,
            attendance_rate: s.total > 0 ? (
                (s.P / s.total) * 100
            ).toFixed(1) + '%' : '0.0%'
        }));

        // Most-present  = highest P count
        // Most-absent   = highest A count
        const byPresent = [... subjects].sort((a, b) => b.P - a.P);
        const byAbsent = [... subjects].sort((a, b) => b.A - a.A);

        return sendSuccess(res, {
            student: {
                student_id: student.student_id,
                student_name_eng: student.student_name_eng,
                student_name_kh: student.student_name_kh
            },
            period: {
                start_date: start_date || null,
                end_date: end_date || null
            },
            subjects,
            most_present_subject: byPresent[0] || null,
            most_absent_subject: byAbsent[0] || null,
            by_present: byPresent,
            by_absent: byAbsent
        }, 'Student subject stats fetched successfully');
    });
}

module.exports = new AttendanceController();
