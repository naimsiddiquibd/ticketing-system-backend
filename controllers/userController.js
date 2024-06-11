const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @Description: Register a user
// @Route: POST /api/tickets
// @Access: Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, nid, role, name } = req.body;
    
    if (!email || !password || !nid || !role || !name) {
        res.status(400);
        throw new Error("All fields are required!");
    }

    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
        res.status(400);
        throw new Error("User already registered with this email!");
    }

    const userNidExists = await User.findOne({ nid });
    if (userNidExists) {
        res.status(400);
        throw new Error("User already registered with this NID!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            email,
            password: hashedPassword,
            nid,
            role,
            name
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                nid: user.nid
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
        res.status(400);
        throw new Error("All fields are required!");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                email: user.email,
                id: user.id
            },
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "1m" });

        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("Email or password is incorrect!");
    }
});

// @Description: Get current user
// @Route: GET /api/tickets
// @Access: Public
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Current user information" });
});

module.exports = { registerUser, loginUser, currentUser };
