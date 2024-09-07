const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

// @Description: Register a user
// @Route: POST /api/tickets
// @Access: Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, nid, role, name, phoneNumber, terms } = req.body;
    
    // Check if all required fields are provided
    if (!email || !password || !nid || !name || !phoneNumber || terms !== true) {
        res.status(400);
        throw new Error("All fields are required and terms must be accepted!");
    }

    // Check if user already exists with the provided email
    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
        res.status(400);
        throw new Error("User already registered with this email!");
    }

    // Check if user already exists with the provided NID
    const userNidExists = await User.findOne({ nid });
    if (userNidExists) {
        res.status(400);
        throw new Error("User already registered with this NID!");
    }

    // Check if user already exists with the provided phone number
    const userPhoneExists = await User.findOne({ phoneNumber });
    if (userPhoneExists) {
        res.status(400);
        throw new Error("User already registered with this phone number!");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Create the user
        const user = await User.create({
            email,
            password: hashedPassword,
            nid,
            role,
            name,
            phoneNumber,
            terms
        });

        if (user) {
            // Send a success response with user details
            res.status(201).json({
                _id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                nid: user.nid,
                phoneNumber: user.phoneNumber
            });
        } else {
            res.status(400);
            throw new Error("Invalid user data");
        }
    } catch (error) {
        res.status(500);
        throw new Error("Server error");
    }
});


// @Description: Login a user
// @Route: POST /api/tickets
// @Access: Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        // Send response and return early to prevent further code execution
        res.status(400).json({ message: "All fields are required!" });
        return;
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                email: user.email,
                role: user.role,
                name: user.name,
                phoneNumber: user.phoneNumber,
                nid: user.nid,
                id: user.id
            },
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "1440m" });

        res.status(200).json({ accessToken });
    } else {
        // Send response and return early to prevent further code execution
        res.status(401).json({ message: "Email or password is incorrect!" });
        return;
    }
});


// @Description: Get current user
// @Route: GET /api/tickets
// @Access: Private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

// @Description: Initiate password reset
// @Route: POST /api/users/forget-password
// @Access: Public
const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error("Email is required!");
    }

    // Check if user exists with the provided email
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found with this email!");
    }

    // Create a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '10m' });

    // Send email with reset token (assuming you have configured nodemailer)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link below to reset your password:\n\n
        ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}\n\n
        If you did not request this, please ignore this email.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500);
            throw new Error("Error sending email");
        } else {
            res.status(200).json({ message: "Reset password email sent!" });
        }
    });
});

// @Description: Reset password
// @Route: POST /api/users/reset-password
// @Access: Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        res.status(400);
        throw new Error("Token and new password are required!");
    }

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    } catch (err) {
        res.status(400);
        throw new Error("Invalid or expired token!");
    }

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
});

// @Description: Get user by ID (only name and email)
// @Route: GET /api/users/:id
// @Access: Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('name email');

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user);
});


module.exports = { registerUser, loginUser, currentUser, forgetPassword, resetPassword, getUserById };
