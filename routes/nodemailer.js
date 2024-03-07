// [SECTION] Dependencies and Modules
const express = require("express");
const nodemailerController = require("../controllers/nodemailer");

// [SECTION] Routing Component
const router = express.Router();
const auth = require("../auth");

const {verify} = auth;

// [SECTION] Route for updating password with email confirmation/notification
router.patch('/update-password', verify, nodemailerController.updatePassword);

// [SECTION] Route for registration with email confirmation/notification
router.post('/register', nodemailerController.registerUser);

module.exports = router;