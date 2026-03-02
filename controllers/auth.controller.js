const {User, Student, Teacher} = require("../models/Index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {Op} = require("sequelize");
const sendEmail = require("../utils/sendEmail");
const {sendSuccess, sendError, sendUnauthorized, asyncHandler} = require("../middlewares/response.middleware");

const register = asyncHandler(async (req, res) => {
    const {username, password, role, profile_id} = req.body;

    if (!(username && password && role)) {
        return sendError(res, "All input is required", 400);
    }

    const oldUser = await User.findOne({where: {
            username
        }});

    if (oldUser) {
        return sendError(res, "User Already Exist. Please Login", 409);
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

    return sendSuccess(res, {
        user,
        token
    }, "User registered successfully", 201);
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

        return sendSuccess(res, {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            profile_id: user.profile_id,
            profile: profile,
            token: token
        }, "Login successful");
    }

    return sendUnauthorized(res, "Invalid Credentials");
});

const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return sendError(res, "Please provide an email", 400);
    }

    const user = await User.findOne({
        where: {
            email: email.toLowerCase()
        }
    });

    if (! user) {
        return sendError(res, "There is no user with that email", 404);
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to reset_password_token field
    // We are going to save the raw token in this case just to be simpler, or hashed.
    // Let's hash it for security
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({reset_password_token: resetPasswordToken, reset_password_expire: resetPasswordExpire});

    // Create reset url
    // This assumes your frontend runs on localhost:4200. Modify if deployed somewhere else
    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;

    // For local testing, print the URL to the console
    console.log(`\n\n=== PASSWORD RESET LINK ===\n${resetUrl}\n===========================\n\n`);

    const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Password Reset Request</h2>
            <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p style="margin-top: 20px; color: #777;">This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
    `;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_real_gmail_address@gmail.com') {
            await sendEmail({email: user.email, subject: 'Password Reset', message: `Please make a PUT request to: \n\n ${resetUrl}`, html: message});
        }

        return sendSuccess(res, null, "Email sent");
    } catch (err) {
        console.error(err);
        await user.update({reset_password_token: null, reset_password_expire: null});

        return sendError(res, "Email could not be sent", 500);
    }
});

const resetPassword = asyncHandler(async (req, res) => { // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        where: {
            reset_password_token: resetPasswordToken,
            reset_password_expire: {
                [Op.gt]: new Date()
            }
        }
    });

    if (! user) {
        return sendError(res, "Invalid token or token has expired", 400);
    }

    if (!req.body.password) {
        return sendError(res, "Please provide a new password", 400);
    }

    // Encrypt new password
    const encryptedPassword = await bcrypt.hash(req.body.password, 10);

    // Set new password
    await user.update({password: encryptedPassword, reset_password_token: null, reset_password_expire: null});

    return sendSuccess(res, null, "Password reset successfully. You can now log in.");
});

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
