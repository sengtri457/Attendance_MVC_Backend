const {sequelize, User, Teacher, Student} = require("../models/Index");
const bcrypt = require("bcryptjs");

const seedUsers = async () => {
    try {
        await sequelize.sync(); // Ensure tables exist

        console.log("🌱 Seeding Users...");

        const hashedPassword = await bcrypt.hash("password123", 10);
        const adminPassword = await bcrypt.hash("admin123", 10);

        // 1. Create Admin
        const adminExists = await User.findOne({
            where: {
                role: 'admin'
            }
        });
        if (! adminExists) {
            await User.create({username: "admin", password: adminPassword, role: "admin"});
            console.log("✅ Admin user created: admin / admin123");
        } else {
            console.log("ℹ️ Admin user already exists");
        }

        // 2. Create Users for Teachers
        const teachers = await Teacher.findAll();
        for (const teacher of teachers) {
            const username = teacher.teacher_name_eng.toLowerCase().replace(/\s+/g, '') + "_t";
            const exists = await User.findOne({
                where: {
                    role: 'teacher',
                    profile_id: teacher.teacher_id
                }
            });

            if (! exists) {
                await User.create({username: username, password: hashedPassword, role: "teacher", profile_id: teacher.teacher_id});
                console.log(`✅ Teacher user created: ${username} / password123`);
            }
        }

        // 3. Create Users for Students
        const students = await Student.findAll();
        for (const student of students) {
            const cleanName = student.student_name_eng.toLowerCase().replace(/[^a-z0-9]/g, '');
            const username = `${cleanName}_${
                student.student_id
            }`;
            const exists = await User.findOne({
                where: {
                    role: 'student',
                    profile_id: student.student_id
                }
            });

            if (! exists) {
                await User.create({username: username, password: hashedPassword, role: "student", profile_id: student.student_id});
                console.log(`✅ Student user created: ${username} / password123`);
            }
        }

        console.log("✨ User seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedUsers();
