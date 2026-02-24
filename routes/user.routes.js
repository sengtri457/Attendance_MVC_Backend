const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// GET /api/v1/user/profile - Get current user's profile
router.get("/profile", userController.getProfile);

// PUT /api/v1/user/profile - Update current user's profile
router.put("/profile", userController.updateProfile);

// PUT /api/v1/user/change-password - Change password
router.put("/change-password", userController.changePassword);

module.exports = router;
