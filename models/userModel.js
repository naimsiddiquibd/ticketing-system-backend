const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  nid: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'ticket-checker'],
    default: 'user'
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true }); // Enable timestamps

// Export the User model
module.exports = mongoose.model('User', userSchema);
