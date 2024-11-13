const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Ticket Schema
const ticketSchema = new Schema({
  eventId: {
    type: String,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Create an index for efficient duplicate check
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
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
  status: {
    type: String,
    enum: ['available', 'purchased', 'checked-in', 'approved'],
    default: 'available'
  },
  price: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true }); // Enable timestamps

// Create a unique compound index
ticketSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Export the Ticket model
module.exports = mongoose.model('Ticket', ticketSchema);
