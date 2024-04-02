// [SECTION] Dependencies and Modules
const express = require("express");

const userController = require("../controllers/user");

// [SECTION] Routing Component
const router = express.Router();

const {verify, verifyAdmin} = require("../auth");

// [SECTION] Route for user registration
router.post("/", userController.registerUser);

// [SECTION] Route for user authentication
router.post("/login", userController.loginUser);

// [SECTION] Route for retrieving User Details
router.get("/details", verify, userController.getProfile);

// [SECTION] Route for updating user as admin
router.patch('/:userId/set-as-admin', verify, verifyAdmin, userController.updateUserByAdmin);

// [SECTION] Route for resetting the password
router.patch('/update-password', verify, userController.updatePassword);

// [SECTION] Route for updating user profile
router.patch("/update-profile", verify, userController.updateProfile);

module.exports = router;