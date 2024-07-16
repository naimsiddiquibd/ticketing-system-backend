const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Middleware to check if the user is an organizer
const organizerCheck = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'organizer') {
    res.status(403);
    throw new Error('User is not an organizer');
  }

  next();
});

module.exports = organizerCheck;
