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
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  terms: {
    type: Boolean,
    required: true,
    default: true,
    validate: {
      validator: function(value) {
        return value === true;
      },
      message: 'Terms must be accepted'
    }
  },
  resetPasswordToken: String,  // Optional: If you want to store reset tokens
  resetPasswordExpires: Date   // Optional: Token expiry time
}, { timestamps: true }); // Enable timestamps

// Export the User model
module.exports = mongoose.model('User', userSchema);
