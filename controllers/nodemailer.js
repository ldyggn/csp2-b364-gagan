// [SECTION] Dependencies and Modules

const User = require("../models/User");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// [STRETCH GOAL] Update Password with Email Confirmation/Notification
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Disable SSL/TLS
    auth: {
        user: "carroll52@ethereal.email",
        pass: "Wm7y3435er98WeXzsn",
    },
    tls: {
        rejectUnauthorized: false // Disable SSL/TLS certificate validation
    },
});

module.exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

        // Update the user's password
        const updatedUser = await User.findByIdAndUpdate(userId, { password: bcrypt.hashSync(newPassword, 10) }, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Send an email notification
        const mailOptions = {
            from: 'carroll52@ethereal.email',
            to: updatedUser.email,
            subject: 'Password Update Notification',
            text: 'Your password has been successfully updated.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).send({ message: 'Password updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

module.exports.registerUser = async (req, res) => {
    try {
        // Create a new user object
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        // Save the new user to the database
        await newUser.save();

        // Send email confirmation
        const mailOptions = {
            from: 'carroll52@ethereal.email',
            to: req.body.email,
            subject: 'Welcome to Our Website - Email Confirmation',
            text: 'Thank you for registering with our website. Please click on the following link to confirm your email address: https://example.com/confirm-email/' + newUser._id
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(201).send({ message: "Registration successful. Please check your email for confirmation." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Endpoint for confirming email
module.exports.confirmEmail = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find user by ID and update email confirmed status
        const user = await User.findByIdAndUpdate(userId, { emailConfirmed: true });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        return res.status(200).send({ message: 'Email confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

