const express = require('express');
const { registerUser, loginUser, currentUser, forgetPassword, resetPassword, getUserById } = require('../controllers/userController');
const validateToken = require('../middleware/validateTokenHandler');
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

// Add routes for forget password and reset password
router.post("/forget-password", forgetPassword);

router.post("/reset-password", resetPassword);

// Add this route for fetching a user by ID
router.get("/users/:id", getUserById);


module.exports = router;
