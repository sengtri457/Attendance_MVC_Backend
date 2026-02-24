const {User, Student, Teacher} = require("../models/Index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {sendSuccess, sendError, sendNotFound, asyncHandler} = require("../middlewares/response.middleware");

/**
 * Get current user's profile
 */
const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
        attributes: {
            exclude: ['password']
        }
    });

    if (! user) {
        return sendNotFound(res, "User");
    }

    // Fetch linked profile (student or teacher)
    let linkedProfile = null;
    if (user.role === 'student' && user.profile_id) {
        linkedProfile = await Student.findByPk(user.profile_id);
    } else if (user.role === 'teacher' && user.profile_id) {
        linkedProfile = await Teacher.findByPk(user.profile_id);
    }

    return sendSuccess(res, {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        profile_id: user.profile_id,
        linkedProfile: linkedProfile,
        createdAt: user.created_at || user.createdAt,
        updatedAt: user.updated_at || user.updatedAt
    }, "Profile retrieved successfully");
});

/**
 * Update current user's profile (username, email, full_name)
 */
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const {username, email, full_name} = req.body;

    const user = await User.findByPk(userId);
    if (! user) {
        return sendNotFound(res, "User");
    }

    // Check if new username is already taken by another user
    if (username && username.toLowerCase() !== user.username) {
        const existingUser = await User.findOne({
            where: {
                username: username.toLowerCase()
            }
        });
        if (existingUser) {
            return sendError(res, "Username is already taken", 409);
        }
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({
            where: {
                email: email
            }
        });
        if (existingEmail) {
            return sendError(res, "Email is already in use", 409);
        }
    }

    // Update fields
    if (username) 
        user.username = username.toLowerCase();
    
    if (email !== undefined) 
        user.email = email || null;
    
    if (full_name !== undefined) 
        user.full_name = full_name || null;
    

    await user.save();

    // Generate new token with updated info
    const token = jwt.sign({
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        profile_id: user.profile_id
    }, process.env.TOKEN_KEY || "secret_key", {expiresIn: "24h"});

    return sendSuccess(res, {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        profile_id: user.profile_id,
        token: token
    }, "Profile updated successfully");
});

/**
 * Change current user's password
 */
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
        return sendError(res, "Current password and new password are required", 400);
    }

    if (newPassword.length < 6) {
        return sendError(res, "New password must be at least 6 characters long", 400);
    }

    const user = await User.findByPk(userId);
    if (! user) {
        return sendNotFound(res, "User");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (! isMatch) {
        return sendError(res, "Current password is incorrect", 401);
    }

    // Hash new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    await user.save();

    return sendSuccess(res, null, "Password changed successfully");
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
