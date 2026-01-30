const {User, Student, Teacher} = require("../models/Index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const {username, password, role, profile_id} = req.body;

        if (!(username && password && role)) {
            return res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({where: {
                username
            }});
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        // Encrypt password
        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({username: username.toLowerCase(), password: encryptedPassword, role: role, profile_id: profile_id});

        // Create token
        const token = jwt.sign({
            user_id: user.user_id,
            username: username,
            role: role,
            profile_id: profile_id
        }, process.env.TOKEN_KEY || "secret_key", {expiresIn: "24h"});

        // return new user
        res.status(201).json({user, token});
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const login = async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!(username && password)) {
            return res.status(400).send("All input is required");
        }

        const user = await User.findOne({
            where: {
                username: username.toLowerCase()
            }
        });

        if (user && (await bcrypt.compare(password, user.password))) { // Create token
            const token = jwt.sign({
                user_id: user.user_id,
                username: username,
                role: user.role,
                profile_id: user.profile_id
            }, process.env.TOKEN_KEY || "secret_key", {expiresIn: "24h"});

            // Verify profile existence if relevant
            let profile = null;
            if (user.role === 'student' && user.profile_id) {
                profile = await Student.findByPk(user.profile_id);
            } else if (user.role === 'teacher' && user.profile_id) {
                profile = await Teacher.findByPk(user.profile_id);
            }

            return res.status(200).json({
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                profile_id: user.profile_id,
                profile: profile,
                token: token
            });
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    register,
    login
};
