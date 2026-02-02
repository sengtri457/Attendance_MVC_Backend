const {User, Student, Teacher} = require("../models/Index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendSuccess,
  sendError,
  sendUnauthorized,
  asyncHandler
} = require("../middlewares/response.middleware");

const register = asyncHandler(async (req, res) => {
    const {username, password, role, profile_id} = req.body;

    if (!(username && password && role)) {
        return sendError(res, "All input is required", 400);
    }

    const oldUser = await User.findOne({
        where: {
            username
        }
    });
    
    if (oldUser) {
        return sendError(res, "User Already Exist. Please Login", 409);
    }

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username.toLowerCase(),
        password: encryptedPassword,
        role: role,
        profile_id: profile_id
    });

    // Create token
    const token = jwt.sign({
        user_id: user.user_id,
        username: username,
        role: role,
        profile_id: profile_id
    }, process.env.TOKEN_KEY || "secret_key", {expiresIn: "24h"});

    return sendSuccess(res, {user, token}, "User registered successfully", 201);
});

const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;

    if (!(username && password)) {
        return sendError(res, "All input is required", 400);
    }

    const user = await User.findOne({
        where: {
            username: username.toLowerCase()
        }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
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

        return sendSuccess(res, {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            profile_id: user.profile_id,
            profile: profile,
            token: token
        }, "Login successful");
    }
    
    return sendUnauthorized(res, "Invalid Credentials");
});

module.exports = {
    register,
    login
};
