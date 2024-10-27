const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Event Schema
const eventSchema = new Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventCategory: {
    type: String,
    enum: ['Event', 'Course'],
    default: 'Event'
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  eventStatus: {
    type: String,
    enum: ['Public', 'Draft'],
    default: 'Public'
  },
  timezone: {
    type: String,
    default: 'Dhaka'
  },
  recurringEvent: {
    type: Boolean,
    default: false
  },
  ageRestriction: {
    type: Boolean,
    default: false
  },
  dressCode: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  eventLogo: {
    type: String,  // Store path or URL of the event logo
    trim: true
  },
  thumbnail: {
    type: String,  // Store path or URL of the thumbnail
    trim: true
  },
  price: {
    type: Number,
    required: true, // Make this true if every event needs to have a price
    min: 0 // Optional: to ensure price cannot be negative
  }
}, { timestamps: true }); // Enable timestamps

// Export the Event model
module.exports = mongoose.model('Event', eventSchema);
