const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');

// @Description: Get all events
// @Route: GET /api/events
// @Access: Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.status(200).json(events);
});

// @Description: Create new event
// @Route: POST /api/events
// @Access: Private (Organizer)
const createEvent = asyncHandler(async (req, res) => {
  const { eventName, eventCategory, venue, startDateTime, endDateTime, timezone, recurringEvent, ageRestriction, dressCode, description, specialInstructions } = req.body;

  if (!eventName || !eventCategory || !venue || !startDateTime || !endDateTime || !timezone || !description) {
    res.status(400);
    throw new Error("All required fields must be included in the request");
  }

  const event = await Event.create({
    eventName,
    organizer: req.user.id,  // Automatically assign the logged-in user's ID as the organizer
    eventCategory,
    venue,
    startDateTime,
    endDateTime,
    timezone,
    recurringEvent,
    ageRestriction,
    dressCode,
    description,
    specialInstructions
  });

  res.status(201).json(event);
});

// @Description: Get a single event
// @Route: GET /api/events/:id
// @Access: Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }
  res.status(200).json(event);
});

// @Description: Update an event
// @Route: PUT /api/events/:id
// @Access: Private (Organizer)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }

  if (event.organizer.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User does not have permission to update this event");
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedEvent);
});

// @Description: Delete an event
// @Route: DELETE /api/events/:id
// @Access: Private (Organizer)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }

  if (event.organizer.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User does not have permission to delete this event");
  }

  await Event.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Event deleted successfully' });
});

module.exports = {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent
};
