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
    type: String,
    ref: 'User',
    required: true,
    index: true, // Create an index for efficient duplicate check
  },
  status: {
    type: String,
    enum: ['available', 'purchased', 'checked-in', 'approved'],
    default: 'available'
  }
}, { timestamps: true }); // Enable timestamps

// Create a unique compound index
ticketSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Export the Ticket model
module.exports = mongoose.model('Ticket', ticketSchema);